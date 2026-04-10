"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { Shield, Languages, BookCheck, MessageCircle, Megaphone, FileText, Lock, Video, Flag, AlertTriangle, Heart, RefreshCw } from "lucide-react"

const guidelines = [
  {
    num: "01",
    icon: Shield,
    title: "Respect & Professional Conduct",
    body: "Members must treat mentors and students respectfully, maintain polite communication, and avoid harassment, bullying, or offensive behavior.",
  },
  {
    num: "02",
    icon: Languages,
    title: "Language Policy",
    body: "Our community supports Tamil and English bilingual learning. Lectures and discussions may be conducted in both languages. Members must respect all language backgrounds.",
  },
  {
    num: "03",
    icon: BookCheck,
    title: "Academic Integrity",
    body: "Do not share answers during tests, leak paid materials, or plagiarize assignments. Use discussions only for genuine learning.",
  },
  {
    num: "04",
    icon: MessageCircle,
    title: "Relevant Discussions",
    body: "Keep conversations focused on IITM BS Qualifier preparation, mentorship, and academic topics. Avoid spam or unrelated debates.",
  },
  {
    num: "05",
    icon: Megaphone,
    title: "Promotions & Community Sharing",
    body: "Members are allowed to promote BS Prep programs, mentorship opportunities, and events. Promotion of other coaching institutes or third-party courses is not allowed.",
  },
  {
    num: "06",
    icon: FileText,
    title: "Content Sharing Rules",
    body: "You may share study notes and resources but must not share pirated content, paid material leaks, or recorded sessions without permission.",
  },
  {
    num: "07",
    icon: Lock,
    title: "Privacy & Safety",
    body: "Do not share personal data, phone numbers, login credentials, or private screenshots without consent.",
  },
  {
    num: "08",
    icon: Video,
    title: "Live Session Etiquette",
    body: "Join sessions on time, mute microphones, respect mentors, and avoid recording without permission.",
  },
  {
    num: "09",
    icon: Flag,
    title: "Reporting Violations",
    body: "Report misconduct to moderators privately with proof if available.",
  },
  {
    num: "10",
    icon: AlertTriangle,
    title: "Disciplinary Actions",
    body: "Violations may result in warnings, suspension, bans, or coaching access termination.",
  },
  {
    num: "11",
    icon: Heart,
    title: "Positive Community Culture",
    body: "Members are encouraged to collaborate, help juniors, share strategies, and motivate peers.",
  },
  {
    num: "12",
    icon: RefreshCw,
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

      <main className="flex-1 py-14 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">

          {/* ── Hero header ── */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-black/40 font-semibold mb-3">BS Prep · Community</p>
            <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight tracking-tight">
              Community Guidelines
            </h1>
            <p className="text-black/50 text-base mt-3 max-w-xl">
              Qualifier Mentorship &amp; Coaching Community · Last updated February 2026
            </p>

            {/* Divider accent */}
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/8" />
              <span className="text-xs text-black/30 font-mono">12 GUIDELINES</span>
              <div className="h-px flex-1 bg-black/8" />
            </div>
          </div>

          {/* ── Guidelines grid ── */}
          <div className="rounded-2xl border border-[#E5DBC8] bg-white shadow-sm overflow-hidden">

            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-black via-[#3e3098] to-black opacity-80" />

            {guidelines.map((g, i) => {
              const Icon = g.icon
              return (
                <div
                  key={g.num}
                  className={`group flex gap-5 px-7 py-6 transition-colors hover:bg-[#FFFCF8] ${
                    i !== guidelines.length - 1 ? "border-b border-[#EDE5D4]" : ""
                  }`}
                >
                  {/* Number + icon column */}
                  <div className="flex flex-col items-center gap-2 shrink-0 w-10">
                    <span className="text-xs font-mono text-black/25 leading-none">{g.num}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F2E8] group-hover:bg-[#EDE5D4] transition-colors">
                      <Icon className="h-4 w-4 text-black/50" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-0.5">
                    <p className="font-semibold text-black text-[15px] mb-1.5 leading-snug">{g.title}</p>
                    <p className="text-sm text-black/55 leading-relaxed">{g.body}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Contact footer card ── */}
          <div className="mt-6 rounded-2xl border border-[#E5DBC8] bg-[#FFFCF8] px-7 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-black/40 font-semibold mb-1">Need Help?</p>
              <p className="font-semibold text-black text-base">Contact the BS Prep Team</p>
              <p className="text-black/50 text-sm mt-0.5">Qualifier Mentorship &amp; Coaching</p>
            </div>
            <a
              href="mailto:bsprep.team@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl border border-[#D8CCB2] bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-[#F7F2E8] hover:border-black/20"
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
