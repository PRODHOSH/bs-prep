import Link from "next/link"
import { ArrowUpRight, BookOpen, CheckCircle2, MessageSquare, Users, Video } from "lucide-react"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { GrowthChart, type GrowthPoint } from "@/components/admin/growth-chart"
import { Card, PageHeader, Stat, btnGhost } from "@/components/dashboard/ui"

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

  const attention = [
    { label: "open doubts", value: data.openDoubts, href: "/admin/doubts", action: "Answer" },
    { label: "notes pending approval", value: data.pendingNotes, href: "/admin/resources-notes", action: "Review" },
  ].filter((a) => a.value > 0)

  const total = data.growth.reduce((s, p) => s + p.signups, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`${greeting()}, ${name}. Here is what is happening on BSPrep.`}
        actions={
          <Link href="/" target="_blank" className={btnGhost}>
            View website <ArrowUpRight className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total users" value={data.users.toLocaleString()} hint={`+${data.newUsers} this week`} icon={Users} tone="primary" href="/admin/users" />
        <Stat label="Enrollments" value={data.enrolled.toLocaleString()} hint="All courses" icon={BookOpen} tone="green" href="/admin/users" />
        <Stat label="Live classes" value={data.liveClasses.toLocaleString()} hint="Scheduled" icon={Video} tone="pink" href="/admin/live-classes" />
        <Stat label="Open doubts" value={data.openDoubts.toLocaleString()} hint="Waiting for an answer" icon={MessageSquare} tone="amber" href="/admin/doubts" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card title={`Growth, last ${DAYS} days`} aside={`${total.toLocaleString()} new sign-ups`}>
          <GrowthChart data={data.growth} />
        </Card>

        <div className="space-y-5">
          <Card title="Needs your attention">
            {attention.length === 0 ? (
              <p className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-chart-4" /> All caught up.
              </p>
            ) : (
              <ul className="divide-y">
                {attention.map((a) => (
                  <li key={a.label}>
                    <Link href={a.href} className="flex items-center justify-between py-3 text-sm first:pt-1 last:pb-1">
                      <span>
                        <span className="font-bold">{a.value}</span> <span className="text-muted-foreground">{a.label}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                        {a.action} <ArrowUpRight className="size-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Quick links">
            <ul className="divide-y">
              {[
                { name: "Send an email", href: "/admin/inbox" },
                { name: "Post an announcement", href: "/admin/announcements" },
                { name: "Google Search Console", href: "https://search.google.com/search-console?resource_id=sc-domain:bsprep.in", external: true },
              ].map((l) => (
                <li key={l.name}>
                  <Link
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    className="flex items-center justify-between py-3 text-sm font-semibold first:pt-1 last:pb-1 hover:text-primary"
                  >
                    {l.name} <ArrowUpRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
