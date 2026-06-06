"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Star, Send, MessageCircle, Heart, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SupportPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"contact" | "feedback">("contact")
  const supabase = createClient()

  const [contactForm, setContactForm] = useState({ fullName: "", email: "", subject: "", message: "" })
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  const [feedbackForm, setFeedbackForm] = useState({ name: "", email: "", rating: 0, category: "", message: "", recommend: "" })
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
      setLoading(false)
    })
  }, [])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('entry.1241521326', contactForm.fullName)
      formData.append('entry.1423357531', contactForm.email)
      formData.append('entry.1834255665', contactForm.subject)
      formData.append('entry.13986512', contactForm.message)

      const iframe = document.createElement('iframe')
      iframe.name = 'hidden_iframe'
      iframe.style.display = 'none'
      document.body.appendChild(iframe)

      const form = document.createElement('form')
      form.target = 'hidden_iframe'
      form.method = 'POST'
      form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSc8lSGsbLay_yvhHWjL2rtCd0YJCgjXmxNZ3ttB4IcFB0Js8g/formResponse'

      formData.forEach((value, key) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value as string
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()

      setTimeout(() => {
        document.body.removeChild(form)
        document.body.removeChild(iframe)
      }, 1000)

      setContactSubmitting(false)
      setContactSuccess(true)
      setContactForm({ fullName: "", email: "", subject: "", message: "" })
      setTimeout(() => setContactSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setContactSubmitting(false)
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('entry.238739504', feedbackForm.name)
      formData.append('entry.861191758', feedbackForm.email)
      formData.append('entry.756693031', feedbackForm.rating.toString())
      formData.append('entry.1274668996', feedbackForm.category)
      formData.append('entry.985887691', feedbackForm.message)
      formData.append('entry.149124503', feedbackForm.recommend)

      const iframe = document.createElement('iframe')
      iframe.name = 'hidden_iframe'
      iframe.style.display = 'none'
      document.body.appendChild(iframe)

      const form = document.createElement('form')
      form.target = 'hidden_iframe'
      form.method = 'POST'
      form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSeqAmEuz6NrH6P-sa7jD9-0272a-cwm9eASrbvHor7nJN_TtQ/formResponse'

      formData.forEach((value, key) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value as string
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()

      setTimeout(() => {
        document.body.removeChild(form)
        document.body.removeChild(iframe)
      }, 1000)

      setFeedbackSubmitting(false)
      setFeedbackSuccess(true)
      setFeedbackForm({ name: "", email: "", rating: 0, category: "", message: "", recommend: "" })
      setTimeout(() => setFeedbackSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setFeedbackSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-white">
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-semibold text-[#111111] tracking-[-2px] leading-[1.05] mb-4">
            Support Center
          </h1>
          <p className="text-[#374151] text-base max-w-xl mx-auto">
            Get help, share feedback, or support the initiative.
          </p>
        </div>
      </section>

      {/* Quick channels */}
      <section className="pb-12 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#f5f5f5] rounded-xl p-5">
              <div className="w-9 h-9 bg-[#111111] rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-[#111111] mb-1">Contact Support</h3>
              <p className="text-xs text-[#6b7280] leading-relaxed">Send us a message and we'll get back to you.</p>
            </div>
            <div className="bg-[#f5f5f5] rounded-xl p-5">
              <div className="w-9 h-9 bg-[#111111] rounded-lg flex items-center justify-center mb-3">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-[#111111] mb-1">Share Feedback</h3>
              <p className="text-xs text-[#6b7280] leading-relaxed">Rate your experience and help us improve.</p>
            </div>
            <div className="bg-[#f5f5f5] rounded-xl p-5">
              <div className="w-9 h-9 bg-[#111111] rounded-lg flex items-center justify-center mb-3">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-[#111111] mb-1">Support via Donation</h3>
              <p className="text-xs text-[#6b7280] leading-relaxed">Contribute to keep BSPrep growing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tab area */}
      <section className="pb-24 bg-[#f8f9fa]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-12">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-[#f5f5f5] rounded-full p-1.5 mb-10 w-fit mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "contact"
                  ? "bg-white text-[#111111] shadow-sm"
                  : "text-[#6b7280]"
              }`}
            >
              Contact Support
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("feedback")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "feedback"
                  ? "bg-white text-[#111111] shadow-sm"
                  : "text-[#6b7280]"
              }`}
            >
              Share Feedback
            </button>
          </div>

          {/* Contact Form */}
          {activeTab === "contact" && (
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8">
              <h2 className="text-xl font-semibold text-[#111111] tracking-[-0.3px] mb-1">Contact Support</h2>
              <p className="text-sm text-[#6b7280] mb-6">Get help with questions or issues — we'll reply to your email.</p>

              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm font-medium text-[#111111]">
                      Full Name <span className="text-[#ef4444]">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Your name"
                      required
                      value={contactForm.fullName}
                      onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                      className="h-10 bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactEmail" className="text-sm font-medium text-[#111111]">
                      Email Address <span className="text-[#ef4444]">*</span>
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="h-10 bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm font-medium text-[#111111]">
                    Subject <span className="text-[#ef4444]">*</span>
                  </Label>
                  <Select value={contactForm.subject} onValueChange={(value) => setContactForm({ ...contactForm, subject: value })} required>
                    <SelectTrigger className="h-10 bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] rounded-lg">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#e5e7eb]">
                      <SelectItem value="General Question" className="text-[#111111]">General Question</SelectItem>
                      <SelectItem value="Technical Issue" className="text-[#111111]">Technical Issue</SelectItem>
                      <SelectItem value="Content Issue" className="text-[#111111]">Content Issue</SelectItem>
                      <SelectItem value="Account Problem" className="text-[#111111]">Account Problem</SelectItem>
                      <SelectItem value="Other" className="text-[#111111]">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactMessage" className="text-sm font-medium text-[#111111]">
                    Message <span className="text-[#ef4444]">*</span>
                  </Label>
                  <Textarea
                    id="contactMessage"
                    placeholder="Describe your issue or question clearly..."
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="min-h-30 resize-none bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                  />
                </div>

                {contactSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-[#f0fdf4] border border-[#10b981]/30 rounded-lg text-[#10b981] text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Message sent! We'll get back to you soon.
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-10 px-6 text-sm font-semibold bg-[#111111] hover:bg-[#242424] text-white rounded-lg transition-colors"
                  disabled={contactSubmitting}
                >
                  {contactSubmitting ? "Sending..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Feedback Form */}
          {activeTab === "feedback" && (
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8">
              <h2 className="text-xl font-semibold text-[#111111] tracking-[-0.3px] mb-1">Share Feedback</h2>
              <p className="text-sm text-[#6b7280] mb-6">Help us improve your experience — your input shapes what we build next.</p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="feedbackName" className="text-sm font-medium text-[#111111]">
                      Name <span className="text-xs text-[#6b7280] font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="feedbackName"
                      placeholder="Your name"
                      value={feedbackForm.name}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                      className="h-10 bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="feedbackEmail" className="text-sm font-medium text-[#111111]">
                      Email <span className="text-xs text-[#6b7280] font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="feedbackEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={feedbackForm.email}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                      className="h-10 bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#111111]">
                    Overall Rating <span className="text-[#ef4444]">*</span>
                  </Label>
                  <div className="flex items-center gap-2 p-4 bg-[#f5f5f5] rounded-xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 transition-all ${star <= feedbackForm.rating ? "fill-[#fb923c] text-[#fb923c]" : "text-[#e5e7eb]"}`} />
                      </button>
                    ))}
                    {feedbackForm.rating > 0 && (
                      <span className="ml-2 text-sm font-medium text-[#111111]">
                        {["", "Very Poor", "Poor", "Average", "Good", "Excellent"][feedbackForm.rating]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-[#111111]">
                    Feedback Category <span className="text-[#ef4444]">*</span>
                  </Label>
                  <Select value={feedbackForm.category} onValueChange={(value) => setFeedbackForm({ ...feedbackForm, category: value })} required>
                    <SelectTrigger className="h-10 bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] rounded-lg">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#e5e7eb]">
                      <SelectItem value="Study Materials" className="text-[#111111]">Study Materials</SelectItem>
                      <SelectItem value="Quizzes & Practice" className="text-[#111111]">Quizzes & Practice</SelectItem>
                      <SelectItem value="Doubt Solving" className="text-[#111111]">Doubt Solving</SelectItem>
                      <SelectItem value="Mentors" className="text-[#111111]">Mentors</SelectItem>
                      <SelectItem value="Website / UI" className="text-[#111111]">Website / UI</SelectItem>
                      <SelectItem value="Overall Experience" className="text-[#111111]">Overall Experience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="feedbackMessage" className="text-sm font-medium text-[#111111]">
                    Feedback Message <span className="text-[#ef4444]">*</span>
                  </Label>
                  <Textarea
                    id="feedbackMessage"
                    placeholder="Tell us what you liked or what we can improve..."
                    required
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    className="min-h-25 resize-none bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#111111]">Would you recommend BSPrep?</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "Yes", label: "Yes 👍" },
                      { value: "Maybe", label: "Maybe 🤔" },
                      { value: "No", label: "No 👎" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, recommend: option.value })}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all border ${
                          feedbackForm.recommend === option.value
                            ? "bg-[#111111] text-white border-[#111111]"
                            : "bg-white text-[#374151] border-[#e5e7eb]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {feedbackSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-[#f0fdf4] border border-[#10b981]/30 rounded-lg text-[#10b981] text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Thank you for your feedback! It helps us improve.
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-10 px-6 text-sm font-semibold bg-[#111111] hover:bg-[#242424] text-white rounded-lg transition-colors"
                  disabled={feedbackSubmitting || feedbackForm.rating === 0}
                >
                  {feedbackSubmitting ? "Submitting..." : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Donation strip */}
      <section className="py-12 bg-white border-t border-[#e5e7eb]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#f5f5f5] rounded-lg flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-[#111111]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#111111]">Support BSPrep by Donation</p>
                <p className="text-xs text-[#6b7280]">Contribute via UPI on our dedicated donation page.</p>
              </div>
            </div>
            <Link
              href="/donate"
              className="shrink-0 inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[#111111] text-white text-sm font-semibold hover:bg-[#242424] transition-colors"
            >
              Open Donation Page
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
