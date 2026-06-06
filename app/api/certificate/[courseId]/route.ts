import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { hasAdminRole } from "@/lib/security/admin-role"

const COURSE_NAMES: Record<string, string> = {
  "qualifier-math-1":                "Mathematics for Data Science I",
  "qualifier-stats-1":               "Statistics for Data Science I",
  "qualifier-computational-thinking": "Computational Thinking",
  "qualifier-english-1":             "English I",
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params

  if (!COURSE_NAMES[courseId]) {
    return NextResponse.json({ error: "Unknown course" }, { status: 404 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
  }

  const service = createServiceRoleClient()

  // Admins can preview any certificate without being enrolled
  const isAdmin = await hasAdminRole(user.id, user.email)

  if (!isAdmin) {
    const { data: enroll } = await service
      .from("enrollments")
      .select("enrolled_at")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle()

    if (!enroll) {
      return NextResponse.json({ error: "not_enrolled" }, { status: 403 })
    }
  }

  const { data: cert } = await service
    .from("course_certificates")
    .select("enabled, enabled_at")
    .eq("course_id", courseId)
    .maybeSingle()

  if (!cert?.enabled && !isAdmin) {
    return NextResponse.json({ error: "cert_not_available" }, { status: 403 })
  }

  const { data: profile } = await service
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()

  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student"

  return NextResponse.json({
    studentName: name,
    courseName: COURSE_NAMES[courseId],
    issueDate: new Date(cert?.enabled_at ?? new Date()).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    }),
    isAdminPreview: isAdmin && !cert?.enabled,
  })
}
