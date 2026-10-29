import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "The terms for using BSPrep, a student-led IITM BS prep platform: accounts, payments through Razorpay, refunds, acceptable use and certificates.",
  path: "/terms",
})

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
