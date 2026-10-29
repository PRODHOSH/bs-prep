import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

// /tools redirects to the GPA calculator (see next.config.mjs). This keeps the tool pages' metadata consistent.
export const metadata: Metadata = pageMetadata({
  title: "IITM BS GPA Tools: Calculator & Predictor",
  description: "Free GPA tools for IITM BS students. Calculate your course grade and semester GPA, then predict the exam score you need for your target grade.",
  path: "/tools/gpa-calculator",
  keywords: ["IITM BS GPA calculator", "IITM BS GPA predictor", "CGPA calculator IITM BS", "IITM BS student tools"],
})

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
