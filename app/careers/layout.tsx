import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Careers: Developer, Mentor & Internships",
  description: "Join the student-led BSPrep team. Paid developer and mentor roles, plus internships in curriculum, marketing and design.",
  path: "/careers",
  keywords: ["BSPrep careers", "IITM BS mentor job", "student developer job", "edtech internship India"],
})

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
