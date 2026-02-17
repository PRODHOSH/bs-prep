"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Star, Send, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SupportPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  })
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  // Feedback Form State
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    rating: 0,
    category: "",
    message: "",
    recommend: ""
  })
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
      // Google Form entry IDs
      const formData = new FormData()
      formData.append('entry.1241521326', contactForm.fullName)
      formData.append('entry.1423357531', contactForm.email)
      formData.append('entry.1834255665', contactForm.subject)
      formData.append('entry.13986512', contactForm.message)

      // Submit to Google Forms using iframe method
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

      // Clean up
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
      // Google Form entry IDs
      const formData = new FormData()
      formData.append('entry.238739504', feedbackForm.name)
      formData.append('entry.861191758', feedbackForm.email)
      formData.append('entry.756693031', feedbackForm.rating.toString())
      formData.append('entry.1274668996', feedbackForm.category)
      formData.append('entry.985887691', feedbackForm.message)
      formData.append('entry.149124503', feedbackForm.recommend)

      // Submit to Google Forms using iframe method
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

      // Clean up
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

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3e3098]/5 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Support Center
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              We're here to help. Get in touch or share your feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="pb-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* A. CONTACT / SUPPORT FORM */}
            <Card className="bg-black/40 backdrop-blur-xl border-slate-800 hover:border-slate-700 transition-all">
              <CardHeader className="space-y-4 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3e3098] to-[#3e3098]/50 flex items-center justify-center shadow-lg shadow-[#3e3098]/20">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Contact BSPrep Support</CardTitle>
                    <CardDescription className="text-slate-400 text-base mt-1">Get help with questions or issues</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-slate-300">
                      Full Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your name"
                      required
                      value={contactForm.fullName}
                      onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                      className="h-12 bg-slate-900/50 border-slate-700 focus:border-[#3e3098] focus:ring-[#3e3098] text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-sm font-medium text-slate-300">
                      Email Address <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="h-12 bg-slate-900/50 border-slate-700 focus:border-[#3e3098] focus:ring-[#3e3098] text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-slate-300">
                      Subject <span className="text-red-400">*</span>
                    </Label>
                    <Select 
                      value={contactForm.subject} 
                      onValueChange={(value) => setContactForm({ ...contactForm, subject: value })}
                      required
                    >
                      <SelectTrigger className="h-12 bg-slate-900/50 border-slate-700 focus:border-[#3e3098] focus:ring-[#3e3098] text-white">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="General Question" className="text-white hover:bg-slate-800">General Question</SelectItem>
                        <SelectItem value="Technical Issue" className="text-white hover:bg-slate-800">Technical Issue</SelectItem>
                        <SelectItem value="Content Issue" className="text-white hover:bg-slate-800">Content Issue</SelectItem>
                        <SelectItem value="Account Problem" className="text-white hover:bg-slate-800">Account Problem</SelectItem>
                        <SelectItem value="Other" className="text-white hover:bg-slate-800">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="contactMessage" className="text-sm font-medium text-slate-300">
                      Message <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="contactMessage"
                      placeholder="Describe your issue or question clearly..."
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="min-h-[140px] resize-none bg-slate-900/50 border-slate-700 focus:border-[#3e3098] focus:ring-[#3e3098] text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Success Message */}
                  {contactSuccess && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                      ✓ Message sent successfully! We'll get back to you soon.
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#3e3098] to-[#3e3098]/80 hover:from-[#3e3098]/90 hover:to-[#3e3098]/70 text-white rounded-xl shadow-lg shadow-[#3e3098]/20 transition-all"
                    disabled={contactSubmitting}
                  >
                    {contactSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* B. FEEDBACK FORM */}
            <Card className="bg-black/40 backdrop-blur-xl border-slate-800 hover:border-slate-700 transition-all">
              <CardHeader className="space-y-4 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#51b206] to-[#51b206]/50 flex items-center justify-center shadow-lg shadow-[#51b206]/20">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Help Us Improve BSPrep</CardTitle>
                    <CardDescription className="text-slate-400 text-base mt-1">Share your feedback and suggestions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  {/* Name (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="feedbackName" className="text-sm font-medium text-slate-300">
                      Name <span className="text-slate-500 text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="feedbackName"
                      placeholder="Your name"
                      value={feedbackForm.name}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                      className="h-12 bg-slate-900/50 border-slate-700 focus:border-[#51b206] focus:ring-[#51b206] text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="feedbackEmail" className="text-sm font-medium text-slate-300">
                      Email <span className="text-slate-500 text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="feedbackEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={feedbackForm.email}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                      className="h-12 bg-slate-900/50 border-slate-700 focus:border-[#51b206] focus:ring-[#51b206] text-white placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500">Only if you'd like us to follow up</p>
                  </div>

                  {/* Overall Experience Rating */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-300">
                      Overall Experience Rating <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center gap-3 p-4 bg-slate-900/30 rounded-xl border border-slate-800">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                          className="transition-all hover:scale-125"
                        >
                          <Star
                            className={`w-9 h-9 transition-all ${
                              star <= feedbackForm.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-700 hover:text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                      {feedbackForm.rating > 0 && (
                        <span className="ml-2 text-sm font-medium text-slate-300">
                          {feedbackForm.rating === 1 && "Very Poor"}
                          {feedbackForm.rating === 2 && "Poor"}
                          {feedbackForm.rating === 3 && "Average"}
                          {feedbackForm.rating === 4 && "Good"}
                          {feedbackForm.rating === 5 && "Excellent"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feedback Category */}
                  <div className="space-y-2">
                    <Label htmlFor="feedbackCategory" className="text-sm font-medium text-slate-300">
                      What are you giving feedback about? <span className="text-red-400">*</span>
                    </Label>
                    <Select 
                      value={feedbackForm.category} 
                      onValueChange={(value) => setFeedbackForm({ ...feedbackForm, category: value })}
                      required
                    >
                      <SelectTrigger className="h-12 bg-slate-900/50 border-slate-700 focus:border-[#51b206] focus:ring-[#51b206] text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="Study Materials" className="text-white hover:bg-slate-800">Study Materials</SelectItem>
                        <SelectItem value="Quizzes & Practice" className="text-white hover:bg-slate-800">Quizzes & Practice</SelectItem>
                        <SelectItem value="Doubt Solving" className="text-white hover:bg-slate-800">Doubt Solving</SelectItem>
                        <SelectItem value="Mentors" className="text-white hover:bg-slate-800">Mentors</SelectItem>
                        <SelectItem value="Website / UI" className="text-white hover:bg-slate-800">Website / UI</SelectItem>
                        <SelectItem value="Overall Experience" className="text-white hover:bg-slate-800">Overall Experience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Feedback Message */}
                  <div className="space-y-2">
                    <Label htmlFor="feedbackMessage" className="text-sm font-medium text-slate-300">
                      Feedback Message <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="feedbackMessage"
                      placeholder="Tell us what you liked or what we can improve..."
                      required
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                      className="min-h-[120px] resize-none bg-slate-900/50 border-slate-700 focus:border-[#51b206] focus:ring-[#51b206] text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Would you recommend */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-300">Would you recommend BSPrep to others?</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "Yes", label: "Yes", emoji: "👍" },
                        { value: "Maybe", label: "Maybe", emoji: "🤔" },
                        { value: "No", label: "No", emoji: "👎" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, recommend: option.value })}
                          className={`h-12 rounded-xl font-medium transition-all ${
                            feedbackForm.recommend === option.value
                              ? "bg-[#51b206] text-white shadow-lg shadow-[#51b206]/20"
                              : "bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <span className="mr-2">{option.emoji}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Success Message */}
                  {feedbackSuccess && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                      ✓ Thank you for your feedback! It helps us improve.
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#51b206] to-[#51b206]/80 hover:from-[#51b206]/90 hover:to-[#51b206]/70 text-white rounded-xl shadow-lg shadow-[#51b206]/20 transition-all"
                    disabled={feedbackSubmitting || feedbackForm.rating === 0}
                  >
                    {feedbackSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
