import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hasAdminRole } from "@/lib/security/admin-role"
import { SENDING_DOMAIN } from "@/lib/admin-email"

export const dynamic = "force-dynamic"

// Reports whether the Resend key is set and whether the sending domain is verified.
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(await hasAdminRole(user.id, user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const apiKey = process.env.RESEND_API_KEY
  const base = { domain: SENDING_DOMAIN, adminEmail: user.email ?? "" }
  if (!apiKey) return NextResponse.json({ ...base, configured: false, status: "missing_key" })

  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    })
    if (!res.ok) {
      // Sending-only keys can't list domains; sending still works, we just can't confirm the status.
      return NextResponse.json({ ...base, configured: true, status: "unknown" })
    }
    const json = await res.json()
    const match = (json.data ?? []).find((d: { name: string }) => d.name === SENDING_DOMAIN)
    return NextResponse.json({ ...base, configured: true, status: match?.status ?? "not_found" })
  } catch {
    return NextResponse.json({ ...base, configured: true, status: "unknown" })
  }
}
