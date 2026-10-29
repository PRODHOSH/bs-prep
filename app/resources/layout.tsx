import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "IITM BS Notes & Study Resources",
  description: "Curated notes, reference material and cheat sheets for the IIT Madras BS degree, shared by students and organised by subject.",
  path: "/resources",
  keywords: ["IITM BS notes", "IITM BS study material", "IIT Madras BS resources", "IITM BS cheat sheets", "Data Science notes"],
})

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
