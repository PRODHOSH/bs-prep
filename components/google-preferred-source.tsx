import { ArrowUpRight } from "lucide-react"
import { PREFERRED_SOURCE_URL } from "@/lib/legal"

// Google "G" mark, drawn inline so it needs no extra request and stays crisp at any size.
function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

/** Footer card that opens Google's "preferred sources" page with bsprep.in pre-filled. */
export function GooglePreferredSource({ className = "" }: { className?: string }) {
  return (
    <a
      href={PREFERRED_SOURCE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex w-full max-w-sm items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition-all hover:border-black/25 hover:shadow ${className}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4f4f4]">
        <GoogleG />
      </span>
      <span className="min-w-0 normal-case">
        <span className="block text-sm font-bold leading-tight text-black">Add BSPrep as a preferred source</span>
        <span className="block text-xs font-medium text-black/55">See our updates first on Google</span>
      </span>
      <ArrowUpRight className="ml-auto size-4 shrink-0 text-black/40 transition-colors group-hover:text-black" />
    </a>
  )
}
