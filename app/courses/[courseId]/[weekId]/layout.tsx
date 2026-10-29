import type { Metadata } from "next"

// Week pages are part of the enrolled student experience, not search landing pages.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function WeekLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
