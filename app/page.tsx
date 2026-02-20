"use client"

import Link from "next/link"
import { useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AnimatedCounter } from "@/components/animated-counter"
import { BookOpen, Users, TrendingUp, CheckCircle, Zap, Award, ArrowRight, ChevronDown } from "lucide-react"

// Lazy load testimonials component
const StaggerTestimonials = dynamic(() => import("@/components/stagger-testimonials").then(mod => ({ default: mod.StaggerTestimonials })), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-black rounded-full"></div></div>
})

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is BSPrep?",
      answer: "BSPrep is a community-driven learning platform designed to help IITM BS students prepare better through structured courses, quizzes, and mentor support."
    },
    {
      question: "Is BSPrep officially affiliated with IIT Madras?",
      answer: "No. BSPrep is not officially affiliated with IIT Madras. It is an independent, student-led initiative."
    },
    {
      question: "How can I contact BSPrep?",
      answer: "You can contact us through the Support page on the website or by emailing bsprep.team@gmail.com"
    }
  ]

  return (
    <div className="min-h-screen text-foreground">
      <Navbar isAuthenticated={false} />

      <section className="relative overflow-hidden pt-20 md:pt-32 pb-20 md:pb-40">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="block mb-3 bg-gradient-to-r from-black to-black/80 bg-clip-text text-transparent">Learn IITM BS</span>
              <span className="block bg-gradient-to-r from-black to-black/80 bg-clip-text text-transparent">
                With Mentors by Your Side
              </span>
            </h1>

            <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
              Expert-led learning in Tamil, community support, and peer mentorship for IITM BS students. Master concepts, solve
              doubts, and ace your exams with our comprehensive platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/sign-up">
                <Button className="group bg-black text-white hover:bg-black/90 px-8 py-6 text-lg rounded-full transition-all duration-300 shadow-md hover:shadow-lg font-medium">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-white text-black px-8 py-6 text-lg rounded-full border-2 border-gray-300 hover:border-black transition-all duration-300 font-medium">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-20">
            {[
              { label: "Active Students", value: 2500, suffix: "+" },
              { label: "Expert Mentors", value: 150, suffix: "+" },
              { label: "Study Materials", value: 500, suffix: "+" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 cursor-default border border-gray-200"
              >
                <p className="text-2xl md:text-3xl font-bold text-black">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2500} />
                </p>
                <p className="text-sm text-black/70 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">How It Works</h2>
            <p className="text-black/70 text-lg">Three simple steps to transform your learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Access Materials",
                description: "Get comprehensive notes and video lectures from experienced mentors",
                icon: BookOpen,
              },
              {
                number: "02",
                title: "Connect with Mentors",
                description: "Request personalized guidance and get doubts solved in real-time",
                icon: Users,
              },
              {
                number: "03",
                title: "Track Progress",
                description: "Practice with quizzes and compete on the leaderboard",
                icon: TrendingUp,
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative bg-white backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
              >
                <div className="text-5xl font-bold text-gray-200 mb-4">
                  {step.number}
                </div>
                <step.icon className="w-10 h-10 text-black mb-4" />
                <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
                <p className="text-black/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">Why Choose IITM Learning?</h2>
            <p className="text-black/70 text-lg">Everything you need to succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Study Materials", desc: "500+ curated notes and resources" },
              { icon: CheckCircle, title: "Live Classes", desc: "Weekly mentoring sessions" },
              { icon: Zap, title: "Practice Quizzes", desc: "200+ questions with solutions" },
              { icon: Award, title: "Certifications", desc: "Earn recognition badges" },
              { icon: Users, title: "Community", desc: "Connect with 2500+ students" },
              { icon: TrendingUp, title: "Analytics", desc: "Track your growth in detail" },
            ].map((feature, i) => (
              <Card
                key={i}
                className="bg-white backdrop-blur-sm border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="pt-8 pb-6 px-6">
                  <feature.icon className="w-8 h-8 text-black mb-4" />
                  <h3 className="font-bold text-lg text-black mb-2">{feature.title}</h3>
                  <p className="text-black/70 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <StaggerTestimonials />

      <section className="relative py-20 md:py-28">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center bg-white backdrop-blur-sm rounded-3xl p-12 md:p-16 border border-gray-200 shadow-lg">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-black/70 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of IITM BS students accelerating their journey with expert mentorship and community support.
          </p>
          <Link href="/auth/sign-up">
            <Button className="group bg-black text-white hover:bg-black/90 px-12 py-7 text-lg rounded-full transition-all duration-300 shadow-md hover:shadow-lg font-medium">
              Get Started Now – It's Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-transparent to-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-black/70 text-lg">
              Everything you need to know about BSPrep
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:border-gray-300"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
                >
                  <h3 className="text-lg md:text-xl font-semibold text-black pr-8">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-black/70 flex-shrink-0 transition-transform duration-300 ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFAQ === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-6 text-black/70 text-base md:text-lg leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-black/70 mb-4">Still have questions?</p>
            <Link href="/support">
              <Button className="bg-black text-white hover:bg-black/90 px-8 py-4 rounded-full transition-all duration-300 font-medium">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
