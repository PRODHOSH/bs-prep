import Link from "next/link"
import { createServiceRoleClient } from "@/lib/supabase/server"

async function getPortalStats() {
  const service = createServiceRoleClient()

  const [{ count: userCount }, { count: announcementCount }, { count: adminCount }, { data: paidCourses }] = await Promise.all([
    service.from("profiles").select("id", { count: "exact", head: true }),
    service.from("announcements").select("id", { count: "exact", head: true }),
    service.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    service.from("courses").select("id").eq("type", "paid"),
  ])

  const paidCourseIds = (paidCourses ?? []).map((row) => row.id)
  let paidEnrollmentCount = 0

  if (paidCourseIds.length > 0) {
    const { count } = await service
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .in("course_id", paidCourseIds)

    paidEnrollmentCount = count ?? 0
  }

  return {
    users: userCount ?? 0,
    announcements: announcementCount ?? 0,
    admins: adminCount ?? 0,
    paidEnrollments: paidEnrollmentCount,
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
      title: "Admin Details",
      description: "View admin profiles and active admins list.",
      href: "/admin/details",
      value: stats.admins,
    },
    {
      title: "Course Access",
      description: "See buyers and grant paid course access manually.",
      href: "/admin/course-access",
      value: stats.paidEnrollments,
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-semibold uppercase italic tracking-tight text-white">Admin Portal</h1>
        <p className="mt-1 text-sm text-slate-400">Manage users, announcements, and admin access from one place.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
    </div>
  )
}
