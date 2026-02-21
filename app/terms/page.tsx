"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const sections = [
  {
    num: "01",
    title: "Agreement to Terms",
    body: "By accessing and using BS Prep services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.",
  },
  {
    num: "02",
    title: "Service Description",
    body: "We provide coaching and mentorship specifically for IITM BS Degree Qualifier preparation, including mentorship sessions, study materials, practice tests, webinars, and community access.",
  },
  {
    num: "03",
    title: "User Accounts",
    body: "Users must provide accurate information, maintain account security, and are responsible for all activities under their account.",
  },
  {
    num: "04",
    title: "Acceptable Use",
    body: "Users may not violate laws, share paid content, post harmful material, attempt unauthorized access, or misuse platform services.",
  },
  {
    num: "05",
    title: "Payments & Refunds",
    body: "All payments are processed securely. Course fees are final. We do not provide refunds, cancellations, or exchanges.",
  },
  {
    num: "06",
    title: "Intellectual Property",
    body: "All study materials, videos, notes, branding, and platform content are the property of BS Prep and protected by law.",
  },
  {
    num: "07",
    title: "Privacy",
    body: "User data collection and usage are governed by our Privacy Policy.",
  },
  {
    num: "08",
    title: "Disclaimers",
    body: "We do not guarantee exam results or academic outcomes. Service availability may be affected by maintenance or technical issues.",
  },
  {
    num: "09",
    title: "Employment Verification",
    body: "Any certificates or verification letters issued must be used lawfully and not falsified or misused.",
  },
  {
    num: "10",
    title: "Termination",
    body: "We may suspend or terminate accounts for violations of these Terms without prior notice.",
  },
]

export default function TermsPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">Terms &amp; Conditions</h1>
            <p className="text-black/50 text-sm mt-3">Qualifier Mentorship &amp; Coaching Platform  Last Updated: February 2026</p>
          </div>

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
