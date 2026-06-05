import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "BSPrep uses essential cookies for authentication and Google Analytics for anonymous usage insights. No advertising cookies. No data sold.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    title: "Cookie Policy | BSPrep",
    description: "BSPrep uses minimal cookies — Supabase auth sessions and anonymous Google Analytics. No advertising or tracking cookies.",
  },
}

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
