import type { Metadata } from "next"
import { HomeClient } from "@/components/home/home-client"
import { JsonLd } from "@/components/seo/json-ld"
import { HOME_FAQS } from "@/lib/home-faq"
import { courses } from "@/lib/course-catalog"
import { courseListLd, faqLd, pageMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "BSPrep",
    description: "Prepare for the IITM BS degree with Tamil video courses, live mentor classes, a GPA calculator and predictor, study notes and a helpful student community.",
    path: "/",
  }),
  title: { absolute: "BSPrep | IITM BS Tamil Courses, GPA Tools & Study Notes" },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={[faqLd(HOME_FAQS), courseListLd(courses.filter((c) => c.available && !c.id.endsWith("-bundle")))]} />
      <HomeClient />
    </>
  )
}
