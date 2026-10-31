"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Clock, Shuffle, SlidersHorizontal, FileText, RotateCcw, Maximize2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const MODES = [
  { icon: FileText, title: "Mock tests", body: "Sit a real past paper from start to finish, in its original order. Pick a quiz 1, quiz 2 or end term paper by date and set." },
  { icon: Shuffle, title: "Quick tests", body: "Five to twenty random past questions from one subject. Ten focused minutes between classes." },
  { icon: SlidersHorizontal, title: "Custom tests", body: "Choose the subject, how many questions, which exams they come from, and the question types you want to drill." },
]

const DETAILS = [
  { icon: Maximize2, title: "Exam-style screen", body: "A full-screen test window with a countdown timer, a question palette and mark for review." },
  { icon: Clock, title: "Instant scoring", body: "Marks follow the IITM rules, including partial credit on multiple-select questions." },
  { icon: RotateCcw, title: "Redo what you missed", body: "Every finished test is saved on your device. Retry only the questions you got wrong or skipped." },
]

export default function QuizPrepPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cta = isAuthenticated ? "/dashboard/quiz-prep" : "/auth/login"

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl space-y-16">
          <section className="mx-auto max-w-2xl space-y-5 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-6xl">Practise with real past papers</h1>
            <p className="text-base text-black/70 md:text-lg">
              Over 40,000 questions from IITM BS quizzes and end terms across 22 subjects. Take full mock tests, quick drills or tests you design yourself.
            </p>
            <div className="pt-2">
              <Link href={cta}>
                <Button className="group h-12 rounded-full bg-black px-8 text-sm font-bold text-white hover:bg-black/85">
                  {isAuthenticated ? "Open quiz prep" : "Log in to start"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <p className="mt-3 text-sm text-black/60">New here? You can create an account on the login page.</p>
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {MODES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
                <Icon className="mb-4 h-6 w-6 text-black" />
                <h2 className="text-lg font-bold text-black">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-black/70">{body}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-8 md:grid-cols-3">
            {DETAILS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-black" />
                <div>
                  <h3 className="font-bold text-black">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-black/70">{body}</p>
                </div>
              </div>
            ))}
          </section>

          <p className="text-center text-sm text-black/60">Topic-wise tests are next, once questions are tagged by syllabus topic.</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
