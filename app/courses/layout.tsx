import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IITM BS Courses | Tamil Video Lectures",
  description: "Master IITM BS subjects with comprehensive video courses in Tamil. Qualified mentors, live sessions, and structured study material for Mathematics, Statistics, and more.",
  keywords: ["IITM BS courses", "Tamil video lectures", "IITM BS Qualifier prep", "Math for Data Science Tamil", "Statistics for Data Science Tamil"],
  openGraph: {
    title: "IITM BS Courses | BSPrep",
    description: "Master IITM BS subjects with comprehensive video courses in Tamil. Qualified mentors and live sessions.",
    url: "https://bsprep.in/courses",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IITM BS Courses | BSPrep",
    description: "Master IITM BS subjects with comprehensive video courses in Tamil.",
    images: ["/og-image.png"],
  },
}

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
