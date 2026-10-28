import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

// supabase.auth.getUser() is a network round trip. Dashboard pages ask for the user on every mount,
// so share one lookup for a short window instead of repeating it on every navigation.
let pending: Promise<{ data: { user: User | null } }> | null = null
let fetchedAt = 0
const TTL = 60_000

export function getUserCached(): Promise<{ data: { user: User | null } }> {
  if (!pending || Date.now() - fetchedAt > TTL) {
    fetchedAt = Date.now()
    pending = createClient()
      .auth.getUser()
      .then(({ data }) => ({ data: { user: data.user } }))
      .catch(() => {
        pending = null
        return { data: { user: null } }
      })
  }
  return pending
}

export function resetUserCache() {
  pending = null
}
