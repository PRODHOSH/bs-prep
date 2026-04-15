import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { sanitizeString } from "@/lib/security/validation"

const DEGREE_VALUES = ["data-science", "electronic-systems"] as const
const LEVEL_VALUES = ["foundation", "diploma", "degree"] as const

type ContributorAggregate = {
  userId: string | null
  name: string
  avatarUrl: string | null
  notesCount: number
  stars: number
  bonus: number
  xp: number
  milestoneLabel: string | null
}

function getMilestoneBonus(notesCount: number): { bonus: number; milestoneLabel: string | null } {
  if (notesCount >= 50) {
    return { bonus: 500, milestoneLabel: "50+ notes bonus" }
  }

  return { bonus: 0, milestoneLabel: null }
}

function getAvatarFromMetadata(metadata: Record<string, unknown> | null | undefined): string | null {
  if (!metadata) {
    return null
  }

  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null
  if (avatarUrl) {
    return avatarUrl
  }

  const pictureUrl = typeof metadata.picture === "string" ? metadata.picture : null
  if (pictureUrl) {
    return pictureUrl
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const degree = sanitizeString(request.nextUrl.searchParams.get("degree") ?? "", 50)
    const level = sanitizeString(request.nextUrl.searchParams.get("level") ?? "", 30)

    const authClient = await createClient()
    const service = createServiceRoleClient()

    const {
      data: { user: sessionUser },
    } = await authClient.auth.getUser()

    const sessionUserMetadata = sessionUser?.user_metadata as Record<string, unknown> | undefined

    let query = service
      .from("resources_notes")
      .select("id, user_id, contributor_name")
      .eq("status", "approved")
      .limit(1000)

    if (degree && DEGREE_VALUES.includes(degree as (typeof DEGREE_VALUES)[number])) {
      query = query.eq("degree", degree)
    }

    if (level && LEVEL_VALUES.includes(level as (typeof LEVEL_VALUES)[number])) {
      query = query.eq("level", level)
    }

    const { data: noteRows, error: notesError } = await query

    if (notesError && notesError.code === "42P01") {
      return NextResponse.json({ contributors: [] })
    }

    if (notesError) {
      console.error("Resources contributors notes error:", notesError)
      return NextResponse.json({ error: "Failed to load contributors" }, { status: 500 })
    }

    const notes = noteRows ?? []
    if (notes.length === 0) {
      return NextResponse.json({ contributors: [] })
    }

    const contributorUserIds = Array.from(
      new Set(
        notes
          .map((row) => row.user_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    )

    const profileById = new Map<string, { avatarUrl: string | null; profilePictureUrl: string | null }>()
    const metadataById = new Map<string, { avatarUrl: string | null }>()

    if (contributorUserIds.length > 0) {
      const { data: profileRows, error: profileError } = await service
        .from("profiles")
        .select("id, avatar_url, profile_picture_url")
        .in("id", contributorUserIds)

      if (profileError && profileError.code !== "42P01") {
        console.error("Resources contributors profile lookup error:", profileError)
      }

      for (const profile of profileRows ?? []) {
        profileById.set(profile.id, {
          avatarUrl: typeof profile.avatar_url === "string" ? profile.avatar_url : null,
          profilePictureUrl: typeof profile.profile_picture_url === "string" ? profile.profile_picture_url : null,
        })
      }
    }

    if (contributorUserIds.length > 0) {
      const { data: usersData, error: usersError } = await service.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })

      if (usersError) {
        console.error("Resources contributors auth metadata lookup error:", usersError)
      } else {
        const contributorIdSet = new Set(contributorUserIds)

        for (const authUser of usersData?.users ?? []) {
          if (!contributorIdSet.has(authUser.id)) {
            continue
          }

          const metadata = authUser.user_metadata as Record<string, unknown> | null
          const avatarUrl = getAvatarFromMetadata(metadata)

          metadataById.set(authUser.id, {
            avatarUrl,
          })
        }
      }
    }

    const noteIds = notes.map((row) => row.id)

    const { data: starRows, error: starsError } = await service
      .from("resources_note_stars")
      .select("note_id")
      .in("note_id", noteIds)

    if (starsError && starsError.code !== "42P01") {
      console.error("Resources contributors stars error:", starsError)
      return NextResponse.json({ error: "Failed to load contributors" }, { status: 500 })
    }

    const starsByNote = new Map<string, number>()
    for (const star of starRows ?? []) {
      const noteId = star.note_id as string
      starsByNote.set(noteId, (starsByNote.get(noteId) ?? 0) + 1)
    }

    const byContributor = new Map<string, ContributorAggregate>()

    for (const note of notes) {
      const contributorKey = note.user_id || `anonymous:${note.contributor_name}`
      const current = byContributor.get(contributorKey)

      if (!current) {
        const profile = note.user_id ? profileById.get(note.user_id) : null
        const metadata = note.user_id ? metadataById.get(note.user_id) : null
        const fallbackName = typeof note.contributor_name === "string" && note.contributor_name.trim().length > 0
          ? note.contributor_name.trim()
          : "Contributor"

        const sessionAvatar = note.user_id && sessionUser?.id === note.user_id
          ? getAvatarFromMetadata(sessionUserMetadata)
          : null

        byContributor.set(contributorKey, {
          userId: note.user_id ?? null,
          name: fallbackName,
          avatarUrl: profile?.avatarUrl || metadata?.avatarUrl || profile?.profilePictureUrl || sessionAvatar || null,
          notesCount: 1,
          stars: starsByNote.get(note.id) ?? 0,
          bonus: 0,
          xp: 0,
          milestoneLabel: null,
        })
      } else {
        current.notesCount += 1
        current.stars += starsByNote.get(note.id) ?? 0
      }
    }

    const contributors = Array.from(byContributor.values())
      .map((entry) => {
        const baseXp = entry.notesCount * 10 + entry.stars * 2
        const milestone = getMilestoneBonus(entry.notesCount)
        const bonus = milestone.bonus

        return {
          ...entry,
          bonus,
          xp: baseXp + bonus,
          milestoneLabel: milestone.milestoneLabel,
        }
      })
      .sort((a, b) => {
        if (b.stars !== a.stars) return b.stars - a.stars
        if (b.notesCount !== a.notesCount) return b.notesCount - a.notesCount
        return b.xp - a.xp
      })
      .slice(0, 100)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        name: entry.name,
        avatarUrl: entry.avatarUrl,
        notesCount: entry.notesCount,
        stars: entry.stars,
        xp: entry.xp,
        bonus: entry.bonus,
        milestoneLabel: entry.milestoneLabel,
      }))

    return NextResponse.json({ contributors })
  } catch (error) {
    console.error("Resources contributors route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}