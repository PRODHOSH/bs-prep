import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateAndSanitizeInput, validateRequiredFields } from "@/lib/security/validation"

// GET: fetch announcements - public endpoint
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100) // Limit results to prevent excessive data transfer

    if (error) {
      console.error('Announcements fetch error:', error)
      return NextResponse.json(
        { error: "Failed to fetch announcements" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST: create announcement - requires admin authentication
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("user_profiles_extended")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Validate request body size
    const text = await req.text()
    if (text.length > 10000) { // 10KB limit
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      )
    }

    const body = JSON.parse(text)
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['title', 'content'])
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Missing required fields: ${validation.missing.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate and sanitize inputs
    const titleValidation = validateAndSanitizeInput(body.title, 200)
    const contentValidation = validateAndSanitizeInput(body.content, 5000)

    if (!titleValidation.valid) {
      return NextResponse.json(
        { error: `Invalid title: ${titleValidation.errors.join(', ')}` },
        { status: 400 }
      )
    }

    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: `Invalid content: ${contentValidation.errors.join(', ')}` },
        { status: 400 }
      )
    }

    // Insert announcement
    const { data, error } = await supabase
      .from("announcements")
      .insert([{ 
        title: titleValidation.sanitized, 
        content: contentValidation.sanitized 
      }])
      .select()

    if (error) {
      console.error('Announcement creation error:', error)
      return NextResponse.json(
        { error: "Failed to create announcement" },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}

