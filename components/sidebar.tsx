"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Bell, User, Menu, X, ChevronDown, Settings, LogOut, LayoutDashboard, BookOpen, PenTool, Code, Library, MessageCircleQuestion, Calculator, LineChart } from "lucide-react"

const LoginModal = dynamic(
  () => import("@/components/auth/login-modal").then((m) => ({ default: m.LoginModal })),
  { ssr: false }
)
const SignUpModal = dynamic(
  () => import("@/components/auth/signup-modal").then((m) => ({ default: m.SignUpModal })),
  { ssr: false }
)
const ForgotPasswordModal = dynamic(
  () => import("@/components/auth/forgot-password-modal").then((m) => ({ default: m.ForgotPasswordModal })),
  { ssr: false }
)

const SIDEBAR_LINKS = [
  { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
  { name: "COURSES", href: "/dashboard/courses", icon: BookOpen },
  { name: "QUIZ PREP", href: "/dashboard/quiz-prep", icon: PenTool },
  { name: "COMPILER", href: "/compiler", icon: Code },
  { name: "RESOURCES", href: "/dashboard/resources", icon: Library },
  { name: "DOUBTS", href: "/dashboard/doubts", icon: MessageCircleQuestion },
]

const TOOLS_LINKS = [
  { name: "GPA CALCULATOR", href: "/dashboard/tools/gpa-calculator", icon: Calculator },
  { name: "GPA PREDICTOR", href: "/dashboard/tools/gpa-predictor", icon: LineChart },
]

export function Sidebar({ isAuthenticated = false, userRole = "student" }: { isAuthenticated?: boolean, userRole?: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [doubtNotifications, setDoubtNotifications] = useState<any[]>([])
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [seenAnnouncementIds, setSeenAnnouncementIds] = useState<string[]>([])
  const [seenDoubtIds, setSeenDoubtIds] = useState<string[]>([])
  const [expandedNotificationIds, setExpandedNotificationIds] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  const getGoogleAvatarUrl = (currentUser: any): string | null => {
    if (!currentUser) return null
    const provider = currentUser?.app_metadata?.provider || currentUser?.app_metadata?.providers?.[0]
    if (provider !== 'google') return null
    return currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture || null
  }

  const googleAvatarUrl = getGoogleAvatarUrl(user)
  const notifId = (cls: any) => `${cls.course}-${cls.date}-${cls.time}`
  const announcementNotifId = (a: any) => `announcement-${a.id}`
  const doubtNotifId = (item: any) => `doubt-${item.doubt_id}`

  const toggleNotificationExpand = (id: string) => {
    setExpandedNotificationIds((current) => (
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    ))
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchNotifications = async () => {
      try {
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user?.id)

        if (enrollError) throw enrollError

        const enrolledCourseIds = enrollments.map(e => e.course_id)

        if (enrolledCourseIds.length > 0) {
          const { data: classesData, error: classesError } = await supabase
            .from('live_classes')
            .select('*')
            .in('course', enrolledCourseIds)
            .gte('date', new Date().toISOString().split('T')[0])
            .order('date', { ascending: true })

          if (!classesError && classesData) {
            setUpcomingClasses(classesData)
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard header data:', err)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  const handleNotifOpen = (open: boolean) => {
    setNotifOpen(open)
    if (open) {
      setSeenIds(upcomingClasses.map(c => notifId(c)))
      setSeenAnnouncementIds(announcements.map(a => announcementNotifId(a)))
      setSeenDoubtIds(doubtNotifications.map(d => doubtNotifId(d)))
    }
  }

  const unreadCount = 
    upcomingClasses.filter(c => !seenIds.includes(notifId(c))).length +
    announcements.filter(a => !seenAnnouncementIds.includes(announcementNotifId(a))).length +
    doubtNotifications.filter(d => !seenDoubtIds.includes(doubtNotifId(d))).length

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#FDFBF7] border-r border-black/10 min-h-screen sticky top-0 z-50">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-1 shrink-0 group">
          <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
            <img
              src="/new-logo.jpeg"
              alt="BSPrep Logo"
              className="w-full h-full object-cover object-center scale-[1.6] group-hover:opacity-80 transition-opacity"
            />
          </div>
          <span className="font-black text-2xl tracking-tighter text-black">
            BSPREP
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 custom-scrollbar">
        <div className="space-y-1">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
            const Icon = link.icon
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                  isActive
                    ? "bg-black/5 text-black"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-black/40"}`} />
                {link.name}
              </Link>
            )
          })}
        </div>

        <div className="mt-8">
          <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-black/30">
            TOOLS
          </p>
          <div className="space-y-1">
            {TOOLS_LINKS.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                    isActive
                      ? "bg-black/5 text-black"
                      : "text-black/60 hover:text-black hover:bg-black/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-black/40"}`} />
                  {link.name}
                </Link>
              )
            })}
          </div>
        </div>
      
      {isAuthenticated && (
        <div className="mt-8 pb-4">
          <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-black/30">
            ACCOUNT
          </p>
          <div className="space-y-1">
            <Link
              href="/dashboard/notifications"
              className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors text-black/60 hover:text-black hover:bg-black/5"
            >
              <Bell className="w-4 h-4 text-black/40" />
              NOTIFICATIONS
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors text-black/60 hover:text-black hover:bg-black/5"
            >
              <Settings className="w-4 h-4 text-black/40" />
              SETTINGS
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors text-red-600/70 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 text-red-600/40" />
              LOGOUT
            </button>
          </div>
        </div>
      )}
      </nav>

      {isAuthenticated ? (
        <div className="p-4 border-t border-black/10 mt-auto">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full border border-black/10 bg-black/5 overflow-hidden shrink-0 flex items-center justify-center">
              {googleAvatarUrl ? (
                <img
                  src={googleAvatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5 text-black" />
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-black truncate">{user?.email}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-black/10 mt-auto">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full border border-black/10 bg-white text-black hover:bg-black/5 text-xs font-bold transition-all rounded-full h-10 shadow-sm"
              onClick={() => setLoginOpen(true)}
              suppressHydrationWarning
            >
              LOGIN
            </Button>
            <Button
              className="w-full bg-[#0a192f] hover:bg-[#112a52] text-white text-xs font-bold transition-all rounded-full h-10 shadow-md"
              onClick={() => setSignUpOpen(true)}
              suppressHydrationWarning
            >
              SIGN UP
            </Button>
          </div>
        </div>
      )}

      {/* Auth Modals and Dropdown Data for Notifs overlay */}
      

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
    </aside>
  )
}
