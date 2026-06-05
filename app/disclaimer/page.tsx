"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const sections = [
  {
    num: "01",
    title: "General Information Only",
    body: "The content provided on BSPrep — including study materials, notes, quizzes, videos, and mentorship resources — is intended for general informational and educational purposes only. It does not constitute official academic advice, and should not be treated as such.",
  },
  {
    num: "02",
    title: "No Affiliation with IIT Madras",
    body: "BSPrep is an independent, student-led initiative. We are not affiliated with, endorsed by, sponsored by, or officially connected to IIT Madras, the IITM BS Degree program, or any of their faculties or departments. Any mention of \"IITM BS\" or \"IIT Madras\" on this platform refers solely to the publicly known academic program, not to any institutional association.",
  },
  {
    num: "03",
    title: "No Guarantee of Results",
    body: "We do not guarantee any specific academic results, exam scores, qualifier passing outcomes, or degree admissions. Individual performance depends entirely on personal effort, consistency, understanding, and factors beyond our platform's control. Past student experiences shared on BSPrep are illustrative and not indicative of guaranteed outcomes.",
  },
  {
    num: "04",
    title: "Mentor & Tutor Content",
    body: "Mentors on BSPrep are students or recent alumni of the IITM BS program who share their personal knowledge and experience. They are not official IIT Madras faculty or certified academic instructors. Their guidance reflects personal perspective and should be verified against official IITM sources.",
  },
  {
    num: "05",
    title: "Accuracy of Content",
    body: "While we work hard to keep our study materials and platform information accurate and current, we make no warranties regarding the completeness, reliability, or accuracy of any content. The IITM BS program syllabus and exam patterns may change — always refer to the official IITM BS portal for the most current information.",
  },
  {
    num: "06",
    title: "Third-Party Links & Services",
    body: "Our platform may reference or link to external websites, tools, or services such as Zoom, Google Meet, YouTube, or other resources. BSPrep is not responsible for the content, accuracy, availability, or privacy practices of any third-party platforms.",
  },
  {
    num: "07",
    title: "Platform Availability",
    body: "We do not guarantee uninterrupted, error-free, or continuous access to BSPrep. Scheduled maintenance, technical issues, or circumstances beyond our control may temporarily affect availability. We are not liable for any inconvenience or loss arising from such interruptions.",
  },
  {
    num: "08",
    title: "Community Content",
    body: "Opinions, strategies, tips, or advice shared by community members within BSPrep forums or discussions represent the views of individual users — not the official position of BSPrep. Users are encouraged to independently verify information before acting on it.",
  },
  {
    num: "09",
    title: "Changes to This Disclaimer",
    body: "BSPrep reserves the right to modify this disclaimer at any time. Updates will be reflected on this page with a revised date. Continued use of the platform after changes have been posted constitutes your acceptance of the updated disclaimer.",
  },
]

export default function DisclaimerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 py-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">

          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-black/40 font-medium mb-2">BSPrep — Legal</p>
            <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">Disclaimer</h1>
            <p className="text-black/50 text-sm mt-3">Student-led IITM BS Qualifier Prep Platform &nbsp;·&nbsp; Last Updated: June 2026</p>
            <p className="text-black/40 text-xs mt-2">BSPrep is an independent student initiative and is not affiliated with IIT Madras.</p>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
            {sections.map((s, i) => (
              <div
                key={s.num}
                className={`flex gap-5 px-7 py-6 ${i !== sections.length - 1 ? "border-b border-black/6" : ""}`}
              >
                <span className="text-sm font-mono text-black/25 pt-0.5 shrink-0 w-6">{s.num}</span>
                <div>
                  <p className="font-semibold text-black text-base mb-1">{s.title}</p>
                  <p className="text-sm text-black/60 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 px-7 py-5 bg-black rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-white font-semibold text-sm">Have a question or concern?</p>
              <p className="text-white/50 text-xs mt-0.5">BSPrep — Student-led IITM BS Qualifier Prep</p>
            </div>
            <a
              href="mailto:bsprep.team@gmail.com"
              className="text-white/70 hover:text-white text-xs font-mono transition-colors underline underline-offset-2"
            >
              bsprep.team@gmail.com
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
