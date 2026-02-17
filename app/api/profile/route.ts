import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { 
  validateAndSanitizeInput, 
  validateUrl, 
  validateEmail,
  validateUsername,
  sanitizeString 
} from '@/lib/security/validation'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles_extended')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile: profile || {} })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Validate request body size (50KB limit for profile updates)
    const text = await request.text()
    if (text.length > 50000) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    const body = JSON.parse(text)
    const { 
      photo_url, 
      banner_url, 
      github, 
      linkedin, 
      portfolio, 
      about, 
      education, 
      location, 
      username, 
      full_name, 
      email, 
      projects, 
      experiences, 
      educations 
    } = body

    // Validate URLs
    if (photo_url && !validateUrl(photo_url)) {
      return NextResponse.json({ error: 'Invalid photo URL' }, { status: 400 })
    }
    if (banner_url && !validateUrl(banner_url)) {
      return NextResponse.json({ error: 'Invalid banner URL' }, { status: 400 })
    }
    if (github && !validateUrl(github)) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })
    }
    if (linkedin && !validateUrl(linkedin)) {
      return NextResponse.json({ error: 'Invalid LinkedIn URL' }, { status: 400 })
    }
    if (portfolio && !validateUrl(portfolio)) {
      return NextResponse.json({ error: 'Invalid portfolio URL' }, { status: 400 })
    }

    // Validate email
    if (email && !validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate username
    if (username && !validateUsername(username)) {
      return NextResponse.json({ 
        error: 'Invalid username. Use 3-30 characters, alphanumeric, hyphens, or underscores only.' 
      }, { status: 400 })
    }

    // Validate and sanitize text fields
    const validatedAbout = about ? validateAndSanitizeInput(about, 2000) : null
    if (validatedAbout && !validatedAbout.valid) {
      return NextResponse.json({ 
        error: `Invalid about text: ${validatedAbout.errors.join(', ')}` 
      }, { status: 400 })
    }

    const validatedLocation = location ? validateAndSanitizeInput(location, 100) : null
    if (validatedLocation && !validatedLocation.valid) {
      return NextResponse.json({ 
        error: `Invalid location: ${validatedLocation.errors.join(', ')}` 
      }, { status: 400 })
    }

    const validatedFullName = full_name ? validateAndSanitizeInput(full_name, 100) : null
    if (validatedFullName && !validatedFullName.valid) {
      return NextResponse.json({ 
        error: `Invalid full name: ${validatedFullName.errors.join(', ')}` 
      }, { status: 400 })
    }

    const validatedEducation = education ? validateAndSanitizeInput(education, 200) : null
    if (validatedEducation && !validatedEducation.valid) {
      return NextResponse.json({ 
        error: `Invalid education: ${validatedEducation.errors.join(', ')}` 
      }, { status: 400 })
    }

    // Validate arrays (projects, experiences, educations)
    if (projects && (!Array.isArray(projects) || projects.length > 50)) {
      return NextResponse.json({ error: 'Invalid projects data' }, { status: 400 })
    }
    if (experiences && (!Array.isArray(experiences) || experiences.length > 50)) {
      return NextResponse.json({ error: 'Invalid experiences data' }, { status: 400 })
    }
    if (educations && (!Array.isArray(educations) || educations.length > 20)) {
      return NextResponse.json({ error: 'Invalid educations data' }, { status: 400 })
    }

    // Prepare sanitized data
    const profileData: any = {
      id: user.id,
      updated_at: new Date().toISOString()
    }

    if (photo_url !== undefined) profileData.photo_url = photo_url
    if (banner_url !== undefined) profileData.banner_url = banner_url
    if (github !== undefined) profileData.github = github
    if (linkedin !== undefined) profileData.linkedin = linkedin
    if (portfolio !== undefined) profileData.portfolio = portfolio
    if (username !== undefined) profileData.username = sanitizeString(username, 30)
    if (email !== undefined) profileData.email = email
    if (validatedAbout) profileData.about = validatedAbout.sanitized
    if (validatedLocation) profileData.location = validatedLocation.sanitized
    if (validatedFullName) profileData.full_name = validatedFullName.sanitized
    if (validatedEducation) profileData.education = validatedEducation.sanitized
    if (projects !== undefined) profileData.projects = projects
    if (experiences !== undefined) profileData.experiences = experiences
    if (educations !== undefined) profileData.educations = educations

    // Upsert profile
    const { data: profile, error: upsertError } = await supabase
      .from('user_profiles_extended')
      .upsert(profileData, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Profile upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile }, { status: 200 })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  // PUT and POST do the same thing (upsert)
  return POST(request)
}
