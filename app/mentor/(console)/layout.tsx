import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { hasMentorRole } from "@/lib/security/mentor-role"
import { LogOut, MessageCircle, LayoutDashboard } from "lucide-react"

type MentorConsoleLayoutProps = {
  children: React.ReactNode
}

export default async function MentorConsoleLayout({ children }: MentorConsoleLayoutProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/mentor/signin")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, avatar_url, first_name, last_name, mentor_subject, mentor_subjects")
    .eq("id", user.id)
    .maybeSingle()

  const isMentor = await hasMentorRole(user.id, user.email)

  if (!isMentor) {
    await supabase.auth.signOut()
    redirect("/mentor/signin?error=access_denied")
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/mentor",
      icon: LayoutDashboard,
    },
    {
      label: "Student Chats",
      href: "/mentor/chats",
      icon: MessageCircle,
    },
  ]

  const avatarUrl =
    profile?.avatar_url ||
    (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ||
    (typeof user.user_metadata?.picture === "string" ? user.user_metadata.picture : null)

  const mentorName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
    user.user_metadata?.full_name ||
    "Mentor"

  return (
    <main className="h-screen overflow-hidden bg-[#0b141a] text-slate-100">
      <div className="mx-auto flex h-full w-full max-w-screen-2xl gap-0 px-0 md:px-4">
        <aside className="hidden h-screen w-72 shrink-0 border-r border-white/5 bg-[#0f1f26] p-5 md:flex md:flex-col">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-emerald-200">Mentor</h1>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/60">Student Support Desk</p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl bg-[#15303b] px-4 py-3 text-sm font-medium text-emerald-50 transition hover:bg-[#1c3c48]"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-[#102329] p-4">
            <div className="mb-3 flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Mentor avatar"
                  className="h-9 w-9 rounded-full border border-white/15 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#1a3741] text-xs font-semibold text-emerald-100">
                  {((profile?.email || user.email || "M").trim()[0] || "M").toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-emerald-50">{mentorName}</p>
                <p className="truncate text-xs text-emerald-100/70">{profile?.email || user.email}</p>
              </div>
            </div>
            <form action="/auth/signout?next=/mentor/signin" method="post" className="mt-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                suppressHydrationWarning
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        <section className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-white/5 bg-[#11252d] px-4 py-4 md:px-7">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100/80">Mentor Dashboard</h2>
              <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                Live Support
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-7">{children}</div>
        </section>
      </div>
    </main>
  )
}
