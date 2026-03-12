import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { deleteAccountRateLimiter } from '@/lib/rate-limit'

export async function DELETE(request: NextRequest) {
  try {
    // Rate limit by IP — max 3 account deletions per hour
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const rl = await deleteAccountRateLimiter.check(ip)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
      )
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Delete all user data (order matters for FK constraints)
    await supabase.from('enrollments').delete().eq('user_id', userId)
    await supabase.from('profiles').delete().eq('id', userId)

    // Delete auth user via admin client (service role — server-side only)
    const admin = createAdminClient()
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
