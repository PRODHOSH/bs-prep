import { createClient } from '@supabase/supabase-js'

// Admin client uses the service role key — server-side only.
// NEVER expose this or use it in client components.
// SUPABASE_SERVICE_ROLE_KEY must NOT have a NEXT_PUBLIC_ prefix.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase admin credentials are not configured')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
