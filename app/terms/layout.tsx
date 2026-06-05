import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read BSPrep's Terms & Conditions. Student-led IITM BS Qualifier prep platform — not affiliated with IIT Madras. Payments processed via Razorpay.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms & Conditions | BSPrep",
    description: "BSPrep Terms & Conditions. Student-led platform for IITM BS Qualifier preparation. Not affiliated with IIT Madras.",
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
