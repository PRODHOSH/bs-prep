"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Bell, User, Menu, X } from "lucide-react"

interface NavbarProps {
  isAuthenticated?: boolean
  userRole?: string
}

export function Navbar({ isAuthenticated = false, userRole = "student" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profilePhoto, setProfilePhoto] = useState<string>('')
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      supabase.auth.getUser().then(({ data }) => setUser(data.user))
      fetchProfilePhoto()
    }
  }, [isAuthenticated])

  const fetchProfilePhoto = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const { profile } = await response.json()
        if (profile?.photo_url) {
          setProfilePhoto(profile.photo_url)
        }
      }
    } catch (error) {
      console.error('Error fetching profile photo:', error)
    }
  }

  // Poll for profile photo updates every 5 seconds when on profile page
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const interval = setInterval(() => {
        if (window.location.pathname === '/dashboard/profile') {
          fetchProfilePhoto()
        }
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav
      className={`sticky top-0 z-50 bg-black/30 dark:bg-black/30 backdrop-blur-lg transition-all duration-300 ${
        scrolled ? "border-b border-slate-200/20 dark:border-slate-700/30 shadow-lg" : "border-b border-slate-100/10 dark:border-slate-800/20"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 flex-shrink-0 group">
            <img 
              src="/logo.jpeg" 
              alt="IITM BS Logo" 
              className="w-9 h-9 rounded-full object-cover group-hover:opacity-80 transition-opacity"
            />
            <span className="font-bold text-xl hidden sm:inline text-slate-900 dark:text-white">
              IITM BS
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/courses" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Courses
              </Link>
              <Link href="/quiz-prep" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Quiz Prep
              </Link>
              <Link href="/resources" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Resources
              </Link>
              <Link href="/tools" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Tools
              </Link>
              <Link href="/support" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Support
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/courses" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Courses
              </Link>
              <Link href="/quiz-prep" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Quiz Prep
              </Link>
              <Link href="/compiler" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Compiler
              </Link>
              <Link href="/resources" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Resources
              </Link>
              <Link href="/tools" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Tools
              </Link>
              <Link href="/support" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Support
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#3e3098] via-purple-600 to-green-500 p-[2px] hover:opacity-80 transition-opacity">
                      <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        )}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{user?.email}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-all rounded-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-slate-700 dark:text-slate-300" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in slide-in-from-top duration-300">
            {!isAuthenticated && (
              <>
                <Link href="/" className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Home
                </Link>
                <Link
                  href="/courses"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  Courses
                </Link>
                <Link
                  href="/quiz-prep"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  Quiz Prep
                </Link>
                <Link
                  href="/resources"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  Resources
                </Link>
                <Link
                  href="/tools"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  Tools
                </Link>
                <Link
                  href="/support"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  Support
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Dashboard
                </Link>
                <Link href="/dashboard/courses" className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Courses
                </Link>
                <Link href="/quiz-prep" className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Quiz Prep
                </Link>
                <Link href="/compiler" className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Compiler
                </Link>
                <Link href="/resources" className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Resources
                </Link>
                <Link href="/tools" className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Tools
                </Link>
                <Link href="/support" className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Support
                </Link>
                <Link href="/dashboard/profile" className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  Profile
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
