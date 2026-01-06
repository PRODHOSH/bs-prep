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






export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, content } = body

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: "Title and content required" }),
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert([{ title, content }])
      .select()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      )
    }

    return new Response(JSON.stringify(data[0]), { status: 201 })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400 }
    )
  }
}
