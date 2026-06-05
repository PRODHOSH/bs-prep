import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how BSPrep collects, uses, and protects your personal data. We use Google Analytics, Supabase, Razorpay, and Resend — and we never sell your data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | BSPrep",
    description: "Learn how BSPrep collects, uses, and protects your personal data. Student-led platform, not affiliated with IIT Madras.",
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
