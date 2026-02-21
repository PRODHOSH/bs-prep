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
                  className="bg-white border-gray-200 shadow-lg min-w-[240px] p-2 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300"
                  onMouseEnter={() => setToolsOpen(true)}
                  onMouseLeave={() => setToolsOpen(false)}
                >
                  <DropdownMenuItem asChild className="rounded-md py-3 px-4 hover:bg-[#fdf6ec] focus:bg-[#fdf6ec]">
                    <Link href="/tools/gpa-calculator" className="cursor-pointer text-base font-medium text-slate-700 hover:text-slate-700 focus:text-slate-700 flex items-center gap-2">GPA Calculator</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md py-3 px-4 hover:bg-[#fdf6ec] focus:bg-[#fdf6ec]">
                    <Link href="/tools/gpa-predictor" className="cursor-pointer text-base font-medium text-slate-700 hover:text-slate-700 focus:text-slate-700 flex items-center gap-2">GPA Predictor</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md py-3 px-4 hover:bg-[#fdf6ec] focus:bg-[#fdf6ec]">
                    <Link href="/tools/gpa-calculator" className="cursor-pointer text-base font-medium text-slate-700 hover:text-slate-700 focus:text-slate-700 flex items-center gap-2">CGPA Calculator</Link>
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
                  className="bg-white border-gray-200 shadow-lg min-w-[240px] p-2 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300"
                  onMouseEnter={() => setToolsOpen(true)}
                  onMouseLeave={() => setToolsOpen(false)}
                >
                  <DropdownMenuItem asChild className="rounded-md py-3 px-4 hover:bg-[#fdf6ec] focus:bg-[#fdf6ec]">
                    <Link href="/tools/gpa-calculator" className="cursor-pointer text-base font-medium text-slate-700 hover:text-slate-700 focus:text-slate-700 flex items-center gap-2">GPA Calculator</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md py-3 px-4 hover:bg-[#fdf6ec] focus:bg-[#fdf6ec]">
                    <Link href="/tools/gpa-predictor" className="cursor-pointer text-base font-medium text-slate-700 hover:text-slate-700 focus:text-slate-700 flex items-center gap-2">GPA Predictor</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md py-3 px-4 hover:bg-[#fdf6ec] focus:bg-[#fdf6ec]">
                    <Link href="/tools/gpa-calculator" className="cursor-pointer text-base font-medium text-slate-700 hover:text-slate-700 focus:text-slate-700 flex items-center gap-2">CGPA Calculator</Link>
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
                    <button className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                      <User className="w-5 h-5 text-slate-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 shadow-lg">
                    <div className="px-3 py-2 text-sm text-slate-600 truncate">{user?.email}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-[#fdf6ec] focus:bg-[#fdf6ec]" onClick={handleLogout}>
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
