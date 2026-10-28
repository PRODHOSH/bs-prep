import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { hasAdminRole } from '@/lib/security/admin-role'
import { writeRateLimiter } from '@/lib/rate-limit'
import { validateAndSanitizeInput } from '@/lib/security/validation'
import { SUBJECT_CHAT_COURSE_IDS } from '@/lib/chat/constants'

type Params = {
  params: Promise<{ id: string }>
}

// PUT: Update user profile (admin only)
export async function PUT(req: NextRequest, { params }: Params) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = await writeRateLimiter.check(ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
    )
  }

  try {
    const { id: userId } = await params

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Verify admin access
    const supabase = await createClient()
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isAdmin = await hasAdminRole(adminUser.id, adminUser.email)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const text = await req.text()
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      )
    }

    const body = JSON.parse(text)
    const { first_name, last_name, phone, role, mentor_subject, mentor_subjects } = body

    // Validate inputs
    const updates: Record<string, unknown> = {}

    if (role !== undefined) {
      if (!['admin', 'mentor', 'student'].includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        )
      }
      updates.role = role
    }

    // Preferred: a list of subject ids. The first one stays in mentor_subject for older code paths.
    let subjectList: string[] | null = null
    if (mentor_subjects !== undefined) {
      if (!Array.isArray(mentor_subjects)) {
        return NextResponse.json({ error: 'mentor_subjects must be a list' }, { status: 400 })
      }
      const cleaned = Array.from(new Set(mentor_subjects.map((v: unknown) => String(v).trim()).filter(Boolean)))
      if (cleaned.some((id) => !SUBJECT_CHAT_COURSE_IDS.has(id))) {
        return NextResponse.json({ error: 'Unknown subject selected' }, { status: 400 })
      }
      subjectList = cleaned
      updates.mentor_subjects = cleaned
      updates.mentor_subject = cleaned[0] ?? null
    }

    if (mentor_subject !== undefined && subjectList === null) {
      if (mentor_subject === null || mentor_subject === '') {
        updates.mentor_subject = null
      } else {
        const subjectValidation = validateAndSanitizeInput(mentor_subject, 50)
        if (!subjectValidation.valid) {
          return NextResponse.json(
            { error: `Invalid mentor subject: ${subjectValidation.errors.join(', ')}` },
            { status: 400 }
          )
        }
        updates.mentor_subject = subjectValidation.sanitized
      }
    }

    if (first_name !== undefined) {
      const nameValidation = validateAndSanitizeInput(first_name, 100)
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: `Invalid first name: ${nameValidation.errors.join(', ')}` },
          { status: 400 }
        )
      }
      updates.first_name = nameValidation.sanitized
    }

    if (last_name !== undefined) {
      const nameValidation = validateAndSanitizeInput(last_name, 100)
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: `Invalid last name: ${nameValidation.errors.join(', ')}` },
          { status: 400 }
        )
      }
      updates.last_name = nameValidation.sanitized
    }

    if (phone !== undefined) {
      if (phone === null || phone === '') {
        updates.phone = null
      } else {
        // Basic phone validation: allow digits, spaces, hyphens, parentheses, and plus sign
        const phoneValidation = validateAndSanitizeInput(phone, 20)
        if (!phoneValidation.valid) {
          return NextResponse.json(
            { error: `Invalid phone: ${phoneValidation.errors.join(', ')}` },
            { status: 400 }
          )
        }
        // Check if it looks like a valid phone number
        const phoneRegex = /^[\d\s\-\(\)\+]+$/
        if (!phoneRegex.test(phoneValidation.sanitized) || phoneValidation.sanitized.replace(/\D/g, '').length < 5) {
          return NextResponse.json(
            { error: 'Invalid phone number format' },
            { status: 400 }
          )
        }
        updates.phone = phoneValidation.sanitized
      }
    }

    // Update profile in database
    const service = createServiceRoleClient()
    const { data, error } = await service
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    if (subjectList !== null) {
      const { data: target } = await service.auth.admin.getUserById(userId)
      await service.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...(target?.user?.user_metadata ?? {}),
          mentor_subject: subjectList[0] ?? null,
          mentor_subjects: subjectList,
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User profile updated successfully',
        user: data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
