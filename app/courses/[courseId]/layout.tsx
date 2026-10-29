import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/seo/json-ld"
import { courses } from "@/lib/course-catalog"
import { courseSyllabusData } from "@/lib/syllabus-data"
import { breadcrumbLd, courseLd, pageMetadata } from "@/lib/seo"

type Props = {
  params: Promise<{ courseId: string }>
  children: React.ReactNode
}

// A course page exists only when the course is in the catalog and has a syllabus.
const find = (id: string) => (courseSyllabusData[id] ? courses.find((c) => c.id === id) : undefined)
const sentence = (s: string) => s.trim().replace(/\.$/, "")
const level = (l: string) => l.charAt(0).toUpperCase() + l.slice(1)

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { courseId } = await params
  const course = find(courseId)
  if (!course) return { title: "Course not found", robots: { index: false, follow: false } }

  const bundle = course.id.endsWith("-bundle")
  const description = bundle
    ? `${sentence(course.description)}. Tamil video lectures, live mentor sessions and a certificate for each course in the bundle.`
    : `${course.title} for the IITM BS ${level(course.level)} level, taught in Tamil. ${course.weeks} weeks of video lectures, live sessions with mentors and a certificate of completion.`

  return pageMetadata({
    title: bundle ? course.title : `${course.title} in Tamil`,
    description,
    path: `/courses/${course.id}`,
    keywords: [`${course.title} Tamil`, `IITM BS ${level(course.level)}`, "IITM BS Tamil video lectures", "IITM BS course"],
    image: course.thumbnail,
    imageSize: { width: 960, height: 540 },
  })
}

export default async function CourseLayout({ params, children }: Props) {
  const { courseId } = await params
  const course = find(courseId)
  // A real 404, so a mistyped or removed course URL is not indexed as an empty page.
  if (!course) notFound()
  return (
    <>
      <JsonLd
        data={[
          courseLd(course),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Courses", path: "/courses" },
            { name: course.title, path: `/courses/${course.id}` },
          ]),
        ]}
      />
      {children}
    </>
  )
}
