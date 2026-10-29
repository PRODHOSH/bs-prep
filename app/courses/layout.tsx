import type { Metadata } from "next"
import { PathJsonLd } from "@/components/seo/path-json-ld"
import { courses } from "@/lib/course-catalog"
import { breadcrumbLd, courseListLd, pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "IITM BS Tamil Courses: Qualifier & Foundation",
  description: "Tamil video courses for IITM BS Qualifier and Foundation: Math, Statistics, Computational Thinking, English, Python and Java, with live mentor classes.",
  path: "/courses",
  keywords: ["IITM BS courses", "IITM BS Tamil video lectures", "IITM BS Qualifier prep", "Mathematics for Data Science Tamil", "Statistics for Data Science Tamil", "Python Tamil IITM BS"],
})

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Only the catalog page describes the whole list; each course page has its own data. */}
      <PathJsonLd
        path="/courses"
        data={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Courses", path: "/courses" }]),
          courseListLd(courses.filter((c) => c.available)),
        ]}
      />
      {children}
    </>
  )
}
