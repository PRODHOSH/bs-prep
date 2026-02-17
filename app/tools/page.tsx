"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Calculator, TrendingUp, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function Tools() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
      setLoading(false)
    })
  }, [])

  const tools = [
    {
      title: "GPA Calculator",
      description: "Calculate your course grades and semester GPA with precision. Get instant results for all your IITM BS courses.",
      icon: Calculator,
      color: "from-[#3e3098] to-[#5842c3]",
      link: "/tools/gpa-calculator",
      features: ["Course Grade Calculation", "Semester GPA", "Multiple Courses"]
    },
    {
      title: "GPA Predictor",
      description: "Predict what you need in upcoming exams. Plan your study strategy based on target grades.",
      icon: TrendingUp,
      color: "from-[#51b206] to-[#6dd608]",
      link: "/tools/gpa-predictor",
      features: ["Grade Predictions", "Required Scores", "Smart Planning"]
    }
  ]

  // Show navbar even during loading to prevent blank page flash
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#3e3098]/20 to-[#51b206]/20 border border-[#3e3098]/30 mb-6">
              <Sparkles className="w-4 h-4 text-[#51b206]" />
              <span className="text-sm font-medium">Academic Tools</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#3e3098] via-[#51b206] to-[#3e3098] bg-clip-text text-transparent">
                Smart Tools for 
              </span>
              <br />
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Academic Success
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Calculate grades, predict scores, and plan your academic journey with our powerful tools designed specifically for IITM BS students.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="pb-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <Link 
                  key={index}
                  href={tool.link}
                  className="group"
                >
                  <Card className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                    {/* Colored Header */}
                    <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
                    
                    <div className="p-8">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-[#3e3098] group-hover:to-[#51b206] group-hover:bg-clip-text group-hover:text-transparent transition-all">
                        {tool.title}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-6">
                        {tool.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {tool.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tool.color}`}></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${tool.color} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                        <span>Launch Tool</span>
                        <svg className="w-4 h-4 text-[#51b206]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
