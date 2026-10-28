import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

// Page-shaped loading skeletons for the student, mentor and admin dashboards.
// Each composition mirrors the real page layout so content swaps in without the page jumping.

export function Sk({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div style={style} className={cn("animate-pulse rounded-md bg-foreground/[0.08]", className)} />
}

/** Shared page frame: marks the region as busy for assistive tech. */
function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-6", className)} aria-busy="true" aria-live="polite" aria-label="Loading">
      {children}
    </div>
  )
}

export function SkHeader({ action = false }: { action?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-2.5">
        <Sk className="h-9 w-56 max-w-full rounded-lg" />
        <Sk className="h-4 w-80 max-w-full" />
      </div>
      {action && <Sk className="h-10 w-32 rounded-xl" />}
    </div>
  )
}

export function SkTabs({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-6 border-b pb-3">
      {Array.from({ length: count }).map((_, i) => (
        <Sk key={i} className="h-4 w-20" />
      ))}
    </div>
  )
}

export function SkToolbar({ chips = 0 }: { chips?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {Array.from({ length: chips }).map((_, i) => (
        <Sk key={i} className="h-9 w-24 rounded-lg" />
      ))}
      <Sk className="ml-auto h-10 w-full rounded-xl sm:w-64" />
    </div>
  )
}

export function SkStats({ count = 3, cols = "sm:grid-cols-3" }: { count?: number; cols?: string }) {
  return (
    <div className={cn("grid gap-5", cols)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <Sk className="h-4 w-24" />
            <Sk className="size-8 rounded-xl" />
          </div>
          <Sk className="mt-4 h-8 w-20" />
          <Sk className="mt-3 h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

/** Rows like the doubts / announcements / notes lists: icon or tag line, title and a trailing action. */
export function SkRows({ rows = 4, icon = false }: { rows?: number; icon?: boolean }) {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 rounded-2xl border bg-card p-5">
          {icon && <Sk className="size-11 shrink-0 rounded-xl" />}
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex gap-2">
              <Sk className="h-5 w-16 rounded-md" />
              <Sk className="h-5 w-20 rounded-md" />
            </div>
            <Sk className="h-4 w-2/3" />
            <Sk className="h-3 w-1/3" />
          </div>
          <Sk className="hidden size-8 shrink-0 rounded-lg sm:block" />
        </li>
      ))}
    </ul>
  )
}

/** Cards like course and live-class tiles. */
export function SkCards({ count = 6, image = true, cols = "sm:grid-cols-2 xl:grid-cols-3" }: { count?: number; image?: boolean; cols?: string }) {
  return (
    <ul className={cn("grid gap-5", cols)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-2xl border bg-card p-2.5">
          {image ? <Sk className="h-32 rounded-xl" /> : <Sk className="mx-2 mt-2.5 h-5 w-20 rounded-md" />}
          <div className="space-y-2.5 px-1.5 pb-2 pt-3.5">
            <Sk className="h-4 w-5/6" />
            <Sk className="h-3 w-1/2" />
            <div className="flex gap-1.5 pt-1.5">
              <Sk className="h-5 w-14 rounded-md" />
              <Sk className="h-5 w-16 rounded-md" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function SkTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card" aria-hidden>
      <div className="flex gap-6 border-b bg-muted/50 px-4 py-3.5">
        {Array.from({ length: cols }).map((_, i) => (
          <Sk key={i} className={cn("h-3", i === 0 ? "w-1/4" : "w-16")} />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 px-4 py-3.5">
            <div className="flex w-1/4 items-center gap-3">
              <Sk className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Sk className="h-3.5 w-3/4" />
                <Sk className="h-3 w-1/2" />
              </div>
            </div>
            {Array.from({ length: cols - 1 }).map((_, c) => (
              <Sk key={c} className="h-4 w-16" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkCard({ className, lines = 3, title = true }: { className?: string; lines?: number; title?: boolean }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)} aria-hidden>
      {title && <Sk className="mb-4 h-4 w-36" />}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Sk key={i} className={cn("h-4", i % 3 === 2 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  )
}

export function SkChart({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)} aria-hidden>
      <div className="flex items-center justify-between">
        <Sk className="h-4 w-44" />
        <Sk className="h-3 w-24" />
      </div>
      <div className="mt-6 flex h-52 items-end gap-2">
        {[40, 62, 48, 75, 58, 82, 66, 90, 72, 55, 78, 64].map((h, i) => (
          <Sk key={i} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export function SkForm({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6" aria-hidden>
      <div className="flex items-center gap-3">
        <Sk className="size-9 rounded-xl" />
        <div className="space-y-2">
          <Sk className="h-4 w-28" />
          <Sk className="h-3 w-48" />
        </div>
      </div>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Sk className="h-3.5 w-24" />
          <Sk className="h-10 w-full rounded-xl" />
        </div>
      ))}
      <Sk className="ml-auto h-10 w-32 rounded-xl" />
    </div>
  )
}

// ── Page compositions ────────────────────────────────────────────────────────

/** Greeting, quick links, two cards, then a card grid with a right-hand column. */
export function HomeSkeleton() {
  return (
    <Frame>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-7">
          <SkHeader />
          <div className="flex flex-wrap gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Sk className="size-8 rounded-lg" />
                <Sk className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <SkCard lines={3} />
            <SkCard lines={3} />
          </div>
          <SkCards count={3} cols="sm:grid-cols-2 2xl:grid-cols-3" image={false} />
        </div>
        <div className="space-y-5">
          <SkCard lines={4} title={false} className="h-56" />
          <SkCard lines={3} />
        </div>
      </div>
    </Frame>
  )
}

/** Admin overview: stat row, chart with a side column. */
export function DashboardOverviewSkeleton() {
  return (
    <Frame>
      <SkHeader action />
      <SkStats count={4} cols="sm:grid-cols-2 xl:grid-cols-4" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <SkChart />
        <div className="space-y-5">
          <SkCard lines={2} />
          <SkCard lines={3} />
        </div>
      </div>
    </Frame>
  )
}

export function AnalyticsSkeleton() {
  return (
    <Frame>
      <SkHeader action />
      <SkTabs count={2} />
      <SkStats count={4} cols="sm:grid-cols-2 xl:grid-cols-4" />
      <SkChart />
      <div className="grid gap-5 lg:grid-cols-2">
        <SkCard lines={5} />
        <SkCard lines={5} />
      </div>
    </Frame>
  )
}

/** Header, tabs, toolbar and a card grid (courses, live classes, docs). */
export function GridPageSkeleton({ tabs = 3, chips = 3, count = 6, image = true, toolbar = true }: { tabs?: number; chips?: number; count?: number; image?: boolean; toolbar?: boolean }) {
  return (
    <Frame>
      <SkHeader />
      {tabs > 0 && <SkTabs count={tabs} />}
      {toolbar && <SkToolbar chips={chips} />}
      <SkCards count={count} image={image} />
    </Frame>
  )
}

/** Header, tabs, search and a list (doubts, notifications, notes review). */
export function ListPageSkeleton({ tabs = 3, rows = 5, icon = false, action = false }: { tabs?: number; rows?: number; icon?: boolean; action?: boolean }) {
  return (
    <Frame>
      <SkHeader action={action} />
      {tabs > 0 && <SkTabs count={tabs} />}
      <Sk className="h-10 w-full rounded-xl sm:w-72" />
      <SkRows rows={rows} icon={icon} />
    </Frame>
  )
}

export function TablePageSkeleton({ tabs = 4, rows = 7, cols = 4, action = false }: { tabs?: number; rows?: number; cols?: number; action?: boolean }) {
  return (
    <Frame>
      <SkHeader action={action} />
      {tabs > 0 && <SkTabs count={tabs} />}
      <SkToolbar chips={2} />
      <SkTable rows={rows} cols={cols} />
    </Frame>
  )
}

/** Breadcrumb, hero text, tabs and a sticky side card (course detail). */
export function DetailPageSkeleton() {
  return (
    <Frame>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Sk className="h-4 w-48" />
          <div className="space-y-3">
            <div className="flex gap-2">
              <Sk className="h-5 w-16 rounded-md" />
              <Sk className="h-5 w-20 rounded-md" />
            </div>
            <Sk className="h-10 w-3/4 rounded-lg" />
            <Sk className="h-4 w-full max-w-xl" />
            <Sk className="h-4 w-2/3 max-w-md" />
          </div>
          <SkTabs count={4} />
          <SkRows rows={3} icon />
        </div>
        <div className="space-y-5">
          <SkCard lines={3} title={false} className="h-72" />
          <SkCard lines={3} />
        </div>
      </div>
    </Frame>
  )
}

/** Profile-style page: stacked form sections and a profile card. */
export function SettingsSkeleton() {
  return (
    <Frame>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <SkHeader />
          <SkForm fields={3} />
          <SkForm fields={2} />
        </div>
        <div className="space-y-4 rounded-2xl border bg-card p-6 xl:mt-[4.25rem]" aria-hidden>
          <Sk className="mx-auto size-[88px] rounded-full" />
          <Sk className="mx-auto h-5 w-40" />
          <Sk className="mx-auto h-5 w-16 rounded-md" />
          <Sk className="mx-auto h-3 w-44" />
        </div>
      </div>
    </Frame>
  )
}

/** Header followed by one or two form cards (new doubt, tools, inbox). */
export function FormPageSkeleton({ aside = false, fields = 4 }: { aside?: boolean; fields?: number }) {
  return (
    <Frame>
      <SkHeader />
      <div className={cn("grid gap-6", aside && "xl:grid-cols-2")}>
        <SkForm fields={fields} />
        {aside && <SkCard lines={9} className="min-h-[24rem]" />}
      </div>
    </Frame>
  )
}

/** A thread: question card then replies and a composer. */
export function ThreadSkeleton() {
  return (
    <Frame className="mx-auto max-w-3xl">
      <Sk className="h-4 w-32" />
      <div className="space-y-4 rounded-2xl border bg-card p-6" aria-hidden>
        <div className="flex gap-2">
          <Sk className="h-5 w-20 rounded-md" />
          <Sk className="h-5 w-14 rounded-md" />
        </div>
        <Sk className="h-8 w-3/4 rounded-lg" />
        <div className="flex items-center gap-3 border-b pb-5">
          <Sk className="size-9 rounded-full" />
          <div className="space-y-2">
            <Sk className="h-3.5 w-28" />
            <Sk className="h-3 w-20" />
          </div>
        </div>
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-5/6" />
        <Sk className="h-4 w-2/3" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex gap-3" aria-hidden>
          <Sk className="size-9 shrink-0 rounded-full" />
          <Sk className="h-24 flex-1 rounded-2xl rounded-tl-sm" />
        </div>
      ))}
    </Frame>
  )
}

export function SkCalendarGrid() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card" aria-hidden>
      <div className="grid grid-cols-7 border-b bg-muted/50 p-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Sk key={i} className="mx-auto h-3 w-8" />
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[7rem] border-b border-r p-2">
            <Sk className="size-7 rounded-full" />
            {i % 4 === 1 && <Sk className="mt-2 h-6 w-full rounded-md" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <Frame>
      <SkHeader action />
      <SkCalendarGrid />
    </Frame>
  )
}

/** Resources: header, selectors, subject list, notes grid and contributors. */
export function ResourcesSkeleton() {
  return (
    <Frame>
      <SkHeader action />
      <div className="flex gap-3">
        <Sk className="h-9 w-48 rounded-lg" />
        <Sk className="h-9 w-64 rounded-lg" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_21rem]">
        <SkCard lines={6} />
        <SkCards count={4} image={false} cols="md:grid-cols-2" />
        <SkCard lines={5} className="lg:col-span-2 xl:col-span-1" />
      </div>
    </Frame>
  )
}

/** Generic fallback: header with a single content panel. */
export function PageSkeleton() {
  return (
    <Frame>
      <SkHeader />
      <SkRows rows={4} />
    </Frame>
  )
}

/** Compiler: toolbar, file tabs and the editor / output split, inside one card. */
export function CompilerSkeleton() {
  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-2xl border bg-card" aria-busy="true" aria-label="Loading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
        <Sk className="h-9 w-36 rounded-xl" />
        <div className="flex gap-2">
          <Sk className="size-9 rounded-xl" />
          <Sk className="size-9 rounded-xl" />
          <Sk className="size-9 rounded-xl" />
          <Sk className="h-9 w-24 rounded-xl" />
        </div>
      </div>
      <div className="flex gap-2 border-b bg-muted/40 p-2">
        <Sk className="h-8 w-24 rounded-lg" />
      </div>
      <div className="grid min-h-0 flex-1 gap-px bg-border md:grid-cols-[58fr_42fr]">
        <div className="space-y-2.5 bg-card p-4">
          {[60, 35, 70, 50, 28, 64].map((w, i) => (
            <Sk key={i} className="h-3.5" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="hidden space-y-3 bg-card p-4 md:block">
          <Sk className="h-4 w-20" />
          <Sk className="h-20 w-full rounded-xl" />
          <Sk className="h-4 w-24" />
          <Sk className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
