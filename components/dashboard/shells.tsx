"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  BadgeCheck,
  BarChart2,
  Bell,
  BookOpen,
  Calculator,
  Calendar,
  Code,
  FileText,
  LayoutDashboard,
  Library,
  LineChart,
  Mail,
  Megaphone,
  MessageCircleQuestion,
  MessageSquare,
  PenTool,
  Settings,
  Users,
  Video,
} from "lucide-react"
import { AdminRefreshButton } from "@/components/admin-refresh-button"
import { DashboardShell, type DashboardTheme, type NavSection } from "@/components/dashboard/shell"
import { createClient } from "@/lib/supabase/client"
import { PROFILE_UPDATED_EVENT, getDisplayProfile, getUserCached, resetUserCache } from "@/lib/supabase/cached-user"

type UserInfo = { email: string; name?: string; avatarUrl?: string | null }

const ADMIN_NAV: NavSection[] = [
  {
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Inbox", href: "/admin/inbox", icon: Mail },
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { label: "Live classes", href: "/admin/live-classes", icon: Video },
      { label: "Resources notes", href: "/admin/resources-notes", icon: BookOpen },
      { label: "Doubts", href: "/admin/doubts", icon: MessageSquare },
      { label: "Settings", href: "/admin/details", icon: BadgeCheck },
    ],
  },
]

export function AdminShell({ user, initialTheme, children }: { user: UserInfo; initialTheme?: DashboardTheme; children: ReactNode }) {
  return (
    <DashboardShell
      sections={ADMIN_NAV}
      user={user}
      signOutAction="/auth/signout"
      homeHref="/admin"
      storageKey="admin-sidebar-collapsed"
      initialTheme={initialTheme}
      topRight={<AdminRefreshButton />}
    >
      {children}
    </DashboardShell>
  )
}

const MENTOR_NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/mentor", icon: LayoutDashboard, exact: true },
      { label: "Live classes", href: "/mentor/live-classes", icon: Video },
      { label: "Doubts", href: "/mentor/doubts", icon: MessageSquare },
      { label: "Settings", href: "/mentor/settings", icon: Settings },
    ],
  },
]

export function MentorShell({ user, initialTheme, children }: { user: UserInfo; initialTheme?: DashboardTheme; children: ReactNode }) {
  return (
    <DashboardShell
      sections={MENTOR_NAV}
      user={user}
      signOutAction="/auth/signout?next=/mentor/signin"
      homeHref="/mentor"
      storageKey="mentor-sidebar-collapsed"
      initialTheme={initialTheme}
    >
      {children}
    </DashboardShell>
  )
}

// Same storage keys the notification dropdown already uses, so "seen" state stays shared.
const idOfClass = (c: { course?: string; date?: string; time?: string }) => `${c.course}-${c.date}-${c.time}`
const idOfAnnouncement = (a: { id: string | number }) => `announcement-${a.id}`

function readSeen(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Number of live classes and announcements the student has not opened yet. */
function useUnreadNotifications(viewing: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const [cls, ann] = await Promise.all([
          fetch("/api/live-classes").then((r) => (r.ok ? r.json() : { classes: [] })),
          fetch("/api/announcements").then((r) => (r.ok ? r.json() : [])),
        ])
        const now = Date.now()
        const upcoming = (cls.classes ?? []).filter((c: { time?: string; date: string }) => {
          try {
            const [h, m] = (c.time || "0:0").split(":").map(Number)
            const d = new Date(c.date)
            d.setHours(h, m, 0, 0)
            return d.getTime() + 60 * 60 * 1000 > now
          } catch {
            return true
          }
        })
        const announcements: { id: string | number }[] = Array.isArray(ann) ? ann : []
        if (viewing) {
          // Opening the notifications page counts as reading everything on it.
          try {
            localStorage.setItem("bsprep_seen_notifs", JSON.stringify(Array.from(new Set([...readSeen("bsprep_seen_notifs"), ...upcoming.map(idOfClass)]))))
            localStorage.setItem("bsprep_seen_announcements", JSON.stringify(Array.from(new Set([...readSeen("bsprep_seen_announcements"), ...announcements.map(idOfAnnouncement)]))))
          } catch {}
          if (alive) setCount(0)
          return
        }
        const seenClasses = readSeen("bsprep_seen_notifs")
        const seenAnnouncements = readSeen("bsprep_seen_announcements")
        const unread =
          upcoming.filter((c: { course?: string; date?: string; time?: string }) => !seenClasses.includes(idOfClass(c))).length +
          announcements.filter((a) => !seenAnnouncements.includes(idOfAnnouncement(a))).length
        if (alive) setCount(unread)
      } catch {}
    }
    load()
    const t = setInterval(load, 60_000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [viewing])
  return count
}

export function StudentShell({ initialTheme, children }: { initialTheme?: DashboardTheme; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const unread = useUnreadNotifications(pathname.startsWith("/dashboard/notifications"))
  const [user, setUser] = useState<UserInfo | null>(null)

  // The shell paints straight away; the user and role are filled in as soon as they arrive.
  useEffect(() => {
    let alive = true
    ;(async () => {
      const {
        data: { user: authUser },
      } = await getUserCached()
      if (!alive || !authUser) return
      const meta = authUser.user_metadata ?? {}
      const profile = await getDisplayProfile()
      if (!alive) return
      setUser({ email: authUser.email ?? "", name: profile.name ?? undefined, avatarUrl: profile.avatarUrl })

      try {
        const res = await fetch("/api/account/me", { cache: "no-store" })
        const role = res.ok ? (await res.json())?.profile?.role : meta.role
        // Admins and mentors land on their own console when they open the student home.
        if (window.location.pathname === "/dashboard") {
          if (role === "admin") router.push("/admin")
          else if (role === "mentor") router.push("/mentor")
        }
      } catch {}
    })()
    const refresh = async () => {
      const profile = await getDisplayProfile()
      const {
        data: { user: authUser },
      } = await getUserCached()
      if (alive && authUser) setUser({ email: authUser.email ?? "", name: profile.name ?? undefined, avatarUrl: profile.avatarUrl })
    }
    window.addEventListener(PROFILE_UPDATED_EVENT, refresh)
    return () => {
      alive = false
      window.removeEventListener(PROFILE_UPDATED_EVENT, refresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sections: NavSection[] = [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true, id: "tour-sidebar-dashboard" },
        { label: "Courses", href: "/dashboard/courses", icon: BookOpen, id: "tour-sidebar-courses" },
        { label: "Quiz prep", href: "/dashboard/quiz-prep", icon: PenTool, id: "tour-sidebar-quiz-prep" },
        { label: "Compiler", href: "/dashboard/compiler", icon: Code, id: "tour-sidebar-compiler" },
        { label: "Resources", href: "/dashboard/resources", icon: Library, id: "tour-sidebar-resources" },
        { label: "Official docs", href: "/dashboard/docs", icon: FileText, id: "tour-sidebar-official-docs" },
        { label: "Calendar", href: "/dashboard/calendar", icon: Calendar, id: "tour-sidebar-calendar" },
        { label: "Doubts", href: "/dashboard/doubts", icon: MessageCircleQuestion, id: "tour-sidebar-doubts" },
        { label: "Live classes", href: "/dashboard/live-classes", icon: Video, id: "tour-sidebar-live-classes" },
      ],
    },
    {
      title: "Tools",
      items: [
        { label: "GPA calculator", href: "/dashboard/tools/gpa-calculator", icon: Calculator, id: "tour-sidebar-gpa-calculator" },
        { label: "GPA predictor", href: "/dashboard/tools/gpa-predictor", icon: LineChart, id: "tour-sidebar-gpa-predictor" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Notifications", href: "/dashboard/notifications", icon: Bell, id: "tour-sidebar-notifications", badge: unread },
        { label: "Settings", href: "/dashboard/settings", icon: Settings, id: "tour-sidebar-settings" },
      ],
    },
  ]

  const signOut = async () => {
    await createClient().auth.signOut()
    resetUserCache()
    router.push("/?login=true")
    router.refresh()
  }

  return (
    <DashboardShell
      sections={sections}
      user={user}
      onSignOut={signOut}
      homeHref="/dashboard"
      storageKey="student-sidebar-collapsed"
      initialTheme={initialTheme}
    >
      {children}
    </DashboardShell>
  )
}
