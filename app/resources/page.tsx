"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResourcesPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-black to-black/80 bg-clip-text text-transparent">
              Coming Soon
            </span>
          </h1>
          
          <p className="text-base text-black/70 max-w-md mx-auto">
            We're working on bringing you a comprehensive learning resources library. Stay tuned for updates!
          </p>

          <div className="pt-4">
            <Link href={isAuthenticated ? "/dashboard" : "/tools"}>
              <Button variant="outline" className="group border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-black hover:bg-transparent hover:text-black">
                Explore Other Tools
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
