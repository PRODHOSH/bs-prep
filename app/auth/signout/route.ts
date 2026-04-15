import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const url = new URL(request.url)
  const next = url.searchParams.get('next')
  const safeNext = next && next.startsWith('/') ? next : '/admin/signin'
  return NextResponse.redirect(`${url.origin}${safeNext}`)
}
