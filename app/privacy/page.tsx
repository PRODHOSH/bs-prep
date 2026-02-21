"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const sections = [
  {
    num: "01",
    title: "Information We Collect",
    body: "We may collect personal information such as Full Name, Email Address, Phone Number, Educational Institution, Course/Program enrolled, and payment details (processed via secure third-party gateways). We may also collect non-personal information including IP address, browser type, device details, and usage analytics.",
  },
  {
    num: "02",
    title: "How We Use Your Information",
    body: "We use collected information to provide coaching and mentorship services, manage enrollments, deliver classes and study materials, send updates, improve platform experience, and provide student support. We do not sell or rent student data to third parties.",
  },
  {
    num: "03",
    title: "Payments & Transactions",
    body: "All payments are processed through secure third-party payment providers. We do not store card or banking credentials on our servers.",
  },
  {
    num: "04",
    title: "Cookies & Tracking",
    body: "We use cookies to maintain login sessions, store preferences, and analyze traffic. Users may disable cookies through browser settings.",
  },
  {
    num: "05",
    title: "Data Sharing",
    body: "We may share limited information with payment gateways, hosting providers, or when required by law. No unnecessary third-party sharing occurs.",
  },
  {
    num: "06",
    title: "Data Security",
    body: "We implement security measures such as SSL/HTTPS encryption, secure databases, and restricted admin access. However, no system is completely immune to risks.",
  },
  {
    num: "07",
    title: "Student Content & Community",
    body: "Content posted in community spaces may be visible to enrolled members. Users should avoid sharing sensitive personal data. We reserve the right to moderate content.",
  },
  {
    num: "08",
    title: "Children & Minor Students",
    body: "If minors enroll in coaching programs, parental or guardian consent is assumed.",
  },
  {
    num: "09",
    title: "External Platforms",
    body: "Links to external platforms (Zoom, Google Meet, YouTube, etc.) are governed by their own privacy policies.",
  },
  {
    num: "10",
    title: "Policy Updates",
    body: "We may revise this Privacy Policy periodically. Updates will be posted with a revised date.",
  },
]

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">Privacy Policy</h1>
            <p className="text-black/50 text-sm mt-3">Qualifier Mentorship &amp; Coaching Platform  Last Updated: February 2026</p>
          </div>

          {/* Sections box */}
          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
            {sections.map((s, i) => (
              <div
                key={s.num}
                className={`flex gap-5 px-7 py-6 ${i !== sections.length - 1 ? "border-b border-black/6" : ""}`}
              >
                <span className="text-xs font-mono text-black/25 pt-0.5 shrink-0 w-6">{s.num}</span>
                <div>
                  <p className="font-semibold text-black text-sm mb-1">{s.title}</p>
                  <p className="text-sm text-black/60 leading-relaxed">{s.body}</p>
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
