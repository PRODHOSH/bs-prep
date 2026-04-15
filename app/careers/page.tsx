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
    <div className="relative min-h-screen overflow-x-clip bg-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-white bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] bg-size-[14px_14px]" />

      <Navbar isAuthenticated={false} />

      <main className="relative z-10 pt-24 pb-20 md:pt-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-[#E5DBC8] bg-white p-5 shadow-sm md:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">We are hiring</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Careers at BSPrep</h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">Simple one-page application flow for open roles.</p>

            <article className="mt-6 rounded-xl border border-slate-200 bg-white p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    <Briefcase className="h-3.5 w-3.5" />
                    Subject Educator
                  </span>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    Open
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                    <Clock className="h-3.5 w-3.5" /> Part-time
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                    <MapPin className="h-3.5 w-3.5" /> Remote
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                    <IndianRupee className="h-3.5 w-3.5" /> Paid
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-base">
                Teach IITM BS learners with structured live support, clear explanation, and practical exam guidance.
              </p>

              <h2 className="mt-5 text-base font-semibold text-slate-900">Requirements</h2>
              <ul className="mt-3 space-y-2">
                {requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#subject-educator-apply"
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/85"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={APPLY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Open in New Tab
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>
          </section>

          <section id="subject-educator-apply" className="mt-6 rounded-2xl border border-[#E5DBC8] bg-white p-4 shadow-sm md:p-6">
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Application Form</h2>
            <p className="mt-1 text-sm text-slate-600">Submit your details directly here.</p>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
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
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
