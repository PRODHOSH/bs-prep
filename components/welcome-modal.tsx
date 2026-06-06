"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Zap } from "lucide-react"

const SEEN_KEY = "bsprep_welcome_v1"

const courses = [
  { title: "Mathematics for Data Science I", img: "/courses/math.png"    },
  { title: "Statistics for Data Science I",  img: "/courses/stats.png"   },
  { title: "Computational Thinking",         img: "/courses/ct.png"      },
  { title: "English I",                      img: "/courses/english.png" },
]

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
      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={close}
    >
      {/* push modal below announcement bar + navbar (~108px), small gap at bottom */}
      <div className="flex min-h-full items-start justify-center px-4 pt-[112px] pb-4">
        <div
          className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex"
          style={{ height: "calc(100vh - 128px)" }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── LEFT: dark ── */}
          <div className="bg-black w-[42%] shrink-0 flex flex-col px-8 py-8">

            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <img src="/new-logo.jpeg" alt="BSPrep" className="w-full h-full object-cover scale-[1.4]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">BSPrep</p>
                <p className="text-white/40 text-xs mt-0.5">IITM BS Qualifier Prep</p>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 self-start bg-white/10 border border-white/15 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              May 2026 Term
            </div>

            {/* Headline */}
            <h2 className="text-white text-3xl font-bold leading-snug mb-2">
              Crack the<br />Qualifier<br />this term. 🎯
            </h2>
            <p className="text-white/40 text-sm mb-6">Tamil · Mentorship · Community</p>

            {/* Course thumbnails — flex-1 so they fill remaining height */}
            <div className="grid grid-cols-2 gap-3 flex-1 content-end">
              {courses.map((c) => (
                <div key={c.title} className="relative rounded-xl overflow-hidden border border-white/10">
                  <img src={c.img} alt={c.title} className="w-full h-full object-cover" style={{ minHeight: "90px" }} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                  <p className="absolute bottom-2 left-2.5 right-2 text-white text-[10px] font-semibold leading-tight line-clamp-2">
                    {c.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: white ── */}
          <div className="bg-white flex-1 flex flex-col px-8 py-8 relative">

            {/* Close */}
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-black/50" />
            </button>

            <p className="text-[11px] text-black/35 uppercase tracking-widest font-semibold mb-2">Enroll now</p>
            <h3 className="text-3xl font-bold text-black leading-snug mb-6">
              Start your Qualifier<br />prep the right way.
            </h3>

            {/* Features — flex-1 so they expand */}
            <ul className="space-y-4 flex-1">
              {[
                { title: "Tamil video lectures", desc: "Full coverage of all 4 Qualifier subjects in Tamil — Math, Stats, Computational Thinking, English" },
                { title: "Live mentor sessions",  desc: "Direct doubt-clearing with mentors who have already cleared the Qualifier exam" },
                { title: "Quizzes and notes",     desc: "Practice tests, curated notes, and a community of students preparing alongside you" },
              ].map(({ title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0">
                    <Zap className="w-3 h-3 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black leading-snug">{title}</p>
                    <p className="text-xs text-black/50 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pricing + CTA pinned to bottom */}
            <div className="mt-6">
              <div className="flex rounded-xl border border-black/10 overflow-hidden mb-4">
                <div className="flex-1 px-5 py-4">
                  <p className="text-[10px] text-black/35 uppercase tracking-wider font-semibold mb-1">Per course</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-black">₹129</span>
                    <span className="text-xs text-black/30 line-through">₹149</span>
                  </div>
                </div>
                <div className="w-px bg-black/8" />
                <div className="flex-1 px-5 py-4">
                  <p className="text-[10px] text-black/35 uppercase tracking-wider font-semibold mb-1">All 4 courses</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-black">₹499</span>
                    <span className="text-xs text-black/30 line-through">₹599</span>
                  </div>
                </div>
                <div className="flex items-center justify-center px-5 bg-black text-white">
                  <div className="text-center">
                    <p className="text-[9px] font-semibold opacity-60 leading-none">Save</p>
                    <p className="text-2xl font-extrabold leading-tight">17%</p>
                  </div>
                </div>
              </div>

              <Link
                href="/courses"
                onClick={close}
                className="flex items-center justify-center w-full bg-black text-white text-base font-semibold py-4 rounded-xl hover:bg-black/80 transition-colors"
              >
                View Courses &amp; Enroll →
              </Link>
              <button
                onClick={close}
                className="w-full text-center text-xs text-black/30 hover:text-black/50 transition-colors mt-2.5"
              >
                I'll check later
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
