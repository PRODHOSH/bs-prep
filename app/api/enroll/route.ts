import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateUUID } from '@/lib/security/validation'

export async function POST(request: Request) {
  try {
    // Validate request body size
    const text = await request.text()
    if (text.length > 1000) { // 1KB limit
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    const body = JSON.parse(text)
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    // Validate UUID format
    if (!validateUUID(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID format' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 })
    }

    // Check enrollment limit (prevent abuse)
    const { count: enrollmentCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (enrollmentCount && enrollmentCount >= 50) {
      return NextResponse.json({ 
        error: 'Maximum enrollment limit reached. Please contact support.' 
      }, { status: 429 })
    }

    // For paid courses, check payment status (in real app, verify payment here)
    const paymentStatus = course.type === 'paid' ? 'pending' : 'completed'

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        payment_status: paymentStatus
      })
      .select()
      .single()

    if (enrollError) {
      console.error('Enrollment creation error:', enrollError)
      return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
    }

    return NextResponse.json({ success: true, enrollment }, { status: 201 })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    // Validate UUID format
    if (!validateUUID(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID format' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    // Check if enrollment exists before deleting
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId)

    if (deleteError) {
      console.error('Unenrollment error:', deleteError)
      return NextResponse.json({ error: 'Failed to unenroll' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Successfully unenrolled' })
  } catch (error) {
    console.error('Unenrollment error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

