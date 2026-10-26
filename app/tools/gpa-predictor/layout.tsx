import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IITM BS GPA Predictor | Plan Your Target Grades",
  description: "Predict your required grades to achieve your target CGPA in the IIT Madras BS Degree. Plan your upcoming semesters across Data Science, Electronics, Aeronautics, and Management degrees.",
  keywords: ["GPA Predictor IITM BS", "Target CGPA calculator", "IITM BS Degree planning", "Grade predictor", "BSPrep tools"],
  openGraph: {
    title: "IITM BS GPA Predictor & Grade Planner | BSPrep",
    description: "Predict your required grades to achieve your target CGPA in the IIT Madras BS Degree. Plan your semesters smartly.",
    url: "https://bsprep.in/tools/gpa-predictor",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IITM BS GPA Predictor | BSPrep",
    description: "Predict your required grades to achieve your target CGPA in the IIT Madras BS Degree.",
    images: ["/og-image.png"],
  },
}

export default function GPAPredictorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
