import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { getEnrolledSubjectCourseIds, getMentorSubjectCourseIds } from "@/lib/chat/server"
import { hasMentorRole } from "@/lib/security/mentor-role"

type MentorProfileRow = {
  id: string
  role: string | null
  mentor_subject: string | null
  mentor_subjects: string[] | null
}

type DirectChatRow = {
  id: string
}

type UserRoleRow = {
  id: string
  role: string | null
  mentor_subject: string | null
  mentor_subjects: string[] | null
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

    const body = (await request.json()) as { mentorId?: string; studentId?: string; targetUserId?: string }
    const mentorIdFromBody = typeof body.mentorId === "string" ? body.mentorId.trim() : ""
    const studentIdFromBody = typeof body.studentId === "string" ? body.studentId.trim() : ""
    const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId.trim() : ""

    if (!mentorIdFromBody && !studentIdFromBody && !targetUserId) {
      return NextResponse.json({ error: "target user id is required" }, { status: 400 })
    }

    if (mentorIdFromBody === user.id || studentIdFromBody === user.id || targetUserId === user.id) {
      return NextResponse.json({ error: "You cannot start a direct chat with yourself" }, { status: 400 })
    }

    const service = createServiceRoleClient()
    const isMentor = await hasMentorRole(user.id, user.email)

    const { data: selfProfile } = await service
      .from("profiles")
      .select("id, role, mentor_subject, mentor_subjects")
      .eq("id", user.id)
      .maybeSingle()

    const selfRole = String(selfProfile?.role ?? "student").toLowerCase()

    if (selfRole === "admin") {
      return NextResponse.json({ error: "Admins cannot create direct chats" }, { status: 403 })
    }

    if (isMentor) {
      const studentId = studentIdFromBody || targetUserId

      if (!studentId) {
        return NextResponse.json({ error: "studentId is required" }, { status: 400 })
      }

      const { data: studentProfile, error: studentError } = await service
        .from("profiles")
        .select("id, role")
        .eq("id", studentId)
        .maybeSingle()

      if (studentError) {
        return NextResponse.json({ error: "Failed to validate student" }, { status: 500 })
      }

      if (!studentProfile || String(studentProfile.role ?? "student").toLowerCase() === "mentor") {
        return NextResponse.json({ error: "Selected profile is not a student" }, { status: 400 })
      }

      const { data: existingChat } = await service
        .from("mentor_direct_chats")
        .select("id")
        .eq("mentor_id", user.id)
        .eq("student_id", studentId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingChat) {
        const chat = existingChat as DirectChatRow
        return NextResponse.json({ success: true, conversation_id: `direct:${chat.id}` })
      }

      const mentorCourseIds = getMentorSubjectCourseIds(selfProfile as UserRoleRow)
      const studentCourseIds = await getEnrolledSubjectCourseIds(service, studentId)

      const sharedCourseId = mentorCourseIds.find((courseId) => studentCourseIds.includes(courseId))
      const courseId = sharedCourseId ?? mentorCourseIds[0] ?? studentCourseIds[0]

      if (!courseId) {
        return NextResponse.json({ error: "No valid subject found to start direct chat" }, { status: 400 })
      }

      const { data: inserted, error: insertError } = await service
        .from("mentor_direct_chats")
        .insert([
          {
            mentor_id: user.id,
            student_id: studentId,
            course_id: courseId,
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single()

      if (insertError || !inserted) {
        return NextResponse.json({ error: "Failed to start direct chat" }, { status: 500 })
      }

      return NextResponse.json({ success: true, conversation_id: `direct:${inserted.id}` })
    }

    const mentorId = mentorIdFromBody || targetUserId

    if (!mentorId) {
      return NextResponse.json({ error: "mentorId is required" }, { status: 400 })
    }

    if (mentorId === user.id) {
      return NextResponse.json({ error: "You cannot start a direct chat with yourself" }, { status: 400 })
    }

    const { data: mentorProfile, error: mentorError } = await service
      .from("profiles")
      .select("id, role, mentor_subject, mentor_subjects")
      .eq("id", mentorId)
      .maybeSingle()

    if (mentorError) {
      return NextResponse.json({ error: "Failed to validate mentor" }, { status: 500 })
    }

    if (!mentorProfile || String(mentorProfile.role ?? "").toLowerCase() !== "mentor") {
      return NextResponse.json({ error: "Selected profile is not a mentor" }, { status: 400 })
    }

    const { data: existingChat } = await service
      .from("mentor_direct_chats")
      .select("id")
      .eq("mentor_id", mentorId)
      .eq("student_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingChat) {
      const chat = existingChat as DirectChatRow
      return NextResponse.json({ success: true, conversation_id: `direct:${chat.id}` })
    }

    const studentCourseIds = await getEnrolledSubjectCourseIds(service, user.id)
    const mentorCourseIds = getMentorSubjectCourseIds(mentorProfile as MentorProfileRow)

    const sharedCourseId = mentorCourseIds.find((courseId) => studentCourseIds.includes(courseId))
    const courseId = sharedCourseId ?? mentorCourseIds[0] ?? studentCourseIds[0]

    if (!courseId) {
      return NextResponse.json({ error: "No valid subject found to start direct chat" }, { status: 400 })
    }

    const { data: inserted, error: insertError } = await service
      .from("mentor_direct_chats")
      .insert([
        {
          mentor_id: mentorId,
          student_id: user.id,
          course_id: courseId,
          updated_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single()

    if (insertError || !inserted) {
      return NextResponse.json({ error: "Failed to start direct chat" }, { status: 500 })
    }

    return NextResponse.json({ success: true, conversation_id: `direct:${inserted.id}` })
  } catch (error) {
    console.error("Chat direct POST error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
