import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "IITM BS Quiz Prep & Practice Tests",
  description: "Practice tests and quiz preparation for IITM BS students, with question banks and detailed solutions. Coming soon to BSPrep.",
  path: "/quiz-prep",
  keywords: ["IITM BS quiz prep", "IITM BS practice tests", "IITM BS exam preparation"],
})

export default function QuizPrepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
