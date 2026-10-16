import Link from "next/link"
import { ArrowUpRight, CheckCircle2 } from "lucide-react"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { GrowthChart, type GrowthPoint } from "@/components/admin/growth-chart"

export const dynamic = "force-dynamic"

const DAYS = 30
const dayKey = (d: Date) => d.toISOString().slice(0, 10)

async function getPortalData() {
  const service = createServiceRoleClient()
  const since = new Date(Date.now() - (DAYS - 1) * 86400000)
  since.setUTCHours(0, 0, 0, 0)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const head = { count: "exact", head: true } as const

  const [users, newUsers, enrolled, liveClasses, pendingNotes, openDoubts, recentUsers, recentEnrollments] =
    await Promise.all([
      service.from("profiles").select("id", head),
      service.from("profiles").select("id", head).gte("created_at", weekAgo),
      service.from("enrollments").select("user_id", head),
      service.from("live_classes").select("id", head),
      service.from("resources_notes").select("id", head).eq("status", "pending"),
      service.from("doubts").select("id", head).neq("status", "resolved"),
      service.from("profiles").select("created_at").gte("created_at", since.toISOString()).limit(5000),
      service.from("enrollments").select("enrolled_at").gte("enrolled_at", since.toISOString()).limit(5000),
    ])

  const buckets = new Map<string, GrowthPoint>()
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since.getTime() + i * 86400000)
    buckets.set(dayKey(d), {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      signups: 0,
      enrollments: 0,
    })
  }
  for (const r of recentUsers.data ?? []) {
    const b = buckets.get(String(r.created_at).slice(0, 10))
    if (b) b.signups++
  }
  for (const r of recentEnrollments.data ?? []) {
    const b = buckets.get(String(r.enrolled_at).slice(0, 10))
    if (b) b.enrollments++
  }

  return {
    users: users.count ?? 0,
    newUsers: newUsers.count ?? 0,
    enrolled: enrolled.count ?? 0,
    liveClasses: liveClasses.count ?? 0,
    pendingNotes: pendingNotes.count ?? 0,
    openDoubts: openDoubts.count ?? 0,
    growth: Array.from(buckets.values()),
  }
}

function greeting() {
  const h = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()),
  )
  if (h < 5) return "Good night"
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  if (h < 21) return "Good evening"
  return "Good night"
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [data, { data: profile }] = await Promise.all([
    getPortalData(),
    createServiceRoleClient().from("profiles").select("first_name").eq("id", user?.id ?? "").maybeSingle(),
  ])
  const name = profile?.first_name || user?.email?.split("@")[0] || "Admin"

  const kpis = [
    { label: "Total users", value: data.users, sub: `+${data.newUsers} this week`, href: "/admin/users" },
    { label: "Enrollments", value: data.enrolled, sub: "All courses", href: "/admin/users" },
    { label: "Live classes", value: data.liveClasses, sub: "Scheduled", href: "/admin/live-classes" },
  ]

  const attention = [
    { label: "open doubts", value: data.openDoubts, href: "/admin/doubts", action: "Answer" },
    { label: "notes pending approval", value: data.pendingNotes, href: "/admin/resources-notes", action: "Review" },
  ].filter((a) => a.value > 0)

  const total = data.growth.reduce((s, p) => s + p.signups, 0)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold uppercase italic tracking-tight text-white">Overview</h1>
          <p className="mt-1 text-sm text-slate-400">
            {greeting()}, {name}. Here is what is happening on BSPrep.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-slate-300 transition hover:bg-[#0f1729] hover:text-white"
        >
          View website <ArrowUpRight className="h-4 w-4" />
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="rounded-2xl border border-white/10 bg-[#070c15] p-5 transition hover:border-white/20"
          >
            <p className="text-sm text-slate-400">{k.label}</p>
            <p className="mt-1 text-3xl font-semibold text-white tabular-nums">{k.value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">{k.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-[#070c15] p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-100">Growth, last {DAYS} days</h2>
          <p className="mt-0.5 text-xs text-slate-500">{total.toLocaleString()} new sign-ups in this period</p>
          <div className="mt-4">
            <GrowthChart data={data.growth} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#070c15] p-5">
          <h2 className="text-sm font-semibold text-slate-100">Needs your attention</h2>
          {attention.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> All caught up.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-white/5">
              {attention.map((a) => (
                <li key={a.label}>
                  <Link href={a.href} className="flex items-center justify-between py-3 text-sm transition hover:text-white">
                    <span className="text-slate-300">
                      <span className="font-semibold text-white">{a.value}</span> {a.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                      {a.action} <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-6 text-sm font-semibold text-slate-100">Quick links</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { name: "Send an email", href: "/admin/inbox" },
              { name: "Post an announcement", href: "/admin/announcements" },
              { name: "Google Search Console", href: "https://search.google.com/search-console?resource_id=sc-domain:bsprep.in", external: true },
            ].map((l) => (
              <li key={l.name}>
                <Link
                  href={l.href}
                  target={l.external ? "_blank" : undefined}
                  className="inline-flex items-center gap-1 text-slate-400 transition hover:text-white"
                >
                  {l.name} <ArrowUpRight className="h-3.5 w-3.5 text-slate-600" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
