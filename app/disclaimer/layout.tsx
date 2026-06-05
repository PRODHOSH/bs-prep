import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "BSPrep is an independent, student-led platform for IITM BS Qualifier prep. We are not affiliated with IIT Madras and do not guarantee exam results.",
  alternates: { canonical: "/disclaimer" },
  openGraph: {
    title: "Disclaimer | BSPrep",
    description: "BSPrep is an independent student initiative, not affiliated with IIT Madras. No guaranteed exam results.",
  },
}

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
