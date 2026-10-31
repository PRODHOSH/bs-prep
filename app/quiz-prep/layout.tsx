import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "IITM BS Quiz Prep & Practice Tests",
  description: "Mock tests, quick tests and custom tests built from real IITM BS past papers, with a timed full-screen exam window and instant scoring.",
  path: "/quiz-prep",
  keywords: ["IITM BS quiz prep", "IITM BS practice tests", "IITM BS exam preparation"],
})

export default function QuizPrepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
