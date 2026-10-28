import Link from "next/link"
import { Lock } from "lucide-react"

/** Small pill that replaces the price on course cards. */
export function ClosedPill({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-600 ring-1 ring-red-200 ${className}`}
    >
      <Lock className="h-3 w-3" />
      Closed
    </span>
  )
}

/** Disabled stand-in for every "Enroll" button. */
export function ClosedButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      disabled
      className={`inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/10 px-8 text-sm font-black uppercase tracking-widest text-white/60 ring-1 ring-white/20 ${className}`}
    >
      <Lock className="h-4 w-4" />
      Enrollments closed
    </button>
  )
}

/** Full-page replacement for the checkout screens (dashboard styling). */
export function EnrollmentsClosedPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <Lock className="size-5" />
      </span>
      <h1 className="mt-4 text-xl font-extrabold tracking-tight">Enrollments are closed</h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        We aren&apos;t accepting new enrollments or payments right now. Existing students keep full access.
      </p>
      <Link
        href="/dashboard/courses"
        className="mt-6 inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Back to courses
      </Link>
    </div>
  )
}
