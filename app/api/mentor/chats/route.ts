import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { hasMentorRole } from "@/lib/security/mentor-role"

type MentorRequestRow = {
  id: string
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
  mentor_request_id: string
  message: string | null
  sender_role: "student" | "mentor"
  created_at: string
}

function getDisplayName(profile: ProfileRow | undefined): string {
  if (!profile) {
    return "Student"
  }

  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
  return fullName || profile.email || "Student"
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

    const isMentor = await hasMentorRole(user.id, user.email)
    if (!isMentor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const service = createServiceRoleClient()
    const { data: requests, error: requestError } = await service
      .from("mentor_requests")
      .select("id, student_id, subject, message, status, created_at, updated_at")
      .eq("mentor_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(150)

    if (requestError) {
      console.error("Mentor chats list error:", requestError)
      return NextResponse.json({ error: "Failed to load chats" }, { status: 500 })
    }

    const chatRequests = (requests ?? []) as MentorRequestRow[]
    if (chatRequests.length === 0) {
      return NextResponse.json({ chats: [] })
    }

    const studentIds = Array.from(new Set(chatRequests.map((item) => item.student_id)))
    const requestIds = chatRequests.map((item) => item.id)

    const [{ data: profiles }, { data: messages }] = await Promise.all([
      service
        .from("profiles")
        .select("id, first_name, last_name, email, avatar_url")
        .in("id", studentIds),
      service
        .from("mentor_request_messages")
        .select("mentor_request_id, message, sender_role, created_at")
        .in("mentor_request_id", requestIds)
        .order("created_at", { ascending: false }),
    ])

    const profileById = new Map<string, ProfileRow>()
    for (const profile of (profiles ?? []) as ProfileRow[]) {
      profileById.set(profile.id, profile)
    }

    const latestByRequest = new Map<string, RequestMessageRow>()
    for (const item of (messages ?? []) as RequestMessageRow[]) {
      if (!latestByRequest.has(item.mentor_request_id)) {
        latestByRequest.set(item.mentor_request_id, item)
      }
    }

    const chats = chatRequests.map((request) => {
      const profile = profileById.get(request.student_id)
      const latest = latestByRequest.get(request.id)

      return {
        id: request.id,
        status: request.status ?? "pending",
        subject: request.subject ?? "Mentoring support",
        created_at: request.created_at,
        updated_at: request.updated_at,
        student: {
          id: request.student_id,
          name: getDisplayName(profile),
          email: profile?.email ?? "",
          avatar_url: profile?.avatar_url ?? null,
        },
        last_message: latest?.message ?? request.message ?? "No messages yet",
        last_message_sender_role: latest?.sender_role ?? "student",
        last_message_at: latest?.created_at ?? request.created_at,
      }
    })

    return NextResponse.json({ chats })
  } catch (error) {
    console.error("Mentor chats GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
