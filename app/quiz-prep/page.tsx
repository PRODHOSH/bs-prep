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

      <main className="flex-1 flex items-center justify-center py-24 px-4 bg-[#FDFBF7]">
        <div className="max-w-lg w-full text-center space-y-6 border border-black/10 bg-white p-12 shadow-xl rounded-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-bold text-black uppercase tracking-widest">
            IN PROGRESS
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-black tracking-tight leading-none uppercase">
            COMING SOON
          </h1>
          <p className="text-black/70 text-sm font-bold max-w-sm mx-auto leading-relaxed uppercase">
            We're working on bringing you a comprehensive quiz preparation platform. Stay tuned for updates!
          </p>
          <div className="pt-4">
            <Link href={isAuthenticated ? "/dashboard" : "/courses"}>
              <Button className="group bg-[#0a192f] text-white hover:bg-[#112a52] px-8 h-12 text-sm font-bold rounded-full transition-all uppercase tracking-widest shadow-md">
                EXPLORE COURSES
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
