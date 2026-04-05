import Link from "next/link"
import { createServiceRoleClient } from "@/lib/supabase/server"

async function getPortalStats() {
  const service = createServiceRoleClient()

  const [{ count: userCount }, { count: announcementCount }, { count: adminCount }, { count: doubtCount }, { data: resourceRows }] = await Promise.all([
    service.from("profiles").select("id", { count: "exact", head: true }),
    service.from("announcements").select("id", { count: "exact", head: true }),
    service.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    service.from("doubts").select("id", { count: "exact", head: true }),
    service.from("resource_submissions").select("status"),
  ])

  const normalizedStatuses = (resourceRows ?? []).map((row) => String((row as { status?: string }).status ?? "").trim().toLowerCase())
  const pendingResourceCount = normalizedStatuses.filter((status) => status === "pending").length
  const approvedResourceCount = normalizedStatuses.filter((status) => status === "approved").length
  const rejectedResourceCount = normalizedStatuses.filter((status) => status === "rejected").length

  return {
    users: userCount ?? 0,
    announcements: announcementCount ?? 0,
    admins: adminCount ?? 0,
    doubts: doubtCount ?? 0,
    pendingResources: pendingResourceCount ?? 0,
    approvedResources: approvedResourceCount ?? 0,
    rejectedResources: rejectedResourceCount ?? 0,
  }
}

export default async function AdminPage() {
  const stats = await getPortalStats()

  const cards = [
    {
      title: "Users",
      description: "Browse user directory and role access.",
      href: "/admin/users",
      value: stats.users,
    },
    {
      title: "Announcements",
      description: "Create, edit, and delete announcements.",
      href: "/admin/announcements",
      value: stats.announcements,
    },
    {
      title: "Doubts",
      description: "Reply to student questions and track open threads.",
      href: "/admin/doubts",
      value: stats.doubts,
    },
    {
      title: "Resources Review",
      description: "Approve or reject submitted PDF resources.",
      href: "/admin/resources",
      value: stats.pendingResources,
    },
    {
      title: "Admin Details",
      description: "View admin profiles and active admins list.",
      href: "/admin/details",
      value: stats.admins,
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-semibold uppercase italic tracking-tight text-white">Admin Portal</h1>
        <p className="mt-1 text-sm text-slate-400">Manage users, announcements, and admin access from one place.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-white/10 bg-[#070c15] p-5 transition hover:border-white/20 hover:bg-[#0b1220]"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-100">{card.value}</p>
            <p className="mt-2 text-sm text-slate-400">{card.description}</p>
            <p className="mt-4 text-sm font-medium text-blue-300">Open section</p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#070c15] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-100">Resources Review Snapshot</h2>
          <Link href="/admin/resources" className="text-sm font-medium text-blue-300 hover:text-blue-200">
            Open Resources Review
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">Approved</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-100">{stats.approvedResources}</p>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-200">Rejected</p>
            <p className="mt-2 text-3xl font-semibold text-rose-100">{stats.rejectedResources}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-amber-200">Pending</p>
            <p className="mt-2 text-3xl font-semibold text-amber-100">{stats.pendingResources}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
