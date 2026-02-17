"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }
      setUser(user)

      const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        // Default to student if profile not found
        setRole("student")
      } else if (profile) {
        console.log("User role detected:", profile.role)
        setRole(profile.role || "student")
        
        // Redirect admin/mentor to their respective dashboards
        if (profile.role === "admin" && window.location.pathname === "/dashboard") {
          router.push("/dashboard/admin/users")
        } else if (profile.role === "mentor" && window.location.pathname === "/dashboard") {
          router.push("/dashboard/mentor/courses")
        }
      } else {
        // No profile found, default to student
        setRole("student")
      }
    }

    getUser()
  }, [])

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} userRole={role || "student"} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
