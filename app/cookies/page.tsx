"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const sections = [
  {
    num: "01",
    title: "What Are Cookies",
    body: "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you logged in, and understand how you use the platform. BSPrep uses a minimal set of cookies strictly necessary for functionality and anonymous analytics.",
  },
  {
    num: "02",
    title: "Essential Cookies",
    body: "These cookies are required for the platform to function. They manage your login session via Supabase authentication — without them, you cannot stay signed in. These cookies are always active and cannot be disabled without breaking core platform functionality.",
  },
  {
    num: "03",
    title: "Analytics Cookies",
    body: "We use Google Analytics 4 (ID: G-06EFDQ4LSM) to understand how visitors interact with BSPrep — which pages are most visited, how long sessions last, and where users come from. This data is aggregated and anonymised. No personally identifiable information is shared with Google through this integration.",
  },
  {
    num: "04",
    title: "Performance Cookies",
    body: "Vercel Analytics collects anonymous page load performance data to help us improve site speed and reliability. This data contains no personally identifiable information and is used solely for technical optimisation.",
  },
  {
    num: "05",
    title: "Search & Webmaster Tools",
    body: "Google Search Console and Bing Webmaster Tools are used to monitor how BSPrep appears in search engine results. These are site-level tools and do not place tracking cookies on your device or collect personal user data.",
  },
  {
    num: "06",
    title: "No Advertising Cookies",
    body: "BSPrep does not use advertising networks, retargeting pixels, or third-party marketing cookies. We do not track you for ad targeting purposes, and we do not sell or share your browsing data with advertisers.",
  },
  {
    num: "07",
    title: "Cookie Duration",
    body: "Session cookies expire when you close your browser. Persistent cookies (such as authentication tokens) may last up to 7 days or until you sign out. Analytics cookies set by Google Analytics may persist for up to 2 years in accordance with their default configuration.",
  },
  {
    num: "08",
    title: "Managing Your Cookies",
    body: "You can manage or disable cookies through your browser settings at any time. Most browsers allow you to block or delete cookies. Note that disabling essential cookies will prevent you from staying logged in to BSPrep. Disabling analytics cookies will not affect your ability to use the platform.",
  },
  {
    num: "09",
    title: "Your Consent",
    body: "By continuing to use BSPrep, you consent to our use of cookies as described in this policy. You may withdraw consent for analytics cookies at any time by adjusting your browser settings or using your browser's built-in privacy controls.",
  },
  {
    num: "10",
    title: "Policy Updates",
    body: "We may update this Cookie Policy as our platform or third-party tools evolve. Changes will be posted on this page with a revised date. We recommend reviewing this page periodically to stay informed.",
  },
]

const cookieTable = [
  { name: "sb-access-token", provider: "Supabase", type: "Essential", purpose: "Maintains your authenticated login session", duration: "Session / 7 days" },
  { name: "sb-refresh-token", provider: "Supabase", type: "Essential", purpose: "Refreshes your session without re-login", duration: "7 days" },
  { name: "_ga", provider: "Google Analytics", type: "Analytics", purpose: "Distinguishes unique visitors (anonymised)", duration: "2 years" },
  { name: "_ga_*", provider: "Google Analytics 4", type: "Analytics", purpose: "Persists GA4 session state", duration: "2 years" },
  { name: "va_*", provider: "Vercel Analytics", type: "Performance", purpose: "Anonymous page performance tracking", duration: "Session" },
]

export default function CookiePolicyPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">Cookie Policy</h1>
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

          {/* Cookie table */}
          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-black/40 font-medium mb-3">Cookies in Use</p>
            <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/6">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider">Provider</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider hidden md:table-cell">Purpose</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieTable.map((row, i) => (
                      <tr key={row.name} className={i !== cookieTable.length - 1 ? "border-b border-black/6" : ""}>
                        <td className="px-5 py-3.5 font-mono text-xs text-black/70">{row.name}</td>
                        <td className="px-5 py-3.5 text-xs text-black/60">{row.provider}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.type === "Essential"
                              ? "bg-black/5 text-black/70"
                              : row.type === "Analytics"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-green-50 text-green-700"
                          }`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-black/50 hidden md:table-cell">{row.purpose}</td>
                        <td className="px-5 py-3.5 text-xs text-black/60 whitespace-nowrap">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-8 px-7 py-5 bg-black rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-white font-semibold text-sm">Questions about cookies?</p>
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
