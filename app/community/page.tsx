"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Users, Hammer } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function CommunityPage() {
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
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full text-center space-y-6">
          <div className="flex items-center justify-center mb-2">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full">
            <Hammer className="w-3.5 h-3.5" />
            Under Construction
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
            Community is<br />Coming Soon
          </h1>

          <p className="text-base text-black/60 max-w-md mx-auto leading-relaxed">
            We&apos;re building a space for Tamil-speaking IITM BS students to connect, share notes, ask doubts, and grow together. Stay tuned!
          </p>

          <div className="pt-4">
            <Link href={isAuthenticated ? "/dashboard" : "/"}>
              <Button variant="outline" className="group border-slate-300 hover:border-slate-900 text-black hover:bg-transparent hover:text-black">
                {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
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

