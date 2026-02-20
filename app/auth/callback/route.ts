import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`)
      }
      
      // Successful authentication - redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    } catch (err) {
      console.error('Unexpected error during auth callback:', err)
      return NextResponse.redirect(`${origin}/?error=authentication_failed`)
    }
  }

  // No code provided - redirect to home
  return NextResponse.redirect(`${origin}/`)
}
