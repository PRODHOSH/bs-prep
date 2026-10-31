import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Building blocks for the student, mentor and admin dashboards.
// Card language, spacing and type scale follow the Quarry LMS template.

export const field =
  "h-10 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
export const btn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
export const btnPrimary = `${btn} bg-primary text-primary-foreground hover:opacity-90`
export const btnGhost = `${btn} border bg-card hover:bg-muted`
export const btnDanger = `${btn} border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15`

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function Card({
  title,
  aside,
  children,
  className,
}: {
  title?: string
  aside?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5", className)}>
      {title && (
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <h2 className="font-bold">{title}</h2>
          {aside && <span className="text-xs font-medium text-muted-foreground">{aside}</span>}
        </div>
      )}
      {children}
    </section>
  )
}

const TONES = {
  primary: "bg-chart-1/10 text-chart-1",
  amber: "bg-chart-2/15 text-chart-2",
  pink: "bg-chart-3/10 text-chart-3",
  green: "bg-chart-4/10 text-chart-4",
  cyan: "bg-chart-5/10 text-chart-5",
} as const
export type Tone = keyof typeof TONES

export function IconTile({ icon: Icon, tone = "primary", className }: { icon: React.ElementType; tone?: Tone; className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", TONES[tone], className)}>
      <Icon className="size-[18px]" />
    </span>
  )
}

/** A headline number with a label, optionally linking somewhere. */
export function Stat({
  label,
  value,
  hint,
  icon,
  tone,
  href,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: React.ElementType
  tone?: Tone
  href?: string
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        {icon && <IconTile icon={icon} tone={tone} className="size-8" />}
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  )
  const cls = "block rounded-2xl border bg-card p-5"
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-primary/40")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

/** Row used for "see all" style links at the bottom of a card. */
export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mt-4 flex items-center justify-between border-t pt-3 text-sm font-semibold hover:text-primary">
      {children}
      <ChevronRight className="size-4" />
    </Link>
  )
}

export function Avatar({ name, src, size = 36, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const tones = ["bg-chart-1/15 text-chart-1", "bg-chart-5/20 text-chart-5", "bg-chart-2/20 text-chart-2", "bg-chart-3/15 text-chart-3", "bg-chart-4/20 text-chart-4"]
  const tone = tones[(name.charCodeAt(0) + name.length) % tones.length]
  const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?"
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    )
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold", tone, className)}
    >
      {initials}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, hint, action, art }: { icon: React.ElementType; title: string; hint?: string; action?: ReactNode; art?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art} alt="" aria-hidden className="h-40 w-auto max-w-full" />
      ) : (
        <IconTile icon={Icon} className="size-12 rounded-2xl" />
      )}
      <p className="mt-4 text-base font-bold">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Small rounded label, same shape as the tags on LMS content cards. */
export function Tag({ children, tone = "muted", className }: { children: ReactNode; tone?: "muted" | Tone | "red"; className?: string }) {
  const tones: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    red: "bg-destructive/10 text-destructive",
    ...TONES,
  }
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold", tones[tone], className)}>{children}</span>
}

/** Inline success / error message. */
export function Notice({ tone = "info", children, className }: { tone?: "info" | "success" | "error"; children: ReactNode; className?: string }) {
  const tones = {
    info: "bg-muted text-foreground",
    success: "bg-chart-4/10 text-chart-4",
    error: "bg-destructive/10 text-destructive",
  }
  return <p role={tone === "error" ? "alert" : "status"} className={cn("rounded-xl px-3.5 py-2.5 text-sm font-medium", tones[tone], className)}>{children}</p>
}

/** Label above a control. */
export function Field({ label, hint, htmlFor, children, className }: { label: string; hint?: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Card with an icon tile, title and description in the header, as used on settings-style pages. */
export function Section({
  icon,
  tone,
  title,
  description,
  children,
  className,
}: {
  icon: React.ElementType
  tone?: Tone
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 sm:p-6", className)}>
      <div className="mb-5 flex items-center gap-3">
        <IconTile icon={icon} tone={tone} />
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-tight">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export const th = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground"
export const td = "px-4 py-3 align-middle"

/** Table shell matching the LMS reports table: muted header, hairline rows, rounded card. */
export function TableCard({ children, footer, className }: { children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">{children}</table>
      </div>
      {footer && <div className="flex items-center justify-between border-t px-4 py-3 text-sm">{footer}</div>}
    </div>
  )
}
