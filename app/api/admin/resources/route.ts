import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { hasAdminRole } from "@/lib/security/admin-role"
import { validateAndSanitizeInput } from "@/lib/security/validation"

const RESOURCE_BUCKET = "resource-pdfs"

type AdminStatus = "pending" | "approved" | "rejected"

async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false as const, status: 401, user: null }
  }

  const isAdmin = await hasAdminRole(user.id, user.email)

  if (!isAdmin) {
    return { ok: false as const, status: 403, user: null }
  }

  return { ok: true as const, status: 200, user }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin.ok) {
      return NextResponse.json(
        {
          error:
            admin.status === 401
              ? "Unauthorized"
              : "Forbidden - Admin access required. Set role='admin' in public.profiles for your account.",
        },
        { status: admin.status },
      )
    }

    const status = (request.nextUrl.searchParams.get("status") ?? "pending") as AdminStatus
    const allowed = new Set<AdminStatus>(["pending", "approved", "rejected"])
    if (!allowed.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    let compatibilityWarning: string | null = null

    let [{ data: rows, error: rowsError }, { data: profiles, error: profilesError }] =
      await Promise.all([
        supabase
          .from("resource_submissions")
          .select("id, user_id, level, resource_type, title, description, admin_description, pdf_path, status, review_notes, created_at, reviewed_at")
          .eq("status", status)
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, email, first_name, last_name"),
      ])

    if ((rowsError as { code?: string } | null)?.code === "42703") {
      const legacyRows = await supabase
        .from("resource_submissions")
        .select("id, user_id, title, description, pdf_path, status, review_notes, created_at, reviewed_at")
        .eq("status", status)
        .order("created_at", { ascending: false })

      rows = legacyRows.data as typeof rows
      rowsError = legacyRows.error
      compatibilityWarning = "Resources schema is partially outdated. Run latest migration scripts for level/type fields."

      if ((rowsError as { code?: string } | null)?.code === "42703") {
        const minimalLegacyRows = await supabase
          .from("resource_submissions")
          .select("id, user_id, title, description, pdf_path, status, created_at")
          .eq("status", status)
          .order("created_at", { ascending: false })

        rows = minimalLegacyRows.data as typeof rows
        rowsError = minimalLegacyRows.error
        compatibilityWarning = "Resources schema is outdated. Review metadata columns are missing; run latest migration scripts."
      }
    }

    if (rowsError) {
      if ((rowsError as { code?: string }).code === "42P01") {
        return NextResponse.json(
          {
            submissions: [],
            warning: "Resource setup pending. Run DB migration scripts first.",
          },
          { status: 200 },
        )
      }

      const details = (rowsError as { message?: string } | null)?.message
      return NextResponse.json({ error: details || "Failed to load submissions" }, { status: 500 })
    }

    if (profilesError) {
      compatibilityWarning = compatibilityWarning || "Profile details unavailable; showing submissions without student names."
      profiles = []
    }

    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))

    const submissions = (rows ?? []).map((row) => {
      const profile = profileById.get(row.user_id)
      const {
        data: { publicUrl },
      } = supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(row.pdf_path)

      return {
        id: row.id,
        user_id: row.user_id,
        student_email: profile?.email ?? "N/A",
        student_name: `${(profile?.first_name ?? "").trim()} ${(profile?.last_name ?? "").trim()}`.trim() || "N/A",
        level: (row as { level?: string }).level ?? "other",
        resource_type: (row as { resource_type?: string }).resource_type ?? "other",
        title: row.title,
        description: row.description,
        admin_description: (row as { admin_description?: string | null }).admin_description ?? null,
        status: row.status,
        review_notes: row.review_notes,
        created_at: row.created_at,
        reviewed_at: row.reviewed_at,
        pdf_url: publicUrl,
      }
    })

    return NextResponse.json({ submissions, warning: compatibilityWarning })
  } catch (error) {
    console.error("Admin resources GET error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin.ok) {
      return NextResponse.json(
        {
          error:
            admin.status === 401
              ? "Unauthorized"
              : "Forbidden - Admin access required. Set role='admin' in public.profiles for your account.",
        },
        { status: admin.status },
      )
    }

    const body = (await request.json()) as {
      submissionId?: string
      status?: AdminStatus
      reviewNotes?: string
      adminDescription?: string
    }

    const submissionId = typeof body.submissionId === "string" ? body.submissionId.trim() : ""
    const status = body.status

    if (!submissionId || (status !== "approved" && status !== "rejected")) {
      return NextResponse.json({ error: "submissionId and valid status are required" }, { status: 400 })
    }

    let reviewNotes: string | null = null
    if (typeof body.reviewNotes === "string" && body.reviewNotes.trim().length > 0) {
      const noteValidation = validateAndSanitizeInput(body.reviewNotes, 1000)
      if (!noteValidation.valid) {
        return NextResponse.json({ error: "Invalid review notes" }, { status: 400 })
      }
      reviewNotes = noteValidation.sanitized
    }

    let adminDescription: string | null = null
    if (typeof body.adminDescription === "string" && body.adminDescription.trim().length > 0) {
      const descValidation = validateAndSanitizeInput(body.adminDescription, 220)
      if (!descValidation.valid) {
        return NextResponse.json({ error: "Invalid short description" }, { status: 400 })
      }
      adminDescription = descValidation.sanitized
    }

    const supabase = createServiceRoleClient()
    let { error } = await supabase
      .from("resource_submissions")
      .update({
        status,
        review_notes: reviewNotes,
        admin_description: adminDescription,
        reviewed_by: admin.user!.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .eq("status", "pending")

    if ((error as { code?: string } | null)?.code === "42703") {
      const fallbackUpdate = await supabase
        .from("resource_submissions")
        .update({
          status,
          review_notes: reviewNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", submissionId)
        .eq("status", "pending")

      error = fallbackUpdate.error
    }

    if (error) {
      const details = (error as { message?: string } | null)?.message
      return NextResponse.json({ error: details || "Failed to update submission" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin resources PATCH error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
