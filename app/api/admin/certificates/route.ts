import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { hasAdminRole } from "@/lib/security/admin-role"
import { createClient } from "@/lib/supabase/server"

import { courses as COURSES } from "@/lib/course-catalog"

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const ok = await hasAdminRole(user.id, user.email)
  return ok ? user : null
}

// GET /api/admin/certificates — list all courses with cert status
export async function GET() {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const service = createServiceRoleClient()

  let map: Record<string, { enabled: boolean; enabled_at: string | null }> = {}
  try {
    const { data, error } = await service
      .from("course_certificates")
      .select("course_id, enabled, enabled_at")

    if (!error && data) {
      map = Object.fromEntries(data.map((r) => [r.course_id, r]))
    }
  } catch {
    // table not created yet — return all disabled
  }

  const result = COURSES.map((c) => ({
    ...c,
    enabled: map[c.id]?.enabled ?? false,
    enabled_at: map[c.id]?.enabled_at ?? null,
  }))

  return NextResponse.json(result)
}

// POST /api/admin/certificates — { course_id, enabled }
export async function POST(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { course_id, enabled } = body as { course_id: string; enabled: boolean }

  const course = COURSES.find((c) => c.id === course_id)
  if (!course) return NextResponse.json({ error: "Unknown course" }, { status: 400 })

  const service = createServiceRoleClient()

  const { error } = await service.from("course_certificates").upsert({
    course_id,
    course_title: course.title,
    enabled,
    enabled_at: enabled ? new Date().toISOString() : null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // When enabling: post an announcement so enrolled students are notified
  if (enabled) {
    await service.from("announcements").insert({
      title: `🎓 Certificate available — ${course.title}`,
      message: `Your certificate for "${course.title}" is now ready. Visit the course page to download it.`,
      display_hours: 168, // 1 week
    })
  }

  return NextResponse.json({ ok: true })
}
