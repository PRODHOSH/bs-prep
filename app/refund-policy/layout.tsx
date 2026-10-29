import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Refund Policy",
  description: "BSPrep refund policy. Payments run through Razorpay, and any approved refund goes back to the original payment method. Platform charges are not refunded.",
  path: "/refund-policy",
})

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
