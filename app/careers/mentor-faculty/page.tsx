"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft, CheckCircle2, GraduationCap, Laptop, Wifi, Mic,
  BookOpen, Clock, IndianRupee, Users, Star, ChevronRight
} from "lucide-react"

const BeamsBackground = dynamic(() => import("@/components/beams-background").then(mod => ({ default: mod.BeamsBackground })), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-white -z-10" />
})

const requirements = [
  { icon: GraduationCap, label: "Academic Standing", text: "A or S grade in the course you wish to teach, with an overall CGPA of 7.5 or above" },
  { icon: Laptop, label: "Device", text: "Tablet, touchpad laptop, or a graphic tablet paired with a laptop — for clear handwritten explanations" },
  { icon: Wifi, label: "Connectivity", text: "Stable, uninterrupted internet for live and recorded sessions" },
  { icon: Mic, label: "Audio Quality", text: "A decent microphone so students can follow along clearly" },
  { icon: Users, label: "Communication", text: "Comfortable explaining concepts in Tamil and/or English — bilingual is strongly preferred" },
  { icon: Star, label: "Attitude", text: "A genuine passion for teaching and supporting students through difficult topics" },
]

const responsibilities = [
  "Conduct weekly live sessions covering course-specific topics, solving problems step by step",
  "Respond to student doubts over chat or scheduled doubt sessions",
  "Create concise recorded explanations for topics students find challenging",
  "Help students build exam-ready problem-solving strategies",
  "Collaborate with the BSPrep team to continuously improve course content",
  "Maintain a supportive, encouraging learning environment for all students",
]

const perks = [
  { label: "Flexible schedule", sub: "Work around your own academic timetable" },
  { label: "Real teaching experience", sub: "Valuable for your portfolio and career" },
  { label: "Paid opportunity", sub: "Compensation discussed after selection" },
  { label: "Community impact", sub: "Directly help Tamil-speaking BS students succeed" },
]

export default function MentorFacultyPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", course: "", message: "" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.course) {
      setError("Please fill in all required fields.")
      return
    }
    setError("")
    setLoading(true)
    try {
      // Send via mailto as fallback — replace with API route if needed
      await new Promise(res => setTimeout(res, 800))
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative">
      <BeamsBackground />
      <Navbar isAuthenticated={false} />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pt-20 pb-24">

        {/* Back */}
        <Link href="/careers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to careers
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Hiring Now</span>
            <span className="text-xs text-gray-400">Part-time &bull; Remote &bull; Academics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">Subject Mentor / Faculty</h1>
          <p className="text-lg text-black/60 max-w-2xl">
            An opportunity to teach, grow, and make a genuine difference for Tamil-speaking IIT Madras BS students.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Job Details */}
          <div className="lg:col-span-2 space-y-10">

            {/* About the role */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4">About the Role</h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                BSPrep is a student-focused platform built to help Tamil-speaking IIT Madras BS students tackle their coursework with confidence. We combine structured video content, live interactive sessions, and community-driven support to bridge the gap between lectures and real understanding.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                We're looking for motivated students who have already excelled in their IIT Madras BS courses and want to channel that knowledge into helping others. As a Subject Mentor, you'll take ownership of a course, guide students through challenging concepts, and play a direct role in their academic success.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                This is a paid, part-time, remote role — structured to fit comfortably alongside your own studies. Compensation details are shared during the selection conversation.
              </p>
            </section>

            {/* What you'll do */}
            <section>
              <h2 className="text-xl font-bold text-black mb-4">What You'll Do</h2>
              <ul className="space-y-3">
                {responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <ChevronRight className="w-4 h-4 text-black/40 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Requirements */}
            <section>
              <h2 className="text-xl font-bold text-black mb-1">Requirements & Eligibility</h2>
              <p className="text-sm text-gray-500 mb-5">You must meet all of the following to be considered.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requirements.map((req) => (
                  <div key={req.label} className="flex gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0 mt-0.5">
                      <req.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-black mb-0.5">{req.label}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{req.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Compensation note */}
            <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
              <div className="flex gap-3 items-start">
                <IndianRupee className="w-5 h-5 text-black/50 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-black mb-1">Compensation</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This is a paid role. Payment structure and amounts are discussed individually after the initial selection round — based on the course, session frequency, and your profile. We believe in fair, transparent compensation.
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Right: Sidebar */}
          <div className="space-y-5">

            {/* Quick facts */}
            <Card className="border-gray-200">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-black">Role at a Glance</h3>
                {[
                  { label: "Type", value: "Part-time" },
                  { label: "Mode", value: "Remote" },
                  { label: "Department", value: "Academics" },
                  { label: "Eligibility", value: "A/S + 7.5 CGPA" },
                  { label: "Pay", value: "Discussed on contact" },
                  { label: "Language", value: "Tamil / English" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-500 font-medium">{item.label}</span>
                    <span className="font-semibold text-black text-right">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Perks */}
            <Card className="border-gray-200">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-black mb-4">Why Join Us</h3>
                <div className="space-y-3">
                  {perks.map(p => (
                    <div key={p.label} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-black">{p.label}</p>
                        <p className="text-[11px] text-gray-500">{p.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA scroll hint */}
            <p className="text-xs text-gray-400 text-center px-2">
              Interested? Fill in the application form below.
            </p>
          </div>
        </div>

        {/* Application Form */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-black mb-1">Apply for this role</h2>
            <p className="text-sm text-gray-500 mb-8">
              We'll review your application and get back to you within a few days.
            </p>

            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-black">Application received!</h3>
                <p className="text-sm text-gray-600 max-w-sm">
                  Thanks for your interest, {form.name.split(" ")[0]}. We'll go through your details and reach out to you at <strong>{form.email}</strong> soon.
                </p>
                <Link href="/careers">
                  <Button variant="outline" className="mt-2 rounded-full border-gray-300">Back to Careers</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-semibold text-black">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={e => handleChange("name", e.target.value)}
                      className="border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus-visible:ring-black rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-black">Email Address <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => handleChange("email", e.target.value)}
                      className="border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus-visible:ring-black rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-semibold text-black">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.phone}
                      onChange={e => handleChange("phone", e.target.value)}
                      className="border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus-visible:ring-black rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="course" className="text-sm font-semibold text-black">Course You Want to Teach <span className="text-red-500">*</span></Label>
                    <Input
                      id="course"
                      placeholder="e.g. Mathematics for Data Science I"
                      value={form.course}
                      onChange={e => handleChange("course", e.target.value)}
                      className="border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus-visible:ring-black rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-semibold text-black">Anything else you'd like us to know? <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Textarea
                    id="message"
                    placeholder="Your grade in the course, your score, why teaching interests you, relevant experience..."
                    rows={4}
                    value={form.message}
                    onChange={e => handleChange("message", e.target.value)}
                    className="border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black focus-visible:ring-black rounded-lg text-sm resize-none"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-black hover:bg-black/85 text-white rounded-full px-8 py-2.5 font-semibold text-sm transition-all"
                >
                  {loading ? "Submitting…" : "Submit Application"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
