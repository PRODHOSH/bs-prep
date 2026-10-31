"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Calculator, Code2, Maximize2, RotateCcw, Shuffle, SlidersHorizontal, FileText, ListChecks } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const STATS = [
  { value: "40,000+", label: "past questions" },
  { value: "22", label: "subjects" },
  { value: "3", label: "exam types" },
  { value: "6", label: "OPPE courses" },
]

const MODES = [
  { icon: FileText, title: "Mock tests", body: "Sit a real Quiz 1, Quiz 2 or End term paper from start to finish, picked by date." },
  { icon: Shuffle, title: "Quick tests", body: "5, 10 or 20 random past questions from one subject. Ten focused minutes between classes." },
  { icon: SlidersHorizontal, title: "Custom tests", body: "Choose the subject, the number of questions, the exams they come from and the question types to drill." },
  { icon: Code2, title: "OPPE practice", body: "A timed three-problem coding mock for Python, PDSA, MLP, Java, SQL and System Commands." },
]

const STEPS = [
  { title: "Pick what to practise", body: "Choose a test type, then your subject. Foundation, Diploma and Degree are all there." },
  { title: "Take it like the real exam", body: "Read the instructions, then a full-screen test opens with a timer, a question list and a calculator." },
  { title: "Review and redo", body: "See every answer, then retry only the questions you got wrong or skipped." },
]

const FEATURES = [
  { icon: Maximize2, title: "Exam-style screen", body: "Full screen, a clear timer and a question list you can jump around." },
  { icon: Calculator, title: "Built-in calculator", body: "A scientific calculator in the test window, just like the exam." },
  { icon: ListChecks, title: "Real marking rules", body: "Marks follow the IITM rules, with partial credit on multiple-select questions." },
  { icon: RotateCcw, title: "Redo your misses", body: "Finished tests stay on your device, so you can retry what you missed." },
]

export default function QuizPrepPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setIsAuthenticated(!!session))
  }, [])

  const cta = isAuthenticated ? "/dashboard/quiz-prep" : "/auth/register"

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 px-4 pb-20">
        <section className="mx-auto grid max-w-6xl items-center gap-10 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-16">
          <div>
            <p className="text-sm font-bold text-black/50">Quiz prep</p>
            <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight text-black md:text-6xl">
              Practise with <span className="text-[#0a192f]">real past papers.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium text-black/65 md:text-lg">
              Mock tests, quick drills and OPPE coding practice for IITM BS students, in a test window that feels like the real exam. Free with an account.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={cta}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0a192f] px-7 text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#112a52]"
              >
                {isAuthenticated ? "Open quiz prep" : "Start practising free"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {!isAuthenticated && (
                <Link href="/auth/login" className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-7 text-sm font-bold tracking-wide text-black transition-colors hover:bg-black/5">
                  I have an account
                </Link>
              )}
            </div>
          </div>
          <img src="/illustrations/quiz-home.svg" alt="A student preparing for an exam" className="mx-auto h-auto w-full max-w-md" />
        </section>

        <section className="mx-auto max-w-6xl">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white px-6 py-6">
                <dt className="text-3xl font-black tracking-tight text-black">{s.value}</dt>
                <dd className="mt-1 text-sm font-medium text-black/55">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-6xl py-16">
          <h2 className="text-3xl font-black tracking-tight text-black">Four ways to practise</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {MODES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-3xl border border-black/10 bg-white p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FDFBF7] text-[#0a192f]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-black text-black">{title}</h3>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-black/60">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-black/10 py-16">
          <h2 className="text-3xl font-black tracking-tight text-black">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0a192f] text-sm font-black text-white">{i + 1}</span>
                <div>
                  <h3 className="font-black text-black">{s.title}</h3>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-black/60">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl border-t border-black/10 py-16">
          <h2 className="text-3xl font-black tracking-tight text-black">Built like the exam</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon className="h-5 w-5 text-[#0a192f]" />
                <h3 className="mt-3 font-black text-black">{title}</h3>
                <p className="mt-1 text-sm font-medium leading-relaxed text-black/60">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl rounded-3xl bg-[#0a192f] px-6 py-12 text-center md:px-12">
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Your next quiz starts here.</h2>
          <p className="mx-auto mt-3 max-w-lg text-base font-medium text-white/70">Pick a subject and take a test in the next five minutes.</p>
          <Link href={cta} className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold tracking-wide text-[#0a192f] transition-colors hover:bg-white/90">
            {isAuthenticated ? "Open quiz prep" : "Create a free account"} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
