import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Counts one download. Public, because the notes are; the count is only a hint for sorting. */
export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!UUID.test(id)) {
      return NextResponse.json({ error: "Invalid note id" }, { status: 400 })
    }

    const service = createServiceRoleClient()
    const { data, error } = await service.rpc("bump_note_downloads", { p_note: id })

    if (error) {
      // The counter is optional: a missing function must not stop anyone from downloading.
      return NextResponse.json({ downloads: null })
    }

    return NextResponse.json({ downloads: typeof data === "number" ? data : null })
  } catch {
    return NextResponse.json({ downloads: null })
  }
}
