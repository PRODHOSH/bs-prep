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

/** Full-page replacement for the checkout screens. */
export function EnrollmentsClosedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200">
        <Lock className="h-7 w-7 text-red-600" />
      </div>
      <h1 className="mb-3 text-2xl font-black uppercase tracking-tight text-black">Enrollments are closed</h1>
      <p className="mb-8 max-w-md text-sm font-bold uppercase leading-relaxed tracking-widest text-black/50">
        We are not accepting new enrollments or payments right now. Existing students keep full access.
      </p>
      <Link
        href="/dashboard/courses"
        className="rounded-full bg-black px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-black/80"
      >
        Back to courses
      </Link>
    </div>
  )
}
