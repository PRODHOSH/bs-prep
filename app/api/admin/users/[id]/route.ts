import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { hasAdminRole } from '@/lib/security/admin-role'
import { writeRateLimiter } from '@/lib/rate-limit'
import { validateAndSanitizeInput, validateEmail } from '@/lib/security/validation'

type Params = {
  params: Promise<{ id: string }>
}

// PUT: Update user profile (admin only)
export async function PUT(req: NextRequest, { params }: Params) {
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

    // Use admin user ID for rate limiting (not IP, to avoid false blocks when multiple admins share IP)
    const rl = await writeRateLimiter.check(adminUser.id)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
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
    const { first_name, last_name, email, phone } = body

    // Validate inputs
    const updates: Record<string, unknown> = {}

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

    const service = createServiceRoleClient()
    let normalizedEmail: string | undefined

    // If email is being updated, validate and reserve it.
    if (email !== undefined) {
      if (!validateEmail(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Check if email already exists (excluding current user)
      const { data: existingUser } = await service
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        )
      }

      normalizedEmail = email.toLowerCase()
      updates.email = normalizedEmail
    }

    const syncFirstName = typeof updates.first_name === 'string' ? updates.first_name : undefined
    const syncLastName = typeof updates.last_name === 'string' ? updates.last_name : undefined
    const shouldSyncMetadata = syncFirstName !== undefined || syncLastName !== undefined

    if (normalizedEmail || shouldSyncMetadata) {
      const { data: authUserData, error: authReadError } = await service.auth.admin.getUserById(userId)

      if (authReadError) {
        console.error('Failed to read auth user:', authReadError)
        return NextResponse.json(
          { error: 'Failed to update account metadata' },
          { status: 500 }
        )
      }

      const existingMetadata = (authUserData?.user?.user_metadata ?? {}) as Record<string, unknown>
      const nextMetadata: Record<string, unknown> = { ...existingMetadata }

      if (shouldSyncMetadata) {
        const first = syncFirstName !== undefined ? syncFirstName : String(existingMetadata.first_name ?? '').trim()
        const last = syncLastName !== undefined ? syncLastName : String(existingMetadata.last_name ?? '').trim()

        nextMetadata.first_name = first
        nextMetadata.last_name = last
        nextMetadata.full_name = `${first} ${last}`.trim()
      }

      const authUpdatePayload: { email?: string; user_metadata?: Record<string, unknown> } = {}
      if (normalizedEmail) {
        authUpdatePayload.email = normalizedEmail
      }
      if (shouldSyncMetadata) {
        authUpdatePayload.user_metadata = nextMetadata
      }

      const { error: authUpdateError } = await service.auth.admin.updateUserById(userId, authUpdatePayload)

      if (authUpdateError) {
        console.error('Failed to update auth user:', authUpdateError)
        return NextResponse.json(
          { error: 'Failed to update account details' },
          { status: 500 }
        )
      }
    }

    // Update profile in database
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
