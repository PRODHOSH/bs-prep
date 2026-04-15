import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { sanitizeString } from "@/lib/security/validation"
import { hasMentorRole } from "@/lib/security/mentor-role"

type MentorRequestRow = {
  id: string
  mentor_id: string
  status: string | null
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
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

    const text = await request.text()
    if (text.length > 15000) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 })
    }

    const body = JSON.parse(text) as { message?: string }
    const message = sanitizeString(body.message ?? "", 2000)

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const service = createServiceRoleClient()
    const { data: mentorRequest, error: requestError } = await service
      .from("mentor_requests")
      .select("id, mentor_id, status")
      .eq("id", requestId)
      .eq("mentor_id", user.id)
      .maybeSingle()

    if (requestError) {
      console.error("Mentor message request check error:", requestError)
      return NextResponse.json({ error: "Failed to validate chat" }, { status: 500 })
    }

    if (!mentorRequest) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const requestRow = mentorRequest as MentorRequestRow

    const { data: inserted, error: insertError } = await service
      .from("mentor_request_messages")
      .insert([
        {
          mentor_request_id: requestId,
          sender_id: user.id,
          sender_role: "mentor",
          message,
        },
      ])
      .select("id, mentor_request_id, sender_id, sender_role, message, created_at")
      .single()

    if (insertError || !inserted) {
      console.error("Mentor message insert error:", insertError)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    const nextStatus = requestRow.status === "pending" ? "accepted" : requestRow.status
    const nowIso = new Date().toISOString()

    await service
      .from("mentor_requests")
      .update({
        status: nextStatus,
        updated_at: nowIso,
      })
      .eq("id", requestId)

    return NextResponse.json({ message: inserted }, { status: 201 })
  } catch (error) {
    console.error("Mentor message POST error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
