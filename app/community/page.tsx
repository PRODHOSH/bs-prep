"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const guidelines = [
  {
    num: "01",
    title: "Respect & Professional Conduct",
    body: "Members must treat mentors and students respectfully, maintain polite communication, and avoid harassment, bullying, or offensive behavior.",
  },
  {
    num: "02",
    title: "Language Policy",
    body: "Our community supports Tamil and English bilingual learning. Lectures and discussions may be conducted in both languages. Members must respect all language backgrounds.",
  },
  {
    num: "03",
    title: "Academic Integrity",
    body: "Do not share answers during tests, leak paid materials, or plagiarize assignments. Use discussions only for genuine learning.",
  },
  {
    num: "04",
    title: "Relevant Discussions",
    body: "Keep conversations focused on IITM BS Qualifier preparation, mentorship, and academic topics. Avoid spam or unrelated debates.",
  },
  {
    num: "05",
    title: "Promotions & Community Sharing",
    body: "Members are allowed to promote BS Prep programs, mentorship opportunities, and events. Promotion of other coaching institutes or third-party courses is not allowed.",
  },
  {
    num: "06",
    title: "Content Sharing Rules",
    body: "You may share study notes and resources but must not share pirated content, paid material leaks, or recorded sessions without permission.",
  },
  {
    num: "07",
    title: "Privacy & Safety",
    body: "Do not share personal data, phone numbers, login credentials, or private screenshots without consent.",
  },
  {
    num: "08",
    title: "Live Session Etiquette",
    body: "Join sessions on time, mute microphones, respect mentors, and avoid recording without permission.",
  },
  {
    num: "09",
    title: "Reporting Violations",
    body: "Report misconduct to moderators privately with proof if available.",
  },
  {
    num: "10",
    title: "Disciplinary Actions",
    body: "Violations may result in warnings, suspension, bans, or coaching access termination.",
  },
  {
    num: "11",
    title: "Positive Community Culture",
    body: "Members are encouraged to collaborate, help juniors, share strategies, and motivate peers.",
  },
  {
    num: "12",
    title: "Updates to Guidelines",
    body: "Guidelines may be updated as the community grows. Members will be notified of major changes.",
  },
]

export default function CommunityPage() {
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

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-black/40 font-medium mb-2">BS Prep</p>
            <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight">Community Guidelines</h1>
            <p className="text-black/50 text-base mt-3">Qualifier Mentorship &amp; Coaching Community · Last Updated: February 2026</p>
          </div>

          {/* Guidelines box */}
          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
            {guidelines.map((g, i) => (
              <div
                key={g.num}
                className={`flex gap-5 px-7 py-6 ${i !== guidelines.length - 1 ? "border-b border-black/6" : ""}`}
              >
                <span className="text-sm font-mono text-black/25 pt-0.5 shrink-0 w-6">{g.num}</span>
                <div>
                  <p className="font-semibold text-black text-base mb-1">{g.title}</p>
                  <p className="text-base text-black/60 leading-relaxed">{g.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact footer */}
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

