import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to star notes" }, { status: 401 })
    }

    const { id: noteId } = await context.params
    if (!noteId) {
      return NextResponse.json({ error: "Missing note id" }, { status: 400 })
    }

    const service = createServiceRoleClient()

    const { data: note, error: noteError } = await service
      .from("resources_notes")
      .select("id, status")
      .eq("id", noteId)
      .maybeSingle()

    if (noteError) {
      console.error("Resources note lookup error:", noteError)
      return NextResponse.json({ error: "Failed to validate note" }, { status: 500 })
    }

    if (!note || note.status !== "approved") {
      return NextResponse.json({ error: "Note is not available for starring" }, { status: 404 })
    }

    const { data: existingStar, error: existingStarError } = await service
      .from("resources_note_stars")
      .select("id")
      .eq("note_id", noteId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingStarError && existingStarError.code !== "42P01") {
      console.error("Resources star lookup error:", existingStarError)
      return NextResponse.json({ error: "Failed to update star" }, { status: 500 })
    }

    let starred = false

    if (existingStar?.id) {
      const { error: deleteError } = await service
        .from("resources_note_stars")
        .delete()
        .eq("id", existingStar.id)

      if (deleteError) {
        console.error("Resources star delete error:", deleteError)
        return NextResponse.json({ error: "Failed to remove star" }, { status: 500 })
      }

      starred = false
    } else {
      const { error: insertError } = await service
        .from("resources_note_stars")
        .insert({
          note_id: noteId,
          user_id: user.id,
        })

      if (insertError) {
        console.error("Resources star insert error:", insertError)
        return NextResponse.json({ error: "Failed to add star" }, { status: 500 })
      }

      starred = true
    }

    const { data: allStars, error: countError } = await service
      .from("resources_note_stars")
      .select("id")
      .eq("note_id", noteId)

    if (countError && countError.code !== "42P01") {
      console.error("Resources star count error:", countError)
      return NextResponse.json({ error: "Failed to read star count" }, { status: 500 })
    }

    return NextResponse.json({
      noteId,
      starred,
      stars: (allStars ?? []).length,
    })
  } catch (error) {
    console.error("Resources star route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}