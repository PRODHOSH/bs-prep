import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { validateAndSanitizeInput } from "@/lib/security/validation"
import { writeRateLimiter } from "@/lib/rate-limit"

function toDisplayName(firstName: string, lastName: string): string | null {
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName.length > 0 ? fullName : null
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = createServiceRoleClient()
    const { data: profile, error: profileError } = await service
      .from("profiles")
      .select("id, email, first_name, last_name, role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Settings profile GET error:", profileError)
      return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
    }

    const fallbackFirst = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name.trim() : ""
    const fallbackLast = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name.trim() : ""

    return NextResponse.json({
      profile: {
        id: user.id,
        email: profile?.email ?? user.email ?? null,
        first_name: profile?.first_name ?? fallbackFirst,
        last_name: profile?.last_name ?? fallbackLast,
        role: profile?.role ?? "student",
      },
    })
  } catch (error) {
    console.error("Settings profile GET exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const rl = await writeRateLimiter.check(ip)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const firstNameRaw = typeof body?.first_name === "string" ? body.first_name : ""
    const lastNameRaw = typeof body?.last_name === "string" ? body.last_name : ""

    const firstNameValidation = validateAndSanitizeInput(firstNameRaw, 100)
    const lastNameValidation = validateAndSanitizeInput(lastNameRaw, 100)

    if (!firstNameValidation.valid || !lastNameValidation.valid) {
      return NextResponse.json({ error: "Invalid first name or last name" }, { status: 400 })
    }

    const sanitizedFirstName = firstNameValidation.sanitized
    const sanitizedLastName = lastNameValidation.sanitized

    const service = createServiceRoleClient()
    const { data: profile, error: updateError } = await service
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email ?? null,
        first_name: sanitizedFirstName || null,
        last_name: sanitizedLastName || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })
      .select("id, first_name, last_name")
      .single()

    if (updateError) {
      console.error("Settings profile update error:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // Keep auth metadata in sync so UI paths that read user metadata stay consistent.
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        first_name: sanitizedFirstName || null,
        last_name: sanitizedLastName || null,
        full_name: toDisplayName(sanitizedFirstName, sanitizedLastName),
      },
    })

    if (metadataError) {
      console.warn("Settings profile metadata sync warning:", metadataError)
    }

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("Settings profile PATCH error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
