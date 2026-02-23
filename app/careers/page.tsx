"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Briefcase, ArrowRight, MapPin, Clock, Building2, IndianRupee, GraduationCap, Users, Mic } from "lucide-react"

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
    highlights: [
      { icon: GraduationCap, label: "A/S grade in subject + CGPA ≥ 7.5" },
      { icon: Users, label: "Tamil & English communication" },
      { icon: Mic, label: "Decent mic + stable internet" },
      { icon: IndianRupee, label: "Paid · compensation after selection" },
    ],
    perks: ["Flexible schedule", "Real teaching experience", "Community impact"],
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

          <div className="flex flex-col gap-6 max-w-2xl">
            {openings.map((job) => (
              <div key={job.id} className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden">
                {/* Card Header */}
                <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-extrabold text-black">{job.title}</h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">{job.badge}</span>
                      </div>
                      {/* Meta tags */}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" />{job.type}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />{job.mode}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Building2 className="w-3 h-3" />{job.department}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mx-6" />

                {/* Tagline */}
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{job.tagline}</p>
                </div>

                {/* Highlights grid */}
                <div className="px-6 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {job.highlights.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5">
                      <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-xs text-gray-700 font-medium leading-snug">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Perks */}
                <div className="px-6 pb-4 flex items-center flex-wrap gap-2">
                  {job.perks.map(p => (
                    <span key={p} className="text-xs font-semibold px-3 py-1 rounded-full bg-black/5 text-black/70 border border-black/10">{p}</span>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mx-6" />

                {/* Footer CTA */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Apply takes &lt; 2 minutes</p>
                  <Link href={`/careers/${job.id}`} className="group inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-black/80 transition-colors">
                    View & Apply
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
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
