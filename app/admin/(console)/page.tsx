import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

async function getPortalStats() {
  const service = createServiceRoleClient()
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const head = { count: "exact", head: true } as const

  const [users, newUsers, enrolled, announcements, admins, pendingNotes, openDoubts, liveClasses] =
    await Promise.all([
      service.from("profiles").select("id", head),
      service.from("profiles").select("id", head).gte("created_at", weekAgo),
      service.from("enrollments").select("user_id", head),
      service.from("announcements").select("id", head),
      service.from("profiles").select("id", head).eq("role", "admin"),
      service.from("resources_notes").select("id", head).eq("status", "pending"),
      service.from("doubts").select("id", head).neq("status", "resolved"),
      service.from("live_classes").select("id", head),
    ])

  return {
    users: users.count ?? 0,
    newUsers: newUsers.count ?? 0,
    enrolled: enrolled.count ?? 0,
    announcements: announcements.count ?? 0,
    admins: admins.count ?? 0,
    pendingNotes: pendingNotes.count ?? 0,
    openDoubts: openDoubts.count ?? 0,
    liveClasses: liveClasses.count ?? 0,
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

  const [stats, { data: profile }] = await Promise.all([
    getPortalStats(),
    createServiceRoleClient().from("profiles").select("first_name").eq("id", user?.id ?? "").maybeSingle(),
  ])
  const name = profile?.first_name || user?.email?.split("@")[0] || "Admin"

  const attention = [
    { label: "Open doubts", value: stats.openDoubts, href: "/admin/doubts", action: "Answer" },
    { label: "Notes pending approval", value: stats.pendingNotes, href: "/admin/resources-notes", action: "Review" },
  ].filter((a) => a.value > 0)

  const overview = [
    { label: "Users", value: stats.users, href: "/admin/users" },
    { label: "New this week", value: stats.newUsers, href: "/admin/users" },
    { label: "Enrollments", value: stats.enrolled, href: "/admin/users" },
    { label: "Announcements", value: stats.announcements, href: "/admin/announcements" },
    { label: "Live classes", value: stats.liveClasses, href: "/admin/live-classes" },
    { label: "Admins", value: stats.admins, href: "/admin/details" },
  ]

  const externalTools = [
    { name: "Google Search Console", href: "https://search.google.com/search-console?resource_id=sc-domain:bsprep.in" },
    { name: "Google Analytics", href: "https://analytics.google.com/analytics/web/#/a386139611p528155601/reports/intelligenthome" },
  ]

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {greeting()}, {name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Here is what is happening on BSPrep.</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          View website <ArrowUpRight className="h-4 w-4" />
        </Link>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-medium text-slate-400">Needs your attention</h2>
        {attention.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[#070c15] px-4 py-3 text-sm text-slate-400">
            All caught up. Nothing is waiting on you.
          </p>
        ) : (
          <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-[#070c15]">
            {attention.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-white/[0.03]"
              >
                <span className="text-slate-200">
                  <span className="font-semibold text-white">{a.value}</span> {a.label.toLowerCase()}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  {a.action} <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-slate-400">Overview</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {overview.map((o) => (
            <Link
              key={o.label}
              href={o.href}
              className="rounded-xl border border-white/10 bg-[#070c15] p-4 transition hover:border-white/20"
            >
              <p className="text-sm text-slate-400">{o.label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{o.value.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-slate-400">External tools</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {externalTools.map((t) => (
            <a
              key={t.name}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-300 transition hover:text-white"
            >
              {t.name} <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
