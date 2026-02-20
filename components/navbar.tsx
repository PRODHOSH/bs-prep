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
import { Bell, User, Menu, X, ChevronDown } from "lucide-react"
import { LoginModal } from "@/components/auth/login-modal"
import { SignUpModal } from "@/components/auth/signup-modal"
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal"

interface NavbarProps {
  isAuthenticated?: boolean
  userRole?: string
}

export function Navbar({ isAuthenticated = false, userRole = "student" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profilePhoto, setProfilePhoto] = useState<string>('')
  const [scrolled, setScrolled] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
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
      className={`sticky top-0 z-50 bg-[#FEF9E7]/95 backdrop-blur-lg transition-all duration-300 ${
        scrolled ? "border-b border-[#E5DBC8] shadow-sm" : "border-b border-[#F0E9D8]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 flex-shrink-0 group">
            <img 
              src="/logo.jpeg" 
              alt="BSPrep Logo" 
              className="w-11 h-11 rounded-full object-cover group-hover:opacity-80 transition-opacity"
            />
            <span className="font-bold text-2xl hidden sm:inline text-black">
              BSPrep
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Home
              </Link>
              <Link href="/courses" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Courses
              </Link>
              <Link href="/quiz-prep" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Quiz Prep
              </Link>
              <Link href="/resources" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Resources
              </Link>
              <DropdownMenu open={toolsOpen} onOpenChange={setToolsOpen}>
                <DropdownMenuTrigger 
                  className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 flex items-center gap-1"
                  onMouseEnter={() => setToolsOpen(true)}
                  onMouseLeave={() => setToolsOpen(false)}
                  suppressHydrationWarning
                >
                  Tools
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${toolsOpen ? 'rotate-180' : ''}`} />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-black/95 backdrop-blur-md border-slate-700 shadow-2xl min-w-[240px] p-2 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300"
                  onMouseEnter={() => setToolsOpen(true)}
                  onMouseLeave={() => setToolsOpen(false)}
                >
                  <DropdownMenuItem asChild className="hover:bg-gradient-to-r hover:from-purple-900/50 hover:to-purple-800/50 focus:bg-gradient-to-r focus:from-purple-900/50 focus:to-purple-800/50 rounded-md transition-all duration-200 py-3 px-4">
                    <Link href="/tools/gpa-calculator" className="cursor-pointer text-base font-medium text-slate-200 hover:text-white hover:translate-x-1 transition-transform duration-200 flex items-center gap-2">GPA Calculator</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-gradient-to-r hover:from-purple-900/50 hover:to-purple-800/50 focus:bg-gradient-to-r focus:from-purple-900/50 focus:to-purple-800/50 rounded-md transition-all duration-200 py-3 px-4">
                    <Link href="/tools/gpa-predictor" className="cursor-pointer text-base font-medium text-slate-200 hover:text-white hover:translate-x-1 transition-transform duration-200 flex items-center gap-2">GPA Predictor</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-gradient-to-r hover:from-purple-900/50 hover:to-purple-800/50 focus:bg-gradient-to-r focus:from-purple-900/50 focus:to-purple-800/50 rounded-md transition-all duration-200 py-3 px-4">
                    <Link href="/tools/gpa-calculator" className="cursor-pointer text-base font-medium text-slate-200 hover:text-white hover:translate-x-1 transition-transform duration-200 flex items-center gap-2">CGPA Calculator</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/support" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Support
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/courses" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Courses
              </Link>
              <Link href="/quiz-prep" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Quiz Prep
              </Link>
              <Link href="/compiler" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Compiler
              </Link>
              <Link href="/resources" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Resources
              </Link>
              <DropdownMenu open={toolsOpen} onOpenChange={setToolsOpen}>
                <DropdownMenuTrigger 
                  className="text-base font-medium text-slate-700 hover:text-black transition-all duration-300 flex items-center gap-1"
                  onMouseEnter={() => setToolsOpen(true)}
                  onMouseLeave={() => setToolsOpen(false)}
                  suppressHydrationWarning
                >
                  Tools
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${toolsOpen ? 'rotate-180' : ''}`} />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-white border-slate-200 shadow-lg min-w-[240px] p-2 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300"
                  onMouseEnter={() => setToolsOpen(true)}
                  onMouseLeave={() => setToolsOpen(false)}
                >
                  <DropdownMenuItem asChild className="hover:bg-slate-50 focus:bg-slate-50 rounded-md transition-all duration-200 py-3 px-4">
                    <Link href="/tools/gpa-calculator" className="cursor-pointer text-base font-medium text-slate-700 hover:text-black hover:translate-x-1 transition-transform duration-200 flex items-center gap-2">GPA Calculator</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-slate-50 focus:bg-slate-50 rounded-md transition-all duration-200 py-3 px-4">
                    <Link href="/tools/gpa-predictor" className="cursor-pointer text-base font-medium text-slate-700 hover:text-black hover:translate-x-1 transition-transform duration-200 flex items-center gap-2">GPA Predictor</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-slate-50 focus:bg-slate-50 rounded-md transition-all duration-200 py-3 px-4">
                    <Link href="/tools/gpa-calculator" className="cursor-pointer text-base font-medium text-slate-700 hover:text-black hover:translate-x-1 transition-transform duration-200 flex items-center gap-2">CGPA Calculator</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/support" className="text-base font-medium text-slate-700 hover:text-black transition-colors">
                Support
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button className="relative p-2 text-slate-600 hover:text-black transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#3e3098] via-purple-600 to-green-500 p-[2px] hover:opacity-80 transition-opacity">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium text-slate-700">{user?.email}</div>
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
                <Button 
                  variant="outline" 
                  className="hidden sm:block border-slate-300 text-black hover:bg-slate-100 transition-all rounded-full"
                  onClick={() => setLoginOpen(true)}
                  suppressHydrationWarning
                >
                  Login
                </Button>
                <Button 
                  className="bg-black hover:bg-slate-800 text-white transition-all rounded-full"
                  onClick={() => setSignUpOpen(true)}
                  suppressHydrationWarning
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-slate-700" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in slide-in-from-top duration-300">
            {!isAuthenticated && (
              <>
                <Link href="/" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  Home
                </Link>
                <Link
                  href="/courses"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all"
                >
                  Courses
                </Link>
                <Link
                  href="/quiz-prep"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all"
                >
                  Quiz Prep
                </Link>
                <Link
                  href="/resources"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all"
                >
                  Resources
                </Link>
                <div className="px-4 py-2 text-sm font-semibold text-slate-500">
                  Tools
                </div>
                <Link
                  href="/tools/gpa-calculator"
                  className="block px-6 py-2 text-sm text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all"
                >
                  GPA Calculator
                </Link>
                <Link
                  href="/tools/gpa-predictor"
                  className="block px-6 py-2 text-sm text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all"
                >
                  GPA Predictor
                </Link>
                <Link
                  href="/tools/gpa-calculator"
                  className="block px-6 py-2 text-sm text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all"
                >
                  CGPA Calculator
                </Link>
                <Link
                  href="/support"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all"
                >
                  Support
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  Dashboard
                </Link>
                <Link href="/dashboard/courses" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  Courses
                </Link>
                <Link href="/quiz-prep" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  Quiz Prep
                </Link>
                <Link href="/compiler" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  Compiler
                </Link>
                <Link href="/resources" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  Resources
                </Link>
                <div className="px-4 py-2 text-sm font-semibold text-slate-500">
                  Tools
                </div>
                <Link href="/tools/gpa-calculator" className="block px-6 py-2 text-sm text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  GPA Calculator
                </Link>
                <Link href="/tools/gpa-predictor" className="block px-6 py-2 text-sm text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  GPA Predictor
                </Link>
                <Link href="/tools/gpa-calculator" className="block px-6 py-2 text-sm text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  CGPA Calculator
                </Link>
                <Link href="/support" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  Support
                </Link>
                <Link href="/dashboard/profile" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                  Profile
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Auth Modals */}
      <LoginModal 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onSwitchToSignUp={() => {
          setLoginOpen(false)
          setSignUpOpen(true)
        }}
        onSwitchToForgotPassword={() => {
          setLoginOpen(false)
          setForgotPasswordOpen(true)
        }}
      />
      <SignUpModal 
        open={signUpOpen} 
        onOpenChange={setSignUpOpen}
        onSwitchToLogin={() => {
          setSignUpOpen(false)
          setLoginOpen(true)
        }}
      />
      <ForgotPasswordModal 
        open={forgotPasswordOpen} 
        onOpenChange={setForgotPasswordOpen}
        onSwitchToLogin={() => {
          setForgotPasswordOpen(false)
          setLoginOpen(true)
        }}
      />
    </nav>
  )
}
