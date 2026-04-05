import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { validateAndSanitizeInput } from "@/lib/security/validation"
import { deleteGoogleDriveFile, resolveResourcePdfUrl, uploadPdfToGoogleDrive } from "@/lib/google-drive"
const MAX_PDF_SIZE_BYTES = 45 * 1024 * 1024
const MAX_PDF_SIZE_MB = Math.floor(MAX_PDF_SIZE_BYTES / (1024 * 1024))

const ALLOWED_LEVELS = ["foundation", "diploma", "degree", "other"] as const
const ALLOWED_RESOURCE_TYPES = ["course-material", "activity", "notes", "assignment", "other"] as const

type AllowedLevel = (typeof ALLOWED_LEVELS)[number]
type AllowedResourceType = (typeof ALLOWED_RESOURCE_TYPES)[number]

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
}

function formatProfileName(profile?: { first_name?: string | null; last_name?: string | null; email?: string | null }) {
  const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
  return fullName || profile?.email || "Unknown"
}

function isRatingsTableMissingError(error: unknown): boolean {
  const code = String((error as { code?: string } | null)?.code ?? "")
  const message = String((error as { message?: string } | null)?.message ?? "").toLowerCase()

  if (code === "42P01" || code.startsWith("PGRST")) {
    if (message.includes("resource_ratings") && (message.includes("schema cache") || message.includes("not found") || message.includes("does not exist"))) {
      return true
    }
  }

  return false
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Please sign in to access resources",
          resources: [],
          mySubmissions: [],
          isAuthenticated: false,
          ratingsEnabled: false,
          levels: ALLOWED_LEVELS,
          resourceTypes: ALLOWED_RESOURCE_TYPES,
        },
        { status: 401 },
      )
    }

    const service = createServiceRoleClient()

    let { data: approvedRows, error: approvedError } = await service
      .from("resource_submissions")
      .select("id, user_id, reviewed_by, reviewed_at, course_id, title, description, admin_description, level, resource_type, pdf_path, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    let compatibilityWarning: string | null = null

    // Backward compatibility for DBs that still use old schema (without level/resource_type).
    if ((approvedError as { code?: string } | null)?.code === "42703") {
      const legacyRes = await service
        .from("resource_submissions")
        .select("id, user_id, reviewed_by, reviewed_at, course_id, title, description, pdf_path, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })

      approvedRows = legacyRes.data as typeof approvedRows
      approvedError = legacyRes.error
      compatibilityWarning = "Resources schema is partially outdated. Admin should run latest migration scripts."

      if ((approvedError as { code?: string } | null)?.code === "42703") {
        const minimalLegacyRes = await service
          .from("resource_submissions")
          .select("id, user_id, course_id, title, description, pdf_path, created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })

        approvedRows = minimalLegacyRes.data as typeof approvedRows
        approvedError = minimalLegacyRes.error
      }
    }

    if (approvedError) {
      if ((approvedError as { code?: string }).code === "42P01") {
        return NextResponse.json(
          {
            resources: [],
            mySubmissions: [],
            isAuthenticated: Boolean(user),
            levels: ALLOWED_LEVELS,
            resourceTypes: ALLOWED_RESOURCE_TYPES,
            warning: "Resource setup pending. Admin needs to run DB migration scripts.",
          },
          { status: 200 },
        )
      }

      return NextResponse.json({ error: "Failed to load resources" }, { status: 500 })
    }

    const allProfileIds = Array.from(
      new Set(
        (approvedRows ?? [])
          .flatMap((row) => [(row as { user_id?: string | null }).user_id, (row as { reviewed_by?: string | null }).reviewed_by])
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    )

    const profileById = new Map<string, { first_name: string | null; last_name: string | null; email: string | null }>()
    if (allProfileIds.length > 0) {
      const { data: profileRows } = await service
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", allProfileIds)

      for (const profile of profileRows ?? []) {
        profileById.set(profile.id, {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
        })
      }
    }

    const courseIds = Array.from(
      new Set(
        (approvedRows ?? [])
          .map((row) => (row as { course_id?: string | null }).course_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    )

    const courseById = new Map<string, { title: string }>()
    if (courseIds.length > 0) {
      const { data: courseRows } = await service.from("courses").select("id, title").in("id", courseIds)
      for (const course of courseRows ?? []) {
        courseById.set(course.id, { title: course.title })
      }
    }

    const resourceIds = (approvedRows ?? []).map((row) => row.id)
    const ratingCountByResource = new Map<string, number>()
    const userRatedSet = new Set<string>()
    let ratingsEnabled = true

    if (resourceIds.length > 0) {
      const { data: ratingRows, error: ratingsError } = await service
        .from("resource_ratings")
        .select("resource_submission_id, user_id")
        .in("resource_submission_id", resourceIds)

      if (!ratingsError) {
        for (const row of ratingRows ?? []) {
          ratingCountByResource.set(
            row.resource_submission_id,
            (ratingCountByResource.get(row.resource_submission_id) ?? 0) + 1,
          )

          if (user && row.user_id === user.id) {
            userRatedSet.add(row.resource_submission_id)
          }
        }
      } else if (isRatingsTableMissingError(ratingsError)) {
        compatibilityWarning = compatibilityWarning
          ? `${compatibilityWarning} Ratings setup pending.`
          : "Ratings setup pending. Run latest migration scripts."
        ratingsEnabled = false
      }
    }

    const resources = (approvedRows ?? []).map((row) => {
      const uploaderProfile = profileById.get((row as { user_id?: string | null }).user_id ?? "")
      const approverProfile = profileById.get((row as { reviewed_by?: string | null }).reviewed_by ?? "")

      const finalDescription = (row as { admin_description?: string | null }).admin_description || row.description

      return {
        id: row.id,
        title: row.title,
        description: finalDescription,
        course_id: (row as { course_id?: string | null }).course_id ?? null,
        course_title: courseById.get((row as { course_id?: string | null }).course_id ?? "")?.title ?? "General Resource",
        level: (row as { level?: string }).level ?? "other",
        resource_type: (row as { resource_type?: string }).resource_type ?? "other",
        pdf_url: resolveResourcePdfUrl(row.pdf_path),
        created_at: row.created_at,
        uploaded_by: formatProfileName(uploaderProfile),
        approved_by: formatProfileName(approverProfile),
        approved_at: (row as { reviewed_at?: string | null }).reviewed_at ?? row.created_at,
        rating_count: ratingCountByResource.get(row.id) ?? 0,
        user_has_rated: userRatedSet.has(row.id),
      }
    })

    let mySubmissions: Array<{
      id: string
      title: string
      pdf_url: string | null
      course_id: string | null
      course_title: string
      level: string
      resource_type: string
      status: string
      created_at: string
      review_notes: string | null
    }> = []

    if (user) {
      let { data: ownRows, error: ownError } = await service
        .from("resource_submissions")
        .select("id, title, course_id, level, resource_type, status, created_at, review_notes, pdf_path")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if ((ownError as { code?: string } | null)?.code === "42703") {
        const legacyOwn = await service
          .from("resource_submissions")
          .select("id, title, course_id, status, created_at, review_notes, pdf_path")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        ownRows = legacyOwn.data as typeof ownRows
        ownError = legacyOwn.error

        if ((ownError as { code?: string } | null)?.code === "42703") {
          const minimalLegacyOwn = await service
            .from("resource_submissions")
            .select("id, title, course_id, status, created_at, pdf_path")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          ownRows = minimalLegacyOwn.data as typeof ownRows
          ownError = minimalLegacyOwn.error
        }
      }

      if (!ownError) {
        const ownCourseIds = Array.from(
          new Set(
            (ownRows ?? [])
              .map((row) => (row as { course_id?: string | null }).course_id)
              .filter((id): id is string => typeof id === "string" && id.length > 0),
          ),
        )

        const ownCourseById = new Map<string, { title: string }>()
        if (ownCourseIds.length > 0) {
          const { data: ownCourseRows } = await service.from("courses").select("id, title").in("id", ownCourseIds)
          for (const course of ownCourseRows ?? []) {
            ownCourseById.set(course.id, { title: course.title })
          }
        }

        mySubmissions = (ownRows ?? []).map((row) => {
          return {
            id: row.id,
            title: row.title,
            course_id: (row as { course_id?: string | null }).course_id ?? null,
            course_title: ownCourseById.get((row as { course_id?: string | null }).course_id ?? "")?.title ?? "General Resource",
            level: (row as { level?: string }).level ?? "other",
            resource_type: (row as { resource_type?: string }).resource_type ?? "other",
            status: row.status,
            created_at: row.created_at,
            review_notes: row.review_notes,
            pdf_url: resolveResourcePdfUrl((row as { pdf_path?: string | null }).pdf_path),
          }
        })
      }
    }

    return NextResponse.json({
      resources,
      mySubmissions,
      isAuthenticated: Boolean(user),
      ratingsEnabled,
      levels: ALLOWED_LEVELS,
      resourceTypes: ALLOWED_RESOURCE_TYPES,
      warning: compatibilityWarning,
    })
  } catch (error) {
    console.error("Resources GET error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const form = await request.formData()
    const titleRaw = String(form.get("title") ?? "")
    const descriptionRaw = String(form.get("description") ?? "")
    const levelRaw = String(form.get("level") ?? "").toLowerCase().trim()
    const typeRaw = String(form.get("resourceType") ?? "").toLowerCase().trim()
    const file = form.get("pdf")

    const titleValidation = validateAndSanitizeInput(titleRaw, 180)
    const descriptionValidation = validateAndSanitizeInput(descriptionRaw, 2500)

    if (!titleValidation.valid || titleValidation.sanitized.length < 3) {
      return NextResponse.json({ error: "Valid title is required" }, { status: 400 })
    }

    if (!descriptionValidation.valid || descriptionValidation.sanitized.length < 10) {
      return NextResponse.json({ error: "Valid description is required" }, { status: 400 })
    }

    if (!ALLOWED_LEVELS.includes(levelRaw as AllowedLevel)) {
      return NextResponse.json({ error: "Please select a valid level" }, { status: 400 })
    }

    if (!ALLOWED_RESOURCE_TYPES.includes(typeRaw as AllowedResourceType)) {
      return NextResponse.json({ error: "Please select a valid resource type" }, { status: 400 })
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 })
    }

    const isPdfMime = file.type === "application/pdf"
    const isPdfName = file.name.toLowerCase().endsWith(".pdf")

    if (!isPdfMime && !isPdfName) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    if (file.size <= 0 || file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json({ error: `PDF must be between 1 byte and ${MAX_PDF_SIZE_MB} MB` }, { status: 400 })
    }

    const service = createServiceRoleClient()

    // Ensure DB schema exists before uploading any file to Drive.
    const tableProbe = await service.from("resource_submissions").select("id").limit(1)
    if (tableProbe.error && (tableProbe.error as { code?: string }).code === "42P01") {
      return NextResponse.json(
        {
          error:
            "Database setup incomplete: table public.resource_submissions is missing. Run scripts/016_create_resource_submissions.sql and scripts/017_alter_resource_submissions_for_levels.sql in Supabase SQL Editor.",
        },
        { status: 500 },
      )
    }

    if (tableProbe.error) {
      const probeMessage = (tableProbe.error as { message?: string } | null)?.message
      return NextResponse.json({ error: probeMessage || "Failed to verify resource table" }, { status: 500 })
    }

    const safeName = sanitizeFileName(file.name)
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    let uploadedFileId: string | null = null
    let uploadedToDrive = false
    try {
      const uploadResult = await uploadPdfToGoogleDrive({
        fileName: safeName,
        fileBuffer,
      })
      uploadedFileId = uploadResult.fileId
      uploadedToDrive = true
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to upload PDF"
      const normalizedMessage = message.toLowerCase()

      // If Google credentials are not configured, fall back to Supabase storage.
      if (normalizedMessage.includes("google credentials are missing")) {
        const fallbackPath = `${user.id}/${Date.now()}-${safeName}`
        const fallbackUpload = await service.storage.from("resource-pdfs").upload(fallbackPath, fileBuffer, {
          contentType: "application/pdf",
          upsert: false,
        })

        if (fallbackUpload.error) {
          return NextResponse.json(
            { error: `Google credentials missing and Supabase fallback upload failed: ${fallbackUpload.error.message}` },
            { status: 500 },
          )
        }

        uploadedFileId = fallbackPath
        uploadedToDrive = false
      }

      if (message.toLowerCase().includes("google drive folder is not configured")) {
        return NextResponse.json({ error: message }, { status: 500 })
      }
      if (message.toLowerCase().includes("too large")) {
        return NextResponse.json({ error: `PDF is too large. Please upload up to ${MAX_PDF_SIZE_MB} MB.` }, { status: 400 })
      }

      if (!uploadedFileId) {
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }

    const baseInsertPayload = {
      user_id: user.id,
      level: levelRaw,
      resource_type: typeRaw,
      title: titleValidation.sanitized,
      description: descriptionValidation.sanitized,
      pdf_path: uploadedFileId,
      status: "pending",
    }

    const legacyInsertPayload = {
      user_id: user.id,
      title: titleValidation.sanitized,
      description: descriptionValidation.sanitized,
      pdf_path: uploadedFileId,
      status: "pending",
    }

    let { error: insertError } = await service.from("resource_submissions").insert(baseInsertPayload)

    // Old schema may not have level/resource_type.
    if ((insertError as { code?: string } | null)?.code === "42703") {
      const legacyInsert = await service.from("resource_submissions").insert(legacyInsertPayload)
      insertError = legacyInsert.error
    }

    const insertCode = (insertError as { code?: string } | null)?.code
    const insertMessage = String((insertError as { message?: string } | null)?.message ?? "").toLowerCase()
    const mayNeedCourseId = insertCode === "23502" || insertCode === "23503" || insertMessage.includes("course_id")

    // Old schema may require course_id. If so, attach any existing course id and retry.
    if (insertError && mayNeedCourseId) {
      const { data: fallbackCourse, error: courseLookupError } = await service
        .from("courses")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!courseLookupError && fallbackCourse?.id) {
        const retryPayload =
          (insertCode === "42703" ? legacyInsertPayload : baseInsertPayload) as typeof baseInsertPayload & { course_id?: string }
        const retryInsert = await service
          .from("resource_submissions")
          .insert({ ...retryPayload, course_id: fallbackCourse.id })

        insertError = retryInsert.error
      }
    }

    if (insertError) {
      if (uploadedFileId) {
        try {
          if (uploadedToDrive) {
            await deleteGoogleDriveFile(uploadedFileId)
          } else {
            await service.storage.from("resource-pdfs").remove([uploadedFileId])
          }
        } catch (cleanupError) {
          console.warn("Failed to clean up uploaded PDF after insert error:", cleanupError)
        }
      }

      const code = (insertError as { code?: string }).code
      const message = (insertError as { message?: string } | null)?.message
      if (code === "42P01") {
        return NextResponse.json(
          {
            error:
              "Database setup incomplete: table public.resource_submissions is missing. Run scripts/016_create_resource_submissions.sql and scripts/017_alter_resource_submissions_for_levels.sql in Supabase SQL Editor.",
          },
          { status: 500 },
        )
      }

      if (code === "42703" || code === "23502" || code === "23503") {
        return NextResponse.json(
          { error: `Database migration pending: ${message || "schema mismatch"}. Please ask admin to run latest resource migration scripts.` },
          { status: 500 },
        )
      }

      return NextResponse.json({ error: message || "Failed to save submission" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Submitted for admin approval" }, { status: 201 })
  } catch (error) {
    if (error instanceof TypeError && String(error.message).includes("FormData")) {
      return NextResponse.json(
        { error: `Upload too large or invalid multipart form data. Please upload a PDF up to ${MAX_PDF_SIZE_MB} MB.` },
        { status: 413 },
      )
    }

    console.error("Resources POST error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
