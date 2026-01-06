import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET: fetch announcements
export async function GET() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}
