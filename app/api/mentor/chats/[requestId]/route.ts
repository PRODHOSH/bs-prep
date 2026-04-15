import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { hasMentorRole } from "@/lib/security/mentor-role"

type MentorRequestRow = {
  id: string
  mentor_id: string
  student_id: string
  subject: string | null
  message: string | null
  status: string | null
  created_at: string
  updated_at: string
}

type ProfileRow = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
}

type RequestMessageRow = {
  id: string
  mentor_request_id: string
  sender_id: string
  sender_role: "student" | "mentor"
  message: string
  created_at: string
}

function displayName(profile: ProfileRow | undefined, fallback: string): string {
  if (!profile) {
    return fallback
  }

  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
  return fullName || profile.email || fallback
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params

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
    const { data: request, error: requestError } = await service
      .from("mentor_requests")
      .select("id, mentor_id, student_id, subject, message, status, created_at, updated_at")
      .eq("id", requestId)
      .eq("mentor_id", user.id)
      .maybeSingle()

    if (requestError) {
      console.error("Mentor chat detail error:", requestError)
      return NextResponse.json({ error: "Failed to load chat" }, { status: 500 })
    }

    if (!request) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const chatRequest = request as MentorRequestRow
    const { data: profiles } = await service
      .from("profiles")
      .select("id, first_name, last_name, email, avatar_url")
      .in("id", [chatRequest.student_id, user.id])

    const profileById = new Map<string, ProfileRow>()
    for (const profile of (profiles ?? []) as ProfileRow[]) {
      profileById.set(profile.id, profile)
    }

    const { data: messages, error: messageError } = await service
      .from("mentor_request_messages")
      .select("id, mentor_request_id, sender_id, sender_role, message, created_at")
      .eq("mentor_request_id", requestId)
      .order("created_at", { ascending: true })

    if (messageError) {
      console.error("Mentor chat messages error:", messageError)
      return NextResponse.json({ error: "Failed to load messages" }, { status: 500 })
    }

    const thread = [] as Array<{
      id: string
      sender_id: string
      sender_role: "student" | "mentor"
      sender_name: string
      message: string
      created_at: string
    }>

    if (chatRequest.message) {
      thread.push({
        id: `initial-${chatRequest.id}`,
        sender_id: chatRequest.student_id,
        sender_role: "student",
        sender_name: displayName(profileById.get(chatRequest.student_id), "Student"),
        message: chatRequest.message,
        created_at: chatRequest.created_at,
      })
    }

    for (const item of (messages ?? []) as RequestMessageRow[]) {
      const fallback = item.sender_role === "mentor" ? "Mentor" : "Student"
      thread.push({
        id: item.id,
        sender_id: item.sender_id,
        sender_role: item.sender_role,
        sender_name: displayName(profileById.get(item.sender_id), fallback),
        message: item.message,
        created_at: item.created_at,
      })
    }

    const latestMessage = thread[thread.length - 1]

    return NextResponse.json({
      chat: {
        id: chatRequest.id,
        status: chatRequest.status ?? "pending",
        subject: chatRequest.subject ?? "Mentoring support",
        created_at: chatRequest.created_at,
        updated_at: chatRequest.updated_at,
        student: {
          id: chatRequest.student_id,
          name: displayName(profileById.get(chatRequest.student_id), "Student"),
          email: profileById.get(chatRequest.student_id)?.email ?? "",
          avatar_url: profileById.get(chatRequest.student_id)?.avatar_url ?? null,
        },
        last_message: latestMessage?.message ?? "No messages yet",
        last_message_sender_role: latestMessage?.sender_role ?? "student",
        last_message_at: latestMessage?.created_at ?? chatRequest.created_at,
      },
      messages: thread,
    })
  } catch (error) {
    console.error("Mentor chat detail GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
