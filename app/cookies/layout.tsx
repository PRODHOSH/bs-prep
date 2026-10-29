import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: "BSPrep uses essential cookies for sign in and Google Analytics for anonymous usage. No advertising cookies and no data sold.",
  path: "/cookies",
})

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
