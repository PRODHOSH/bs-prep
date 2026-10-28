import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "BSPrep refund policy. Payments are processed by Razorpay and any approved refund is returned to the original payment method through Razorpay. Platform charges are not refunded.",
  alternates: { canonical: "/refund-policy" },
  openGraph: {
    title: "Refund Policy | BSPrep",
    description: "How payments and refunds work on BSPrep. Refunds are issued only through Razorpay.",
  },
}

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
