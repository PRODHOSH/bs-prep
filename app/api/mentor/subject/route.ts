import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { hasMentorRole } from "@/lib/security/mentor-role"
import { SUBJECT_CHAT_COURSES, SUBJECT_CHAT_COURSE_IDS } from "@/lib/chat/constants"
import { getMentorSubjectCourseIds } from "@/lib/chat/server"

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

    const isMentor = await hasMentorRole(user.id, user.email)
    if (!isMentor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const service = createServiceRoleClient()
    const { data: profile, error: profileError } = await service
      .from("profiles")
      .select("mentor_subject, mentor_subjects")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: "Failed to load mentor subject" }, { status: 500 })
    }

    const selectedCourseIds = getMentorSubjectCourseIds(profile)

    return NextResponse.json({
      mentor_subject: selectedCourseIds[0] ?? null,
      mentor_subjects: selectedCourseIds,
      selected_course_ids: selectedCourseIds,
      options: SUBJECT_CHAT_COURSES,
    })
  } catch (error) {
    console.error("Mentor subject GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isMentor = await hasMentorRole(user.id, user.email)
    if (!isMentor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = (await request.json()) as { courseId?: string; courseIds?: string[] }

    const rawCourseIds = [
      ...(Array.isArray(body.courseIds) ? body.courseIds : []),
      ...(typeof body.courseId === "string" && body.courseId ? [body.courseId] : []),
    ]

    const courseIds = Array.from(
      new Set(rawCourseIds.map((item) => String(item).trim()).filter((item) => SUBJECT_CHAT_COURSE_IDS.has(item))),
    )

    if (courseIds.length === 0) {
      return NextResponse.json({ error: "Invalid subject selection" }, { status: 400 })
    }

    const primaryCourseId = courseIds[0]

    const service = createServiceRoleClient()

    const { data: updatedProfile, error: updateError } = await service
      .from("profiles")
      .update({
        mentor_subject: primaryCourseId,
        mentor_subjects: courseIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("id")
      .maybeSingle()

    if (updateError && updateError.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to save mentor subject" }, { status: 500 })
    }

    if (!updatedProfile) {
      const { error: upsertError } = await service
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? "",
            role: "mentor",
            mentor_subject: primaryCourseId,
            mentor_subjects: courseIds,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )

      if (upsertError) {
        return NextResponse.json({ error: "Failed to save mentor subject" }, { status: 500 })
      }
    }

    await service.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        mentor_subject: primaryCourseId,
        mentor_subjects: courseIds,
      },
    })

    return NextResponse.json({
      success: true,
      mentor_subject: primaryCourseId,
      mentor_subjects: courseIds,
      selected_course_ids: courseIds,
    })
  } catch (error) {
    console.error("Mentor subject PATCH error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
