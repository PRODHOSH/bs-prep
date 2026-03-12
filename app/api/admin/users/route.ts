import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { writeRateLimiter } from '@/lib/rate-limit'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { user: null, supabase, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return { user: null, supabase, error: 'Forbidden' }
  return { user, supabase, error: null }
}

// GET /api/admin/users — list all users
export async function GET() {
  const { supabase, error } = await verifyAdmin()
  if (error) return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 403 })

  const { data, error: dbError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, created_at')
    .order('created_at', { ascending: false })

  if (dbError) return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  return NextResponse.json({ users: data })
}

// PATCH /api/admin/users — update a user's role
export async function PATCH(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = await writeRateLimiter.check(ip)
  if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { supabase, error } = await verifyAdmin()
  if (error) return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 403 })

  let body: { userId?: string; role?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { userId, role } = body

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const allowedRoles = ['student', 'mentor', 'admin']
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be student, mentor, or admin' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (dbError) return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  return NextResponse.json({ success: true })
}
