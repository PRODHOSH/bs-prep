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
  profilePending = null
}

export type DisplayProfile = { name: string | null; avatarUrl: string | null }

let profilePending: Promise<DisplayProfile> | null = null
let profileAt = 0

/**
 * The name and photo to show for the signed-in user. A name saved in Settings (profiles.first_name / last_name)
 * always wins; the sign-in provider's name is only a fallback.
 */
export function getDisplayProfile(): Promise<DisplayProfile> {
  if (!profilePending || Date.now() - profileAt > TTL) {
    profileAt = Date.now()
    profilePending = (async () => {
      const {
        data: { user },
      } = await getUserCached()
      if (!user) return { name: null, avatarUrl: null }
      const { data } = await createClient().from("profiles").select("first_name, last_name, avatar_url").eq("id", user.id).maybeSingle()
      const saved = `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim()
      const meta = user.user_metadata ?? {}
      return {
        name: saved || (typeof meta.full_name === "string" && meta.full_name) || null,
        avatarUrl: data?.avatar_url || (typeof meta.avatar_url === "string" && meta.avatar_url) || (typeof meta.picture === "string" && meta.picture) || null,
      }
    })().catch(() => {
      profilePending = null
      return { name: null, avatarUrl: null }
    })
  }
  return profilePending
}

export const PROFILE_UPDATED_EVENT = "dashboard-profile-updated"

/** Call after the name changes: drops the cache and tells the sidebar and home page to refresh. */
export function notifyProfileUpdated() {
  profilePending = null
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT))
}
