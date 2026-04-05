import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

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

function ratingsSetupErrorResponse() {
  return NextResponse.json(
    { error: "Ratings setup pending. Run scripts/019_create_resource_ratings.sql in Supabase SQL Editor, then refresh the project API cache." },
    { status: 503 },
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as { resourceId?: string }
    const resourceId = typeof body.resourceId === "string" ? body.resourceId.trim() : ""

    if (!resourceId) {
      return NextResponse.json({ error: "resourceId is required" }, { status: 400 })
    }

    const service = createServiceRoleClient()

    const tableProbe = await service.from("resource_ratings").select("id").limit(1)
    if (tableProbe.error && isRatingsTableMissingError(tableProbe.error)) {
      return ratingsSetupErrorResponse()
    }

    if (tableProbe.error) {
      return NextResponse.json({ error: tableProbe.error.message || "Failed to verify ratings setup" }, { status: 500 })
    }

    const { data: targetResource, error: resourceError } = await service
      .from("resource_submissions")
      .select("id")
      .eq("id", resourceId)
      .eq("status", "approved")
      .maybeSingle()

    if (resourceError || !targetResource) {
      return NextResponse.json({ error: "Resource not found or not approved" }, { status: 404 })
    }

    const { data: existingRating, error: existingError } = await service
      .from("resource_ratings")
      .select("id")
      .eq("resource_submission_id", resourceId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingError && isRatingsTableMissingError(existingError)) {
      return ratingsSetupErrorResponse()
    }

    if (existingError) {
      return NextResponse.json({ error: existingError.message || "Failed to load rating state" }, { status: 500 })
    }

    let rated: boolean

    if (existingRating?.id) {
      const { error: deleteError } = await service.from("resource_ratings").delete().eq("id", existingRating.id)
      if (deleteError) {
        return NextResponse.json({ error: deleteError.message || "Failed to remove rating" }, { status: 500 })
      }
      rated = false
    } else {
      const { error: insertError } = await service.from("resource_ratings").insert({
        resource_submission_id: resourceId,
        user_id: user.id,
      })
      if (insertError) {
        if (isRatingsTableMissingError(insertError)) {
          return ratingsSetupErrorResponse()
        }
        return NextResponse.json({ error: insertError.message || "Failed to add rating" }, { status: 500 })
      }
      rated = true
    }

    const { count, error: countError } = await service
      .from("resource_ratings")
      .select("id", { count: "exact", head: true })
      .eq("resource_submission_id", resourceId)

    if (countError && isRatingsTableMissingError(countError)) {
      return ratingsSetupErrorResponse()
    }

    if (countError) {
      return NextResponse.json({ error: countError.message || "Failed to count ratings" }, { status: 500 })
    }

    return NextResponse.json({ success: true, rated, ratingCount: count ?? 0 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
