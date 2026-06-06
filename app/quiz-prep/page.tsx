"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function QuizPrepPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] border border-[#e5e7eb] px-3 py-1 text-xs font-medium text-[#6b7280]">
            In progress
          </span>
          <h1 className="text-5xl md:text-6xl font-semibold text-[#111111] tracking-[-2px] leading-[1.05]">
            Coming Soon
          </h1>
          <p className="text-[#374151] text-base max-w-sm mx-auto leading-relaxed">
            We're working on bringing you a comprehensive quiz preparation platform. Stay tuned for updates!
          </p>
          <div className="pt-2">
            <Link href={isAuthenticated ? "/dashboard" : "/courses"}>
              <Button className="group bg-[#111111] text-white hover:bg-[#242424] px-6 h-10 text-sm font-semibold rounded-lg transition-colors">
                Explore Courses
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
