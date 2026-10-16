import { createHmac, timingSafeEqual } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/admin-email"

// Server only. Links are signed so nobody can unsubscribe an address they don't hold a link for.
const secret = () => process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export function signEmail(email: string): string {
  return createHmac("sha256", secret()).update(email.trim().toLowerCase()).digest("base64url")
}

export function verifyEmailToken(email: string, token: string): boolean {
  if (!secret() || !token) return false
  const a = Buffer.from(signEmail(email))
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}

const query = (email: string) => `e=${encodeURIComponent(email)}&t=${signEmail(email)}`

/** Link shown in the email footer: opens the confirmation page. */
export const signedUnsubscribeUrl = (email: string) => `${SITE_URL}/unsubscribe?${query(email)}`

/** Target of the List-Unsubscribe header: mail clients POST here for one-click unsubscribe. */
export const oneClickUnsubscribeUrl = (email: string) => `${SITE_URL}/api/unsubscribe?${query(email)}`

export async function addUnsubscribe(email: string, source = "link") {
  const { error } = await createServiceRoleClient()
    .from("email_unsubscribes")
    .upsert({ email: email.trim().toLowerCase(), source }, { onConflict: "email" })
  if (error) throw new Error(error.message)
}

/** Splits addresses into those we may email and those who opted out. */
export async function splitSuppressed(emails: string[]): Promise<{ allowed: string[]; suppressed: string[] }> {
  if (emails.length === 0) return { allowed: [], suppressed: [] }
  const service = createServiceRoleClient()
  const suppressed = new Set<string>()
  for (let i = 0; i < emails.length; i += 200) {
    const { data, error } = await service
      .from("email_unsubscribes")
      .select("email")
      .in("email", emails.slice(i, i + 200))
    if (error) throw new Error(error.message)
    for (const r of data ?? []) suppressed.add(r.email)
  }
  return { allowed: emails.filter((e) => !suppressed.has(e)), suppressed: emails.filter((e) => suppressed.has(e)) }
}
