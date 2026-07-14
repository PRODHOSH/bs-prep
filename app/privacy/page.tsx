"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const sections = [
  {
    num: "01",
    title: "Who We Are",
    body: "BSPrep is a student-led platform built to help students prepare for the IIT Madras BS Degree Qualifier examinations. We are an independent initiative — not affiliated with, endorsed by, or officially connected to IIT Madras in any way. This platform is operated by students for students.",
  },
  {
    num: "02",
    title: "Information We Collect",
    body: "We may collect personal information including your full name, email address, phone number, educational institution, and course or program details. When you make a payment, transaction metadata is handled by Razorpay — we do not store your card or banking credentials on our servers.",
  },
  {
    num: "03",
    title: "How We Use Your Information",
    body: "Your information is used to deliver our services: processing enrollments, providing course materials, sending transactional emails (account confirmations, payment receipts, course updates, and support responses), and improving the platform. We do not sell, rent, or trade your personal data to any third party under any circumstances.",
  },
  {
    num: "04",
    title: "Email Communications",
    body: "We use Resend (a transactional email service) to send account notifications, payment receipts, course enrollment confirmations, platform announcements, and replies to support requests. You can opt out of non-essential communications by contacting us.",
  },
  {
    num: "05",
    title: "Payment Processing",
    body: "All payments are processed securely through Razorpay, a PCI-DSS compliant payment gateway. BSPrep does not store, view, or have access to your card details or banking credentials. Razorpay's own privacy policy governs the handling of payment data.",
  },
  {
    num: "06",
    title: "Data Storage",
    body: "User accounts, course enrollments, and platform data are stored in Supabase — a secure, cloud-hosted database infrastructure. Data is protected with encrypted connections and access controls.",
  },
  {
    num: "07",
    title: "Analytics & Monitoring",
    body: "We use Google Analytics 4 to understand how users interact with the platform (pages visited, features used, session duration). We also use Google Search Console and Bing Webmaster Tools to monitor search performance — these tools collect aggregated, non-personally-identifiable data. Vercel Analytics provides anonymous page performance data.",
  },
  {
    num: "08",
    title: "Cookies & Tracking",
    body: "We use cookies to maintain your login session (Supabase authentication), store your preferences, and collect anonymous usage analytics (Google Analytics). You can view full cookie details in our Cookie Policy. Users may disable cookies through their browser settings, though this may affect login functionality.",
  },
  {
    num: "09",
    title: "Data Sharing",
    body: "We share your data only with the service providers necessary to operate BSPrep: Razorpay (payments), Supabase (data storage), Resend (transactional emails), and Google Analytics (anonymised usage data). We do not share your data with advertisers, data brokers, or any unrelated third parties.",
  },
  {
    num: "10",
    title: "Data Security",
    body: "We implement security measures including HTTPS/SSL encryption, secure database access controls, and restricted admin permissions. However, no system is fully immune to security risks, and we cannot guarantee absolute security.",
  },
  {
    num: "11",
    title: "Your Rights",
    body: "You have the right to access, correct, or request deletion of your personal data. To exercise these rights or raise a data concern, contact us at support@bsprep.in. We will respond within a reasonable timeframe.",
  },
  {
    num: "12",
    title: "Community Content",
    body: "Content posted in community spaces may be visible to other enrolled members. Avoid sharing sensitive personal information publicly. BSPrep reserves the right to moderate or remove content that violates community standards.",
  },
  {
    num: "13",
    title: "Minor Students",
    body: "If students under 18 enroll in our programs, parental or guardian consent is assumed. We do not knowingly collect personal data from children under 13 without parental consent.",
  },
  {
    num: "14",
    title: "External Platforms",
    body: "Our platform may link to or integrate with external services such as Zoom, Google Meet, or YouTube. These platforms operate under their own privacy policies, and BSPrep is not responsible for their data practices.",
  },
  {
    num: "15",
    title: "Policy Updates",
    body: "We may revise this Privacy Policy from time to time. Material updates will be posted on this page with a revised date. Continued use of BSPrep after changes constitutes your acceptance of the updated policy.",
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
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 py-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">

          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-black/40 font-medium mb-2">BSPrep — Legal</p>
            <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">Privacy Policy</h1>
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
              <p className="text-white font-semibold text-sm">Questions about this policy?</p>
              <p className="text-white/50 text-xs mt-0.5">BSPrep — Student-led IITM BS Qualifier Prep</p>
            </div>
            <a
              href="mailto:support@bsprep.in"
              className="text-white/70 hover:text-white text-xs font-mono transition-colors underline underline-offset-2"
            >
              support@bsprep.in
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
