"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ComponentType, type ReactNode } from "react"
import { LogOut, Menu, Moon, Sun, X } from "lucide-react"
import { Avatar } from "@/components/dashboard/ui"
import { Sk } from "@/components/dashboard/skeleton"
import { manrope } from "@/lib/dashboard-font"
import { cn } from "@/lib/utils"

export type NavItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  /** Only highlight on an exact path match (for section roots like /admin). */
  exact?: boolean
  /** DOM id, kept so the product tour can still target links. */
  id?: string
  badge?: number
}

export type NavSection = { title?: string; items: NavItem[] }
export type DashboardTheme = "light" | "dark"

export const THEME_COOKIE = "dashboard-theme"

type Props = {
  sections: NavSection[]
  /** null while the signed-in user is still loading. */
  user: { email: string; name?: string; avatarUrl?: string | null } | null
  /** Server sign-out endpoint (form POST). Use onSignOut for client-side sign-out instead. */
  signOutAction?: string
  onSignOut?: () => void
  /** Rendered at the right of the top bar (refresh button, bell, ...). */
  topRight?: ReactNode
  /** Where the logo links to. */
  homeHref: string
  storageKey: string
  /** Theme read from the cookie on the server, so the first paint already matches. */
  initialTheme?: DashboardTheme
  children: ReactNode
}

function Logo({ href, dark, collapsed }: { href: string; dark: boolean; collapsed: boolean }) {
  return (
    <Link href={href} aria-label="BSPrep home" className="flex min-w-0 items-center gap-1.5">
      <span className="grid size-10 shrink-0 place-items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dark ? "/admin-logo-dark.png" : "/bsprep-mark.png"} alt="" className="size-9 object-contain" />
      </span>
      {/* Same wordmark as the landing-page navbar: Sora, black weight, tight tracking. */}
      <span
        style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 900, letterSpacing: "-0.05em" }}
        className={cn("text-2xl leading-none", collapsed && "md:hidden")}
      >
        BSPREP
      </span>
    </Link>
  )
}

export function DashboardShell({
  sections,
  user,
  signOutAction,
  onSignOut,
  topRight,
  homeHref,
  storageKey,
  initialTheme = "light",
  children,
}: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<DashboardTheme>(initialTheme)
  const dark = theme === "dark"

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(storageKey) === "1")
    } catch {}
  }, [storageKey])

  // Dialogs, menus and selects render in a portal outside this tree. Tagging <body> keeps them on the same
  // tokens and font, and the classes are removed on leaving so the public site is never affected.
  useEffect(() => {
    const body = document.body
    const fontClasses = manrope.variable.split(" ")
    body.classList.add("lms", ...fontClasses)
    body.classList.toggle("lms-dark", dark)
    return () => {
      body.classList.remove("lms", "lms-dark", ...fontClasses)
    }
  }, [dark])

  // Close the mobile drawer after navigating.
  useEffect(() => setMobileOpen(false), [pathname])

  const toggle = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setCollapsed((prev) => {
        try {
          localStorage.setItem(storageKey, prev ? "0" : "1")
        } catch {}
        return !prev
      })
    } else {
      setMobileOpen((o) => !o)
    }
  }

  const toggleTheme = () => {
    const next: DashboardTheme = dark ? "light" : "dark"
    setTheme(next)
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
  }

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)

  // On md+ the labels hide when collapsed; the mobile drawer always shows them.
  const hideLabel = collapsed ? "md:hidden" : ""
  const signOutCls = cn(
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
    collapsed && "md:justify-center md:px-0",
  )

  return (
    <div className={cn("lms flex h-svh overflow-hidden bg-background text-foreground", manrope.variable, dark && "lms-dark")}>
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        id="tour-sidebar-full"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-[width,transform] duration-200 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "md:w-[68px]" : "md:w-64",
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center justify-between px-4", collapsed && "md:justify-center md:px-0")}>
          <Logo href={homeHref} dark={dark} collapsed={collapsed} />
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav aria-label="Primary" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {sections.map((section, i) => (
            <div key={section.title ?? i}>
              {section.title && (
                <p className={cn("px-3 pb-1.5 text-xs font-semibold text-muted-foreground", hideLabel)}>{section.title}</p>
              )}
              {section.title && collapsed && <div className="mx-3 mb-2 hidden h-px bg-border md:block" />}
              <ul className="space-y-0.5">
                {section.items.map(({ label, href, icon: Icon, id, badge, exact }) => {
                  const active = isActive({ href, exact })
                  return (
                    <li key={href}>
                      <Link
                        id={id}
                        href={href}
                        title={collapsed ? label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                          collapsed && "md:justify-center md:px-0",
                          active ? "bg-accent font-semibold text-foreground" : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
                        <span className={cn("min-w-0 flex-1 truncate", hideLabel)}>{label}</span>
                        {!!badge && (
                          <span className={cn("rounded-full bg-destructive px-1.5 text-[10px] font-bold leading-4 text-white", collapsed && "md:absolute md:right-2 md:top-1.5")}>
                            {badge > 9 ? "9+" : badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className={cn("shrink-0 border-t p-3", collapsed && "md:px-0")}>
          <div className={cn("flex items-center gap-3 rounded-xl px-2 py-1.5", collapsed && "md:justify-center")}>
            {user ? (
              <Avatar name={user.name || user.email || "?"} src={user.avatarUrl} size={34} />
            ) : (
              <Sk className="size-[34px] shrink-0 rounded-full" />
            )}
            <div className={cn("min-w-0 flex-1", hideLabel)}>
              {user ? (
                <>
                  {user.name && <p className="truncate text-sm font-bold leading-tight">{user.name}</p>}
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Sk className="h-3.5 w-24" />
                  <Sk className="h-3 w-32" />
                </div>
              )}
            </div>
          </div>
          {signOutAction ? (
            <form action={signOutAction} method="post" className="mt-1">
              <button type="submit" title="Sign out" suppressHydrationWarning className={signOutCls}>
                <LogOut className="size-[18px] shrink-0" />
                <span className={hideLabel}>Sign out</span>
              </button>
            </form>
          ) : (
            <button type="button" title="Sign out" onClick={onSignOut} className={cn(signOutCls, "mt-1")}>
              <LogOut className="size-[18px] shrink-0" />
              <span className={hideLabel}>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4 md:px-6">
          <button
            onClick={toggle}
            aria-label="Toggle sidebar"
            suppressHydrationWarning
            className="grid size-10 place-items-center rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Menu className="size-[18px]" />
          </button>
          <div className="flex items-center gap-2">
            {topRight}
            <button
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              title={dark ? "Light theme" : "Dark theme"}
              suppressHydrationWarning
              className="grid size-10 place-items-center rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
          </div>
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
