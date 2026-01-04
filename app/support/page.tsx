"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Star, Send, MessageCircle } from "lucide-react"

export default function SupportPage() {
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

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Support Center</h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
              Need help or want to share feedback? We're here to listen and assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            
            {/* A. CONTACT / SUPPORT FORM */}
            <Card className="bg-black/80 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#3e3098]/20 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-[#3e3098]" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Contact BSPrep Support</CardTitle>
                    <CardDescription className="text-base">Get help with questions or issues</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your name"
                      required
                      value={contactForm.fullName}
                      onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-base">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-base">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={contactForm.subject} 
                      onValueChange={(value) => setContactForm({ ...contactForm, subject: value })}
                      required
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-slate-700">
                        <SelectItem value="General Question">General Question</SelectItem>
                        <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                        <SelectItem value="Content Issue">Content Issue</SelectItem>
                        <SelectItem value="Account Problem">Account Problem</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="contactMessage" className="text-base">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="contactMessage"
                      placeholder="Describe your issue or question clearly..."
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="min-h-[150px] resize-none"
                    />
                  </div>

                  {/* Success Message */}
                  {contactSuccess && (
                    <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
                      Message sent successfully! We'll get back to you soon.
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-[#3e3098] hover:bg-[#3e3098]/90 text-white rounded-full"
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
            <Card className="bg-black/80 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#51b206]/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#51b206]" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Help Us Improve BSPrep</CardTitle>
                    <CardDescription className="text-base">Share your feedback and suggestions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                  {/* Name (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="feedbackName" className="text-base">
                      Name <span className="text-slate-500">(optional)</span>
                    </Label>
                    <Input
                      id="feedbackName"
                      placeholder="Your name"
                      value={feedbackForm.name}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="feedbackEmail" className="text-base">
                      Email <span className="text-slate-500">(optional)</span>
                    </Label>
                    <Input
                      id="feedbackEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={feedbackForm.email}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                      className="h-12"
                    />
                    <p className="text-xs text-slate-500">Only if you'd like us to follow up</p>
                  </div>

                  {/* Overall Experience Rating */}
                  <div className="space-y-2">
                    <Label className="text-base">
                      Overall Experience Rating <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= feedbackForm.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-3 text-sm text-slate-400">
                        {feedbackForm.rating === 0 && "Select a rating"}
                        {feedbackForm.rating === 1 && "Very Poor"}
                        {feedbackForm.rating === 2 && "Poor"}
                        {feedbackForm.rating === 3 && "Average"}
                        {feedbackForm.rating === 4 && "Good"}
                        {feedbackForm.rating === 5 && "Excellent"}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Category */}
                  <div className="space-y-2">
                    <Label htmlFor="feedbackCategory" className="text-base">
                      What are you giving feedback about? <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={feedbackForm.category} 
                      onValueChange={(value) => setFeedbackForm({ ...feedbackForm, category: value })}
                      required
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-slate-700">
                        <SelectItem value="Study Materials">Study Materials</SelectItem>
                        <SelectItem value="Quizzes & Practice">Quizzes & Practice</SelectItem>
                        <SelectItem value="Doubt Solving">Doubt Solving</SelectItem>
                        <SelectItem value="Mentors">Mentors</SelectItem>
                        <SelectItem value="Website / UI">Website / UI</SelectItem>
                        <SelectItem value="Overall Experience">Overall Experience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Feedback Message */}
                  <div className="space-y-2">
                    <Label htmlFor="feedbackMessage" className="text-base">
                      Feedback Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="feedbackMessage"
                      placeholder="Tell us what you liked or what we can improve..."
                      required
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  {/* Would you recommend */}
                  <div className="space-y-2">
                    <Label className="text-base">Would you recommend BSPrep to others?</Label>
                    <div className="flex gap-4">
                      {[
                        { value: "Yes", label: "Yes" },
                        { value: "Maybe", label: "Maybe" },
                        { value: "No", label: "No" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, recommend: option.value })}
                          className={`flex-1 h-11 rounded-full border-2 transition-all ${
                            feedbackForm.recommend === option.value
                              ? "border-[#51b206] bg-[#51b206]/20 text-[#51b206]"
                              : "border-slate-600 hover:border-slate-500"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Success Message */}
                  {feedbackSuccess && (
                    <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
                      Thank you for your feedback! It helps us improve.
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-[#51b206] hover:bg-[#51b206]/90 text-white rounded-full"
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
