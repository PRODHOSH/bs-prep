import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { hasAdminRole } from "@/lib/security/admin-role"

type ResourceRow = {
  id: string
  title: string
  created_at: string
}

type DoubtRow = {
  id: string
  subject: string
  updated_at: string
  status: "open" | "in_progress" | "resolved"
  student_last_reply_at: string | null
  admin_last_reply_at: string | null
  last_admin_read_at: string | null
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

    const isAdmin = await hasAdminRole(user.id, user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const service = createServiceRoleClient()

    const [pendingResourcesRes, doubtsRes] = await Promise.all([
      service
        .from("resource_submissions")
        .select("id, title, created_at", { count: "exact" })
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
      service
        .from("doubts")
        .select("id, subject, updated_at, status, student_last_reply_at, admin_last_reply_at, last_admin_read_at")
        .order("updated_at", { ascending: false })
        .limit(60),
    ])

    if (pendingResourcesRes.error || doubtsRes.error) {
      return NextResponse.json({ error: "Failed to load admin notifications" }, { status: 500 })
    }

    const pendingResources = (pendingResourcesRes.data ?? []) as ResourceRow[]

    const unreadDoubts = ((doubtsRes.data ?? []) as DoubtRow[])
      .filter((doubt) => {
        if (!doubt.student_last_reply_at) {
          return false
        }

        const studentReplyAt = new Date(doubt.student_last_reply_at).getTime()
        const adminReadAt = doubt.last_admin_read_at ? new Date(doubt.last_admin_read_at).getTime() : 0
        return studentReplyAt > adminReadAt
      })
      .slice(0, 5)

    const items = [
      ...pendingResources.map((resource) => ({
        id: `resource-${resource.id}`,
        type: "resource" as const,
        title: "New resource submission",
        description: resource.title,
        href: "/admin/resources",
        created_at: resource.created_at,
      })),
      ...unreadDoubts.map((doubt) => ({
        id: `doubt-${doubt.id}`,
        type: "doubt" as const,
        title: "New student reply",
        description: doubt.subject,
        href: "/admin/doubts",
        created_at: doubt.student_last_reply_at || doubt.updated_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const counts = {
      pendingResources: pendingResourcesRes.count ?? 0,
      openDoubts: unreadDoubts.length,
    }

    return NextResponse.json({
      counts,
      total: counts.pendingResources + counts.openDoubts,
      items: items.slice(0, 8),
    })
  } catch (error) {
    console.error("Admin notifications GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await hasAdminRole(user.id, user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const service = createServiceRoleClient()
    const { data: doubts, error: doubtsError } = await service
      .from("doubts")
      .select("id, student_last_reply_at, last_admin_read_at")
      .order("updated_at", { ascending: false })
      .limit(120)

    if (doubtsError) {
      return NextResponse.json({ error: "Failed to load doubts" }, { status: 500 })
    }

    const unreadIds = (doubts ?? [])
      .filter((doubt) => {
        if (!doubt.student_last_reply_at) {
          return false
        }

        const studentReplyAt = new Date(doubt.student_last_reply_at).getTime()
        const adminReadAt = doubt.last_admin_read_at ? new Date(doubt.last_admin_read_at).getTime() : 0
        return studentReplyAt > adminReadAt
      })
      .map((doubt) => doubt.id)

    if (unreadIds.length === 0) {
      return NextResponse.json({ updated: 0 })
    }

    const nowIso = new Date().toISOString()
    const { error: updateError } = await service
      .from("doubts")
      .update({ last_admin_read_at: nowIso })
      .in("id", unreadIds)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
    }

    return NextResponse.json({ updated: unreadIds.length })
  } catch (error) {
    console.error("Admin notifications POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
