"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import {
  BadgeCheck,
  BarChart2,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Users,
  Video,
  X,
} from "lucide-react"
import { AdminRefreshButton } from "@/components/admin-refresh-button"

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Inbox", href: "/admin/inbox", icon: Mail },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Live Classes", href: "/admin/live-classes", icon: Video },
  { label: "Resources Notes", href: "/admin/resources-notes", icon: BookOpen },
  { label: "Doubts", href: "/admin/doubts", icon: MessageSquare },
  { label: "Settings", href: "/admin/details", icon: BadgeCheck },
]

const STORAGE_KEY = "admin-sidebar-collapsed"

export function AdminShell({
  email,
  avatarUrl,
  children,
}: {
  email: string
  avatarUrl: string | null
  children: ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1")
    } catch {}
  }, [])

  // Close the mobile drawer after navigating.
  useEffect(() => setMobileOpen(false), [pathname])

  const toggleDesktop = () => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(STORAGE_KEY, prev ? "0" : "1")
      } catch {}
      return !prev
    })
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href))
  const initial = (email.trim()[0] || "A").toUpperCase()

  return (
    <main className="relative h-screen overflow-hidden bg-[#050608] text-slate-100">
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <div className="flex h-full w-full">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-white/5 bg-[#080a0d] p-3 transition-all duration-200 md:static md:shrink-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } ${collapsed ? "w-64 md:w-[68px]" : "w-64"}`}
        >
          <div className={`flex h-12 items-center gap-3 ${collapsed ? "md:justify-center" : "px-2"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/admin-logo-dark.png" alt="BSPrep" className="h-9 w-9 shrink-0 object-contain" />
            <div className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
              <p className="text-base font-semibold leading-tight tracking-tight">BSPrep</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Admin console</p>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="rounded-md p-1 text-slate-400 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
            {NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  collapsed ? "md:justify-center md:px-0" : ""
                } ${isActive(href) ? "bg-[#121720] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={collapsed ? "md:hidden" : ""}>{label}</span>
              </Link>
            ))}
          </nav>

          <div
            className={`rounded-2xl border border-white/10 bg-[#070c15] p-3 ${
              collapsed ? "md:border-0 md:bg-transparent md:p-0" : ""
            }`}
          >
            <div className={`flex items-center gap-3 ${collapsed ? "md:justify-center" : ""}`}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  title={email}
                  className="aspect-square h-9 w-9 shrink-0 rounded-full border border-white/15 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  title={email}
                  className="flex aspect-square h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#1a1e26] text-xs font-semibold"
                >
                  {initial}
                </div>
              )}
              <p className={`truncate text-sm font-medium text-slate-300 ${collapsed ? "md:hidden" : ""}`}>{email}</p>
            </div>
            <form action="/auth/signout" method="post" className="mt-3">
              <button
                type="submit"
                title="Sign out"
                aria-label="Sign out"
                className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 ${
                  collapsed ? "md:mx-auto md:w-9" : ""
                }`}
                suppressHydrationWarning
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className={collapsed ? "md:hidden" : ""}>Sign Out</span>
              </button>
            </form>
          </div>
        </aside>

        <section className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-[#090b10]/80 px-4 py-3 backdrop-blur md:px-7">
            <button
              onClick={() => {
                if (window.matchMedia("(min-width: 768px)").matches) toggleDesktop()
                else setMobileOpen(true)
              }}
              aria-label="Toggle sidebar"
              className="rounded-lg border border-white/10 bg-[#0b1220] p-2 text-slate-300 transition hover:bg-[#0f1729] hover:text-white"
              suppressHydrationWarning
            >
              <Menu className="h-4 w-4" />
            </button>
            <AdminRefreshButton />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-7">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </div>
        </section>
      </div>
    </main>
  )
}
