import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hasAdminRole } from "@/lib/security/admin-role"
import { buildAnalytics, type AnalyticsPayload } from "@/lib/admin-analytics"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// small in-memory cache so refreshes don't burn Google API quota
const CACHE_MS = 5 * 60 * 1000
const cache = new Map<number, { at: number; payload: AnalyticsPayload }>()

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(await hasAdminRole(user.id, user.email)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const requested = Number(request.nextUrl.searchParams.get("range"))
  const range = [7, 28, 90].includes(requested) ? requested : 28
  const fresh = request.nextUrl.searchParams.get("fresh") === "1"

  const hit = cache.get(range)
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return NextResponse.json(hit.payload)

  try {
    const payload = await buildAnalytics(range)
    cache.set(range, { at: Date.now(), payload })
    return NextResponse.json(payload)
  } catch (e) {
    console.error("[admin/analytics]", e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load analytics" },
      { status: 500 },
    )
  }
}
