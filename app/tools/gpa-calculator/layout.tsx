import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IITM BS GPA Calculator | Calculate Your CGPA & Semester GPA",
  description: "The most accurate GPA calculator for IITM BS Degree students. Easily calculate your semester GPA and cumulative CGPA across all degrees including Data Science, Electronics, Aeronautics, and Management.",
  keywords: ["GPA calculator IITM BS", "calculate CGPA", "IITM BS grades", "credit based GPA", "BS Data Science CGPA", "IITM BS Electronics GPA"],
  openGraph: {
    title: "IITM BS GPA & CGPA Calculator | BSPrep",
    description: "The most accurate GPA calculator for IITM BS Degree students. Calculate your semester GPA and cumulative CGPA instantly.",
    url: "https://bsprep.in/tools/gpa-calculator",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IITM BS GPA Calculator | BSPrep",
    description: "The most accurate GPA calculator for IITM BS Degree students.",
    images: ["/og-image.png"],
  },
}

export default function GPACalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
