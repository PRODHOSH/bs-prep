"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const sections = [
  {
    num: "01",
    title: "General Information Only",
    body: "The content on BS Prep is provided for general informational and educational purposes only. It does not constitute professional academic advice.",
  },
  {
    num: "02",
    title: "No Affiliation with IIT Madras",
    body: "BS Prep is an independent coaching and mentorship platform. We are not affiliated with, endorsed by, or officially connected to IIT Madras or the IITM BS Degree program in any way.",
  },
  {
    num: "03",
    title: "No Guarantee of Results",
    body: "We do not guarantee any specific academic results, exam scores, or admission outcomes. Results depend on individual effort, consistency, and external factors beyond our control.",
  },
  {
    num: "04",
    title: "Accuracy of Content",
    body: "While we strive to keep our study materials and information accurate and up-to-date, we make no warranties about the completeness or reliability of any content on the platform.",
  },
  {
    num: "05",
    title: "Third-Party Links",
    body: "Our platform may contain links to third-party websites or resources. We are not responsible for the content, accuracy, or practices of those external sites.",
  },
  {
    num: "06",
    title: "Platform Availability",
    body: "We do not guarantee uninterrupted or error-free access to the platform. Scheduled maintenance or technical issues may temporarily affect availability.",
  },
  {
    num: "07",
    title: "Community Content",
    body: "Opinions, advice, or content shared by community members do not represent the official views of BS Prep. Users are responsible for verifying information independently.",
  },
  {
    num: "08",
    title: "Changes to Disclaimer",
    body: "We reserve the right to modify this disclaimer at any time. Continued use of the platform after changes constitutes your acceptance of the revised disclaimer.",
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
            <p className="text-xs uppercase tracking-widest text-black/40 font-medium mb-2">BS Prep</p>
            <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight">Disclaimer</h1>
            <p className="text-black/50 text-base mt-3">Qualifier Mentorship &amp; Coaching Platform  Last Updated: February 2026</p>
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
                  <p className="text-base text-black/60 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 px-7 py-5 bg-black rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-white font-semibold text-sm">Contact Us</p>
              <p className="text-white/50 text-xs mt-0.5">BS Prep – Qualifier Mentorship &amp; Coaching</p>
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
