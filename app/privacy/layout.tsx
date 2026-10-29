import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How BSPrep collects, uses and protects your personal data. Payments run through Razorpay, and we never sell your data.",
  path: "/privacy",
})

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
