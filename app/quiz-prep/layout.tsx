import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IITM BS Quiz Prep | Practice Tests & Mock Exams",
  description: "Prepare for your IITM BS quizzes and exams with our practice tests. Real-time feedback, detailed solutions, and comprehensive question banks.",
  keywords: ["IITM BS quiz prep", "mock exams", "practice tests", "IITM BS exam preparation"],
  openGraph: {
    title: "IITM BS Quiz Prep & Mock Exams | BSPrep",
    description: "Prepare for your IITM BS quizzes and exams with our practice tests and real-time feedback.",
    url: "https://bsprep.in/quiz-prep",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IITM BS Quiz Prep & Mock Exams | BSPrep",
    description: "Prepare for your IITM BS quizzes and exams with our practice tests and real-time feedback.",
    images: ["/og-image.png"],
  },
}

export default function QuizPrepLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
