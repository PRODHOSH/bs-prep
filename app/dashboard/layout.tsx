"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
        router.push("/auth/login")
        return
      }
      setUser(user)

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profile) {
        setRole(profile.role)
      }
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-primary">
            IIT Madras Learning
          </Link>

          <div className="flex items-center gap-6">
            {/* Navigation Links */}
            <div className="hidden md:flex gap-6">
              {role === "student" && (
                <>
                  <Link href="/dashboard" className="text-sm hover:text-primary">
                    My Courses
                  </Link>
                  <Link href="/dashboard/quizzes" className="text-sm hover:text-primary">
                    Quizzes
                  </Link>
                  <Link href="/dashboard/leaderboard" className="text-sm hover:text-primary">
                    Leaderboard
                  </Link>
                  <Link href="/dashboard/mentors" className="text-sm hover:text-primary">
                    Mentors
                  </Link>
                </>
              )}
              {role === "mentor" && (
                <>
                  <Link href="/dashboard/mentor/courses" className="text-sm hover:text-primary">
                    My Courses
                  </Link>
                  <Link href="/dashboard/mentor/students" className="text-sm hover:text-primary">
                    Students
                  </Link>
                  <Link href="/dashboard/mentor/requests" className="text-sm hover:text-primary">
                    Requests
                  </Link>
                </>
              )}
              {role === "admin" && (
                <>
                  <Link href="/dashboard/admin/users" className="text-sm hover:text-primary">
                    Users
                  </Link>
                  <Link href="/dashboard/admin/courses" className="text-sm hover:text-primary">
                    Courses
                  </Link>
                  <Link href="/dashboard/admin/analytics" className="text-sm hover:text-primary">
                    Analytics
                  </Link>
                </>
              )}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full w-10 h-10">
                  {user.email?.[0]?.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <span className="text-sm">{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
