import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import { breadcrumbLd, pageMetadata, webAppLd } from "@/lib/seo"

const path = "/tools/gpa-predictor"

export const metadata: Metadata = pageMetadata({
  title: "IITM BS GPA Predictor: The Score You Need",
  description: "Find the end term score you need for your target grade in an IITM BS course. Enter your quiz and assignment marks and see the answer instantly.",
  path,
  keywords: ["IITM BS GPA predictor", "IITM BS grade predictor", "end term score needed IITM BS", "IITM BS target grade"],
})

export default function GPAPredictorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webAppLd({ name: "IITM BS GPA Predictor", description: "Predict the exam score needed for a target grade in an IITM BS course.", path, category: "EducationalApplication" }),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }, { name: "GPA predictor", path }]),
        ]}
      />
      {children}
    </>
  )
}
