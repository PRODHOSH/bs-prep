"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, TrendingUp } from "lucide-react"
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
      description: "Calculate course grades and semester GPA with ease.",
      icon: <Calculator className="w-12 h-12 text-[#3e3098]" />,
      link: "/tools/gpa-calculator"
    },
    {
      title: "GPA Predictor",
      description: "Quickly predict your grades and plan ahead.",
      icon: <TrendingUp className="w-12 h-12 text-[#51b206]" />,
      link: "/tools/gpa-predictor"
    }
  ]

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Academic Tools
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Essential tools to help you manage and predict your academic performance
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {tools.map((tool, index) => (
              <Link 
                key={index}
                href={tool.link}
                className="group"
              >
                <Card className="bg-black/80 backdrop-blur-sm border-0 shadow-2xl h-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(62,48,152,0.3)]">
                  <CardContent className="p-8 flex flex-col items-center text-center h-full">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
                    <h2 className="text-2xl font-bold mb-4 group-hover:text-[#3e3098] transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed mb-6 flex-1">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-2 text-[#51b206] font-semibold">
                      <span>Open Tool</span>
                      <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
