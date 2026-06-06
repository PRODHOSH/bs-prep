"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  IndianRupee,
  MapPin,
} from "lucide-react"

const APPLY_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSfvet6P3yTtm4Ui3VE7M0gDSAsltxZ-Rrtd4fgUY0_iL7lkNg/viewform?usp=send_form"
const EMBED_APPLY_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSfvet6P3yTtm4Ui3VE7M0gDSAsltxZ-Rrtd4fgUY0_iL7lkNg/viewform?embedded=true"

const requirements = [
  "A or S grade in relevant IITM BS course(s).",
  "Overall CGPA 7.5 or above.",
  "Clear communication skills in Tamil or English.",
  "Stable internet connection and a decent microphone setup.",
]

export default function CareersPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar isAuthenticated={false} />

      <main className="relative pt-28 pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] border border-[#10b981]/30 px-3 py-1 text-xs font-semibold text-[#10b981] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              We are hiring
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold text-[#111111] tracking-[-1.5px] leading-[1.1] mb-3">
              Careers at BSPrep
            </h1>
            <p className="text-[#374151] text-base">Simple one-page application flow for open roles.</p>
          </div>

          {/* Job listing */}
          <div className="bg-[#f5f5f5] rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-3 py-1 text-xs font-semibold text-white">
                  <Briefcase className="h-3 w-3" />
                  Subject Educator
                </span>
                <span className="inline-flex rounded-full border border-[#10b981]/30 bg-[#f0fdf4] px-2.5 py-1 text-xs font-semibold text-[#10b981]">
                  Open
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-xs text-[#374151]">
                  <Clock className="h-3 w-3" /> Part-time
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-xs text-[#374151]">
                  <MapPin className="h-3 w-3" /> Remote
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-xs text-[#374151]">
                  <IndianRupee className="h-3 w-3" /> Paid
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#374151] mb-5">
              Teach IITM BS learners with structured live support, clear explanation, and practical exam guidance.
            </p>

            <h2 className="text-sm font-semibold text-[#111111] mb-3">Requirements</h2>
            <ul className="space-y-2 mb-6">
              {requirements.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#374151]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <a
                href="#subject-educator-apply"
                className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-5 h-10 text-sm font-semibold text-white hover:bg-[#242424] transition-colors"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={APPLY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-5 h-10 text-sm font-semibold text-[#374151] hover:bg-[#f5f5f5] transition-colors"
              >
                Open in New Tab
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Application form */}
          <div id="subject-educator-apply" className="bg-white rounded-2xl border border-[#e5e7eb] p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#111111] tracking-[-0.3px] mb-1">Application Form</h2>
            <p className="text-sm text-[#6b7280] mb-5">Submit your details directly here.</p>

            <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f8f9fa]">
              <iframe
                title="Subject Educator Application Form"
                src={EMBED_APPLY_LINK}
                className="w-full border-0"
                style={{ height: "760px" }}
                loading="lazy"
              >
                Loading...
              </iframe>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
