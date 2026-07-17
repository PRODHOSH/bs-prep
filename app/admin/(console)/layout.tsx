import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import {
  Award,
  BadgeCheck,
  BarChart2,
  BookOpen,
  HandHeart,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  Users,
  Menu,
  X,
  Video
} from "lucide-react"
import { AdminRefreshButton } from "@/components/admin-refresh-button"

type AdminLayoutProps = {
  children: React.ReactNode
}

export default async function AdminConsoleLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/signin")
  }

  // Single query: fetch email, avatar AND role — was 3 separate queries before
  const service = createServiceRoleClient()
  const { data: profile } = await service
    .from("profiles")
    .select("email, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role?.toLowerCase() !== "admin") {
    await supabase.auth.signOut()
    redirect("/admin/signin?error=access_denied")
  }

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      active: true,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
      active: true,
    },
    {
      label: "Announcements",
      href: "/admin/announcements",
      icon: Megaphone,
      active: true,
    },
    {
      label: "Live Classes",
      href: "/admin/live-classes",
      icon: Video,
      active: true,
    },
    {
      label: "Resources Notes",
      href: "/admin/resources-notes",
      icon: BookOpen,
      active: true,
    },
    {
      label: "Doubts",
      href: "/admin/doubts",
      icon: MessageSquare,
      active: true,
    },
    {
      label: "Settings",
      href: "/admin/details",
      icon: BadgeCheck,
      active: true,
    },
  ]

  const avatarUrl =
    profile?.avatar_url ||
    (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ||
    (typeof user.user_metadata?.picture === "string" ? user.user_metadata.picture : null)

  return (
    <main className="h-screen overflow-hidden bg-[#050608] text-slate-100 relative">
      <div className="mx-auto flex h-full w-full max-w-screen-2xl gap-0 px-0 md:px-4">
        <input type="checkbox" id="admin-mobile-menu" className="peer hidden" />
        
        {/* Mobile Overlay */}
        <label 
          htmlFor="admin-mobile-menu" 
          className="fixed inset-0 z-40 hidden bg-black/80 backdrop-blur-sm peer-checked:block md:hidden cursor-pointer"
        />

        <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-64 -translate-x-full flex-col border-r border-white/5 bg-[#080a0d] p-5 transition-transform duration-300 peer-checked:translate-x-0 md:static md:translate-x-0 md:shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Management Console</p>
            </div>
            <label htmlFor="admin-mobile-menu" className="md:hidden cursor-pointer text-slate-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </label>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${item.active
                      ? "bg-[#121720] text-slate-100"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-[#0c0f14] p-4">
            <div className="mb-3 flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Admin avatar"
                  className="h-9 w-9 rounded-full border border-white/15 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#1a1e26] text-xs font-semibold text-slate-200">
                  {((profile?.email || user.email || "A").trim()[0] || "A").toUpperCase()}
                </div>
              )}
              <p className="truncate text-sm font-semibold text-slate-200">{profile?.email || user.email}</p>
            </div>
            <form action="/auth/signout" method="post" className="mt-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
                suppressHydrationWarning
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        <section className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-white/5 bg-[#090b10]/80 px-4 py-4 backdrop-blur md:px-7">
            <div className="flex items-center justify-between md:justify-end">
              <label htmlFor="admin-mobile-menu" className="md:hidden cursor-pointer text-slate-300 hover:text-white p-1">
                <Menu className="h-6 w-6" />
              </label>
              <AdminRefreshButton />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-7">{children}</div>
        </section>
      </div>
    </main>
  )
}
