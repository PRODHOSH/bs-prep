"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const sections = [
  {
    num: "01",
    title: "Agreement to Terms",
    body: "By accessing or using BSPrep, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our platform.",
  },
  {
    num: "02",
    title: "About BSPrep",
    body: "BSPrep is a student-led, independent coaching and mentorship platform created to help students prepare for the IIT Madras BS Degree Qualifier examinations. We are not affiliated with, endorsed by, or officially connected to IIT Madras or the IITM BS Degree program in any capacity.",
  },
  {
    num: "03",
    title: "Service Description",
    body: "We provide coaching sessions, mentorship, study materials, practice quizzes, recorded resources, community access, and related academic support — all specifically designed for IITM BS Qualifier preparation.",
  },
  {
    num: "04",
    title: "User Accounts",
    body: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. Notify us immediately at bsprep.team@gmail.com if you suspect unauthorized access.",
  },
  {
    num: "05",
    title: "Acceptable Use",
    body: "You agree not to: violate any applicable laws or regulations; share, redistribute, or resell paid platform content; post harmful, abusive, or misleading material; attempt to gain unauthorized access to any part of the platform; or use the platform for any purpose other than personal academic preparation.",
  },
  {
    num: "06",
    title: "Payments & Refunds",
    body: "All payments are processed securely through Razorpay. Course and mentorship fees are final and non-refundable once enrollment is confirmed. We do not offer refunds, cancellations, or transfers under any circumstances. Please review course details carefully before purchasing.",
  },
  {
    num: "07",
    title: "Intellectual Property",
    body: "All study materials, videos, notes, quizzes, branding, and platform content are the exclusive property of BSPrep and protected by applicable intellectual property laws. Unauthorized reproduction, distribution, or commercial use of any content is strictly prohibited.",
  },
  {
    num: "08",
    title: "Privacy",
    body: "Your use of BSPrep is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal data. By using our platform, you consent to the practices described in that policy.",
  },
  {
    num: "09",
    title: "No Guarantees",
    body: "We do not guarantee specific academic results, exam scores, or admission outcomes. Results depend entirely on individual effort, consistency, and factors outside our control. BSPrep provides support tools — success requires your commitment.",
  },
  {
    num: "10",
    title: "Platform Availability",
    body: "We strive to maintain continuous access to the platform, but we do not guarantee uninterrupted or error-free service. Scheduled maintenance, technical issues, or unforeseen circumstances may temporarily affect availability.",
  },
  {
    num: "11",
    title: "Certificates & Verification",
    body: "Any certificates, completion letters, or verification documents issued by BSPrep must be used honestly and lawfully. Falsification or misuse of such documents is strictly prohibited and may result in immediate account termination.",
  },
  {
    num: "12",
    title: "Account Termination",
    body: "BSPrep reserves the right to suspend or permanently terminate accounts that violate these Terms, engage in harmful behaviour, or misuse platform resources — without prior notice and without liability.",
  },
  {
    num: "13",
    title: "Changes to Terms",
    body: "We may update these Terms & Conditions from time to time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms. We recommend reviewing this page periodically.",
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
            <p className="text-xs uppercase tracking-widest text-black/40 font-medium mb-2">BSPrep — Legal</p>
            <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">Terms &amp; Conditions</h1>
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
              <p className="text-white font-semibold text-sm">Questions about these terms?</p>
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
