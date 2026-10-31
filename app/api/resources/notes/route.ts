import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { sanitizeString } from "@/lib/security/validation"
import { subjectsFor } from "@/lib/resources-subjects"

const DEGREE_VALUES = ["data-science", "electronic-systems"] as const
const LEVEL_VALUES = ["foundation", "diploma", "degree"] as const

function isGoogleDriveLink(value: string): boolean {
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase()
    const protocol = parsed.protocol.toLowerCase()

    if (protocol !== "https:") {
      return false
    }

    return host === "drive.google.com" || host.endsWith(".drive.google.com") || host === "docs.google.com"
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const degree = sanitizeString(request.nextUrl.searchParams.get("degree") ?? "", 50)
    const level = sanitizeString(request.nextUrl.searchParams.get("level") ?? "", 30)
    const subject = sanitizeString(request.nextUrl.searchParams.get("subject") ?? "", 120)

    const authClient = await createClient()
    const service = createServiceRoleClient()

    const {
      data: { user },
    } = await authClient.auth.getUser()

    const columns = "id, user_id, degree, level, subject, notes_week_from, notes_week_to, title, contributor_name, notes_content_label, drive_link, created_at"
    const build = (select: string) => {
      let q = service
        .from("resources_notes")
        .select(select)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(300)
      if (degree && DEGREE_VALUES.includes(degree as (typeof DEGREE_VALUES)[number])) q = q.eq("degree", degree)
      if (level && LEVEL_VALUES.includes(level as (typeof LEVEL_VALUES)[number])) q = q.eq("level", level)
      if (subject) q = q.eq("subject", subject)
      return q
    }

    // Older databases do not have the downloads column until scripts/025 has been run.
    let { data: rows, error } = await build(`${columns}, downloads`)
    if (error && (error as { code?: string }).code === "42703") {
      ;({ data: rows, error } = await build(columns))
    }
    const data = rows as unknown as { id: string; downloads?: number }[] | null

    if (error && (error as { code?: string }).code === "42P01") {
      return NextResponse.json({ notes: [] })
    }

    if (error) {
      console.error("Resources notes GET error:", error)
      return NextResponse.json({ error: "Failed to load notes" }, { status: 500 })
    }

    const notes = data ?? []
    const noteIds = notes.map((note) => note.id)

    if (noteIds.length === 0) {
      return NextResponse.json({ notes: [] })
    }

    const { data: starRows, error: starError } = await service
      .from("resources_note_stars")
      .select("note_id")
      .in("note_id", noteIds)

    if (starError && (starError as { code?: string }).code !== "42P01") {
      console.error("Resources notes stars lookup error:", starError)
    }

    const starCountMap = new Map<string, number>()
    for (const row of starRows ?? []) {
      const key = row.note_id as string
      starCountMap.set(key, (starCountMap.get(key) ?? 0) + 1)
    }

    let userStarredSet = new Set<string>()
    if (user?.id) {
      const { data: userStars, error: userStarsError } = await service
        .from("resources_note_stars")
        .select("note_id")
        .eq("user_id", user.id)
        .in("note_id", noteIds)

      if (userStarsError && (userStarsError as { code?: string }).code !== "42P01") {
        console.error("Resources notes user stars lookup error:", userStarsError)
      }

      userStarredSet = new Set((userStars ?? []).map((row) => row.note_id as string))
    }

    // Contributors who have a profile photo show it on their notes.
    const userIds = Array.from(new Set(notes.map((n) => (n as { user_id?: string | null }).user_id).filter((v): v is string => !!v)))
    const avatarByUser = new Map<string, string>()
    if (userIds.length > 0) {
      const { data: profs } = await service.from("profiles").select("id, avatar_url, profile_picture_url").in("id", userIds)
      for (const row of (profs ?? []) as { id: string; avatar_url?: string | null; profile_picture_url?: string | null }[]) {
        const url = row.profile_picture_url || row.avatar_url
        if (url) avatarByUser.set(row.id, url)
      }
    }

    const enriched = notes.map((note) => ({
      ...note,
      contributor_avatar: avatarByUser.get((note as { user_id?: string | null }).user_id ?? "") ?? null,
      user_id: undefined,
      stars: starCountMap.get(note.id) ?? 0,
      user_starred: userStarredSet.has(note.id),
    }))

    return NextResponse.json({ notes: enriched })
  } catch (error) {
    console.error("Resources notes GET route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to submit notes" }, { status: 401 })
    }

    const text = await request.text()
    if (text.length > 15000) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 })
    }

    const body = JSON.parse(text) as {
      degree?: string
      level?: string
      subject?: string
      notesWeekFrom?: number
      notesWeekTo?: number
      contributorName?: string
      driveLink?: string
      kind?: string
      label?: string
    }

    const degree = sanitizeString(body.degree ?? "", 50)
    const level = sanitizeString(body.level ?? "", 30)
    const subject = sanitizeString(body.subject ?? "", 120)
    const contributorName = sanitizeString(body.contributorName ?? "", 120)
    const driveLink = sanitizeString(body.driveLink ?? "", 800)

    const kind = ["weeks", "book", "summary", "other"].includes(body.kind ?? "") ? (body.kind as string) : "weeks"
    let notesWeekFrom = Number(body.notesWeekFrom)
    let notesWeekTo = Number(body.notesWeekTo)

    if (!DEGREE_VALUES.includes(degree as (typeof DEGREE_VALUES)[number])) {
      return NextResponse.json({ error: "Invalid degree" }, { status: 400 })
    }

    if (!LEVEL_VALUES.includes(level as (typeof LEVEL_VALUES)[number])) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 })
    }

    if (!subjectsFor(degree, level).includes(subject)) {
      return NextResponse.json({ error: "Pick a subject from the list" }, { status: 400 })
    }

    if (!contributorName || !driveLink) {
      return NextResponse.json({ error: "Please fill all required fields" }, { status: 400 })
    }

    // What the notes cover: a week range, a single week, a book, a summary, or something else with its own name.
    let contentLabel: string
    let generatedTitle: string
    if (kind === "weeks") {
      if (!Number.isInteger(notesWeekFrom) || notesWeekFrom < 1 || notesWeekFrom > 52) {
        return NextResponse.json({ error: "Invalid week range" }, { status: 400 })
      }
      if (!Number.isInteger(notesWeekTo) || body.notesWeekTo === undefined || body.notesWeekTo === null || (body.notesWeekTo as unknown) === "") notesWeekTo = notesWeekFrom
      if (notesWeekTo < notesWeekFrom || notesWeekTo > 52) {
        return NextResponse.json({ error: "Invalid week range" }, { status: 400 })
      }
      contentLabel = notesWeekFrom === notesWeekTo ? `Week ${notesWeekFrom}` : `Week ${notesWeekFrom}-${notesWeekTo}`
      generatedTitle = `${subject} Weeks ${notesWeekFrom}-${notesWeekTo} Notes`
    } else {
      notesWeekFrom = 1
      notesWeekTo = 1
      const typed = sanitizeString(body.label ?? "", 60)
      contentLabel = kind === "book" ? (typed ? `Book ${typed}`.slice(0, 60) : "Book") : kind === "summary" ? "Summary" : typed
      if (!contentLabel) {
        return NextResponse.json({ error: "Tell us what these notes cover" }, { status: 400 })
      }
      generatedTitle = `${subject} ${contentLabel}`
    }

    if (!isGoogleDriveLink(driveLink)) {
      return NextResponse.json({ error: "Only Google Drive links are allowed" }, { status: 400 })
    }

    const { data: duplicate } = await createServiceRoleClient().from("resources_notes").select("id, status").eq("drive_link", driveLink).limit(1).maybeSingle()
    if (duplicate) {
      return NextResponse.json({ error: duplicate.status === "pending" ? "This link is already waiting for approval." : "These notes have already been shared." }, { status: 409 })
    }

    generatedTitle = sanitizeString(generatedTitle, 200)
    const generatedContentLabel = sanitizeString(contentLabel, 200)

    let insertResult = await supabase
      .from("resources_notes")
      .insert([
        {
          user_id: user.id,
          degree,
          level,
          subject,
          notes_week_from: notesWeekFrom,
          notes_week_to: notesWeekTo,
          title: generatedTitle,
          contributor_name: contributorName,
          notes_content_label: generatedContentLabel,
          drive_link: driveLink,
          status: "pending",
        },
      ])
      .select("id")
      .single()

    if (insertResult.error) {
      console.error("Resources notes POST error:", insertResult.error)
      const detail = insertResult.error.message || "Unknown database error"
      return NextResponse.json({ error: `Failed to submit notes: ${detail}` }, { status: 500 })
    }

    return NextResponse.json({ id: insertResult.data.id, message: "Submitted for approval" }, { status: 201 })
  } catch (error) {
    console.error("Resources notes POST route error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}