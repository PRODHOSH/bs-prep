"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Briefcase, ArrowRight } from "lucide-react"

const BeamsBackground = dynamic(() => import("@/components/beams-background").then(mod => ({ default: mod.BeamsBackground })), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-white -z-10" />
})

const openings = [
  {
    id: "mentor-faculty",
    title: "Subject Mentor / Faculty",
    type: "Part-time",
    mode: "Remote",
    department: "Academics",
    badge: "Hiring Now",
    tagline: "Teach Tamil-speaking IIT Madras BS students through live sessions and recorded content.",
  },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white relative">
      <BeamsBackground />
      <Navbar isAuthenticated={false} />

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10">
            <Briefcase className="w-3.5 h-3.5 text-black/60" />
            <span className="text-xs font-semibold text-black/60 uppercase tracking-wide">Careers at BSPrep</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-3 text-black">
            Join our team
          </h1>
          <p className="text-lg text-black/70 max-w-2xl">
            We're building a platform that makes IIT Madras BS education accessible to Tamil-speaking students. If you're passionate about teaching and making a real difference, we'd love to have you.
          </p>
        </div>
      </section>

      {/* Openings */}
      <section className="relative z-10 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <p className="text-sm font-semibold text-black/50 uppercase tracking-widest mb-6">
            {openings.length} open position{openings.length !== 1 ? "s" : ""}
          </p>

          <div className="flex flex-col gap-3 max-w-2xl">
            {openings.map((job) => (
              <Link key={job.id} href={`/careers/${job.id}`} className="group">
                <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-200 rounded-xl px-6 py-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-black">{job.title}</h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">{job.badge}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{job.type} &bull; {job.mode} &bull; {job.department}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom note */}
          <div className="mt-16 border border-gray-200 rounded-2xl p-8 bg-gray-50 max-w-2xl">
            <h3 className="text-lg font-bold text-black mb-2">Don't see a role that fits?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We're always open to talented people who genuinely care about student success. Reach out to us at{" "}
              <a href="mailto:bsprep.team@gmail.com" className="font-semibold text-black underline underline-offset-2">
                bsprep.team@gmail.com
              </a>{" "}
              and tell us how you'd like to contribute.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
