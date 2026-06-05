"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, BookOpen, Users, TrendingUp, CheckCircle2 } from "lucide-react"

const SEEN_KEY = "bsprep_welcome_v1"

export function WelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(SEEN_KEY)) {
      const t = setTimeout(() => setOpen(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  function close() {
    localStorage.setItem(SEEN_KEY, "1")
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-black" />

        {/* Dismiss */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-black/50" />
        </button>

        <div className="px-7 pt-7 pb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-black text-white text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            May 2026 Term — Enroll Now
          </div>

          {/* Headline */}
          <h2 className="text-2xl font-bold text-black leading-snug mb-2">
            Crack the IITM BS<br />Qualifier this term.
          </h2>
          <p className="text-sm text-black/55 leading-relaxed mb-6">
            Join hundreds of students who prepared smarter with BSPrep's Tamil medium courses, live mentorship, and structured study plan.
          </p>

          {/* Value props */}
          <ul className="space-y-2.5 mb-7">
            {[
              { icon: BookOpen,    text: "Comprehensive Tamil video lectures for all 4 Qualifier subjects" },
              { icon: Users,       text: "Live doubt sessions with mentors who've already cracked the exam" },
              { icon: TrendingUp,  text: "Practice quizzes, notes & community support — all in one place" },
              { icon: CheckCircle2,text: "Trusted by students across IITM BS cohorts" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-black/5 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-black/60" />
                </span>
                <span className="text-sm text-black/65 leading-snug">{text}</span>
              </li>
            ))}
          </ul>

          {/* Pricing */}
          <div className="flex items-center gap-3 bg-black/[0.03] border border-black/8 rounded-xl px-4 py-3 mb-6">
            <div className="flex-1">
              <p className="text-[11px] text-black/40 uppercase tracking-wider font-medium">Per course</p>
              <p className="text-lg font-bold text-black leading-none mt-0.5">
                ₹129 <span className="text-xs font-normal text-black/35 line-through ml-1">₹149</span>
              </p>
            </div>
            <div className="w-px h-8 bg-black/10" />
            <div className="flex-1">
              <p className="text-[11px] text-black/40 uppercase tracking-wider font-medium">All 4 courses</p>
              <p className="text-lg font-bold text-black leading-none mt-0.5">
                ₹499 <span className="text-xs font-normal text-black/35 line-through ml-1">₹599</span>
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/courses"
            onClick={close}
            className="block w-full text-center bg-black text-white text-sm font-semibold py-3 rounded-xl hover:bg-black/80 transition-colors"
          >
            View Courses &amp; Enroll →
          </Link>

          <button
            onClick={close}
            className="block w-full text-center text-xs text-black/35 hover:text-black/55 transition-colors mt-3"
          >
            I'll check later
          </button>
        </div>
      </div>
    </div>
  )
}
