import type { CSSProperties } from "react"

export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div style={style} className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />
}

export function HeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-64 max-w-full" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  )
}

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-[#070c15] p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-20" />
          <Skeleton className="mt-3 h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#070c15] p-5 ${className}`}>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <div className="mt-6 flex h-52 items-end gap-2">
        {[40, 62, 48, 75, 58, 82, 66, 90, 72, 55, 78, 64].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

/** Rows inside a panel: a title line, a subtitle and a trailing action. */
export function RowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0a101c] p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="hidden h-8 w-24 sm:block" />
        </div>
      ))}
    </div>
  )
}

export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#070c15] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="hidden h-10 w-64 sm:block" />
      </div>
      <RowsSkeleton rows={rows} />
    </div>
  )
}

export function PageSkeleton({ stats = false, chart = false }: { stats?: boolean; chart?: boolean }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <HeaderSkeleton />
      {stats && <StatCardsSkeleton />}
      {chart ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartSkeleton className="lg:col-span-2" />
          <div className="rounded-2xl border border-white/10 bg-[#070c15] p-5">
            <Skeleton className="h-4 w-36" />
            <div className="mt-5 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ) : (
        <PanelSkeleton />
      )}
    </div>
  )
}
