import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import { breadcrumbLd, pageMetadata, webAppLd } from "@/lib/seo"

const path = "/tools/gpa-calculator"

export const metadata: Metadata = pageMetadata({
  title: "IITM BS GPA & CGPA Calculator",
  description: "Free IITM BS GPA calculator. Work out your course grade and semester GPA for Data Science, Electronic Systems and other degree programs in seconds.",
  path,
  keywords: ["IITM BS GPA calculator", "IITM BS CGPA calculator", "IITM BS grade calculator", "semester GPA calculator", "BS Data Science GPA"],
})

export default function GPACalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webAppLd({ name: "IITM BS GPA Calculator", description: "Calculate your course grade and semester GPA for IITM BS courses.", path, category: "EducationalApplication" }),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }, { name: "GPA calculator", path }]),
        ]}
      />
      {children}
    </>
  )
}
