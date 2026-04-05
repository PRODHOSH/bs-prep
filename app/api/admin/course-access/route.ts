import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { hasAdminRole } from "@/lib/security/admin-role"
import { writeRateLimiter } from "@/lib/rate-limit"

type EnrollmentRow = {
  user_id: string
  course_id: string
  enrolled_at: string
  payment_status: "pending" | "completed" | "failed"
}

// These course IDs are sold via Razorpay in current production flow.
const LEGACY_PAID_SKUS = [
  "qualifier-math-1",
  "qualifier-stats-1",
  "qualifier-computational-thinking",
]

async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false as const, status: 401, error: "Unauthorized", adminUserId: null }
  }

  const isAdmin = await hasAdminRole(user.id, user.email)
  if (!isAdmin) {
    return { ok: false as const, status: 403, error: "Forbidden", adminUserId: null }
  }

  return { ok: true as const, status: 200, error: null, adminUserId: user.id }
}

export async function GET() {
  try {
    const admin = await verifyAdmin()
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: admin.status })
    }

    const service = createServiceRoleClient()

    const [
      { data: courses, error: coursesError },
      { data: enrollments, error: enrollmentsError },
      { data: profiles, error: profilesError },
      { data: paymentOrders, error: paymentOrdersError },
    ] = await Promise.all([
      service.from("courses").select("id, title, type").eq("type", "paid"),
      service.from("enrollments").select("user_id, course_id, enrolled_at, payment_status"),
      service.from("profiles").select("id, first_name, last_name, email"),
      service.from("payment_orders").select("user_id, status").eq("status", "completed"),
    ])

    if (coursesError || enrollmentsError || profilesError || paymentOrdersError) {
      return NextResponse.json({ error: "Failed to load course access data" }, { status: 500 })
    }

    const { data: legacySkuCourses, error: legacySkuError } = await service
      .from("courses")
      .select("id, title")
      .in("id", LEGACY_PAID_SKUS)

    if (legacySkuError) {
      return NextResponse.json({ error: "Failed to load legacy paid courses" }, { status: 500 })
    }

    const paidCourses = [...(courses ?? []), ...(legacySkuCourses ?? [])]
      .filter((course, index, all) => all.findIndex((item) => item.id === course.id) === index)
      .map((course) => ({
      id: course.id,
      title: course.title,
    }))

    const paidCourseIds = new Set(paidCourses.map((course) => course.id))
    const paidUsersByOrder = new Set((paymentOrders ?? []).map((order) => order.user_id))
    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
    const relevantEnrollments = ((enrollments ?? []) as EnrollmentRow[]).filter((row) =>
      paidCourseIds.has(row.course_id) || paidUsersByOrder.has(row.user_id),
    )

    const grouped = new Map<
      string,
      {
        user_id: string
        name: string
        email: string
        latest_access_at: string
        courses: Array<{ course_id: string; title: string; enrolled_at: string; payment_status: string }>
      }
    >()

    for (const enrollment of relevantEnrollments) {
      const profile = profileById.get(enrollment.user_id)
      const first = (profile?.first_name ?? "").trim()
      const last = (profile?.last_name ?? "").trim()
      const fullName = `${first} ${last}`.trim() || "N/A"
      const email = profile?.email ?? "N/A"
      const courseTitle = paidCourses.find((course) => course.id === enrollment.course_id)?.title ?? enrollment.course_id

      if (!grouped.has(enrollment.user_id)) {
        grouped.set(enrollment.user_id, {
          user_id: enrollment.user_id,
          name: fullName,
          email,
          latest_access_at: enrollment.enrolled_at,
          courses: [],
        })
      }

      const row = grouped.get(enrollment.user_id)!
      row.courses.push({
        course_id: enrollment.course_id,
        title: courseTitle,
        enrolled_at: enrollment.enrolled_at,
        payment_status: enrollment.payment_status,
      })

      if (new Date(enrollment.enrolled_at).getTime() > new Date(row.latest_access_at).getTime()) {
        row.latest_access_at = enrollment.enrolled_at
      }
    }

    const students = Array.from(grouped.values())
      .map((student) => ({
        ...student,
        courses: student.courses.sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()),
      }))
      .sort((a, b) => new Date(b.latest_access_at).getTime() - new Date(a.latest_access_at).getTime())

    const grantableUsers = (profiles ?? [])
      .map((profile) => {
        const first = (profile.first_name ?? "").trim()
        const last = (profile.last_name ?? "").trim()
        const fullName = `${first} ${last}`.trim() || null
        return {
          id: profile.id,
          name: fullName,
          email: profile.email,
        }
      })
      .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""))

    return NextResponse.json({
      students,
      paidCourses,
      grantableUsers,
      stats: {
        studentsWithPaidAccess: students.length,
        totalPaidEnrollments: relevantEnrollments.length,
      },
    })
  } catch (error) {
    console.error("Admin course access GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: admin.status })
    }

    const rl = await writeRateLimiter.check(admin.adminUserId)
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) } },
      )
    }

    const body = (await req.json()) as { userId?: string; courseId?: string }
    const userId = typeof body.userId === "string" ? body.userId.trim() : ""
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : ""

    if (!userId || !courseId) {
      return NextResponse.json({ error: "userId and courseId are required" }, { status: 400 })
    }

    const service = createServiceRoleClient()

    const [{ data: userProfile }, { data: paidCourse }] = await Promise.all([
      service.from("profiles").select("id").eq("id", userId).maybeSingle(),
      service.from("courses").select("id, type").eq("id", courseId).maybeSingle(),
    ])

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!paidCourse || (paidCourse.type !== "paid" && !LEGACY_PAID_SKUS.includes(paidCourse.id))) {
      return NextResponse.json({ error: "Eligible paid course not found" }, { status: 404 })
    }

    const { error: upsertError } = await service.from("enrollments").upsert(
      {
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        payment_status: "completed",
      },
      {
        onConflict: "user_id,course_id",
      },
    )

    if (upsertError) {
      return NextResponse.json({ error: "Failed to grant access" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Course access granted" })
  } catch (error) {
    console.error("Admin course access POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: admin.status })
    }

    const rl = await writeRateLimiter.check(admin.adminUserId)
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) } },
      )
    }

    const body = (await req.json()) as { userId?: string; courseId?: string }
    const userId = typeof body.userId === "string" ? body.userId.trim() : ""
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : ""

    if (!userId || !courseId) {
      return NextResponse.json({ error: "userId and courseId are required" }, { status: 400 })
    }

    const service = createServiceRoleClient()
    const { error } = await service.from("enrollments").delete().eq("user_id", userId).eq("course_id", courseId)

    if (error) {
      return NextResponse.json({ error: "Failed to revoke access" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Course access revoked" })
  } catch (error) {
    console.error("Admin course access DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}