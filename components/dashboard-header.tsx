"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
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
import { Bell, User, Menu, X, ChevronDown, Settings } from "lucide-react"

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

interface NavbarProps {
  isAuthenticated?: boolean
  userRole?: string
}

export function DashboardHeader({ isAuthenticated = false, userRole = "student" }: NavbarProps) {
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

  // Build a stable ID for a class notification
  const notifId = (cls: any) => `${cls.course}-${cls.date}-${cls.time}`
  const announcementNotifId = (a: any) => `announcement-${a.id}`
  const doubtNotifId = (item: any) => `doubt-${item.doubt_id}`

  const toggleNotificationExpand = (id: string) => {
    setExpandedNotificationIds((current) => (
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    ))
  }

  const renderNotificationMessage = (id: string, message: string, clampClassName: string) => {
    if (!message) {
      return null
    }

    const isExpanded = expandedNotificationIds.includes(id)
    const needsExpand = message.length > 130

    return (
      <>
        <p className={`text-xs text-gray-600 mt-0.5 ${!isExpanded ? clampClassName : 'whitespace-pre-wrap'}`}>{message}</p>
        {needsExpand ? (
          <button
            type="button"
            onClick={() => toggleNotificationExpand(id)}
            className="mt-1 text-[11px] font-semibold text-blue-700 hover:underline"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        ) : null}
      </>
    )
  }

  // Load seen IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bsprep_seen_notifs')
      if (stored) setSeenIds(JSON.parse(stored))
      const storedAnnouncements = localStorage.getItem('bsprep_seen_announcements')
      if (storedAnnouncements) setSeenAnnouncementIds(JSON.parse(storedAnnouncements))
      const storedDoubts = localStorage.getItem('bsprep_seen_doubt_replies')
      if (storedDoubts) setSeenDoubtIds(JSON.parse(storedDoubts))
    } catch { }
  }, [])

  // Fetch upcoming classes when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    const load = async () => {
      try {
        const res = await fetch('/api/live-classes')
        if (!res.ok) return
        const data = await res.json()
        const now = Date.now()
        const upcoming = (data.classes || []).filter((cls: any) => {
          try {
            const [h, m] = (cls.time || '0:0').split(':').map(Number)
            const d = new Date(cls.date)
            d.setHours(h, m, 0, 0)
            return d.getTime() + 60 * 60 * 1000 > now
          } catch { return true }
        })
        setUpcomingClasses(upcoming)
      } catch { }
    }
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || userRole === 'admin') return

    const loadDoubtNotifications = async () => {
      try {
        const res = await fetch('/api/doubts/notifications')
        if (!res.ok) return
        const data = await res.json()
        setDoubtNotifications(Array.isArray(data.notifications) ? data.notifications : [])
      } catch { }
    }

    loadDoubtNotifications()
    const interval = setInterval(loadDoubtNotifications, 60_000)
    return () => clearInterval(interval)
  }, [isAuthenticated, userRole])

  // Fetch announcements for notification dropdown
  useEffect(() => {
    if (!isAuthenticated) return
    const loadAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements')
        if (!res.ok) return
        const data = await res.json()
        setAnnouncements(Array.isArray(data) ? data : [])
      } catch { }
    }

    loadAnnouncements()
    const interval = setInterval(loadAnnouncements, 60_000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const unreadClassCount = upcomingClasses.filter(cls => !seenIds.includes(notifId(cls))).length
  const unreadAnnouncementCount = announcements.filter(a => !seenAnnouncementIds.includes(announcementNotifId(a))).length
  const unreadDoubtCount = doubtNotifications.filter((item) => !seenDoubtIds.includes(doubtNotifId(item))).length
  const unreadCount = unreadClassCount + unreadAnnouncementCount + unreadDoubtCount

  const markAllSeen = () => {
    const classIds = upcomingClasses.map(notifId)
    const mergedClassIds = Array.from(new Set([...seenIds, ...classIds]))
    setSeenIds(mergedClassIds)

    const announcementIds = announcements.map(announcementNotifId)
    const mergedAnnouncementIds = Array.from(new Set([...seenAnnouncementIds, ...announcementIds]))
    setSeenAnnouncementIds(mergedAnnouncementIds)

    const doubtIds = doubtNotifications.map(doubtNotifId)
    const mergedDoubtIds = Array.from(new Set([...seenDoubtIds, ...doubtIds]))
    setSeenDoubtIds(mergedDoubtIds)

    try {
      localStorage.setItem('bsprep_seen_notifs', JSON.stringify(mergedClassIds))
      localStorage.setItem('bsprep_seen_announcements', JSON.stringify(mergedAnnouncementIds))
      localStorage.setItem('bsprep_seen_doubt_replies', JSON.stringify(mergedDoubtIds))
    } catch { }
  }

  const handleNotifOpen = (open: boolean) => {
    setNotifOpen(open)
    if (open) markAllSeen()
  }

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
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-black/10 font-semibold uppercase tracking-widest transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="md:hidden flex items-center gap-1 shrink-0 group">
            <div className="w-[68px] h-[68px] rounded-full overflow-hidden">
              <img
                src="/new-logo.jpeg"
                alt="BSPrep Logo"
                className="w-full h-full object-cover object-center scale-[1.6] group-hover:opacity-80 transition-opacity"
              />
            </div>
            <span className="font-black text-3xl tracking-tighter hidden sm:inline text-black">
              BSPREP
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <DropdownMenu open={notifOpen} onOpenChange={handleNotifOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="relative p-2 text-black hover:text-[#1e3a8a] transition-colors">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-none text-white text-[9px] font-bold flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-white border border-black/5 rounded-2xl shadow-xl p-0 overflow-hidden">
                    <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
                      <span className="font-bold text-black text-sm">NOTIFICATIONS</span>
                      {(upcomingClasses.length > 0 || announcements.length > 0 || doubtNotifications.length > 0) && (
                        <span className="text-xs text-black/50">{upcomingClasses.length + announcements.length + doubtNotifications.length} ITEMS</span>
                      )}
                    </div>
                    {upcomingClasses.length === 0 && announcements.length === 0 && doubtNotifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs font-bold text-black/40">
                        NO NOTIFICATIONS YET
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto divide-y-2 divide-black/10">
                        {doubtNotifications.slice(0, 4).map((item) => {
                          const id = doubtNotifId(item)
                          const isUnseen = !seenDoubtIds.includes(id)
                          const createdAt = item.created_at ? new Date(item.created_at) : null
                          return (
                            <div key={id} className={`px-4 py-3 flex items-start gap-3 ${isUnseen ? 'bg-[#1e3a8a]/10' : 'bg-white'}`}>
                              <div className={`mt-1 w-2 h-2 rounded-none shrink-0 ${isUnseen ? 'bg-[#1e3a8a]' : 'bg-black/20'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wide mb-0.5">DOUBT REPLY</p>
                                <p className="text-xs font-semibold text-black leading-snug">{item.subject}</p>
                                {renderNotificationMessage(id, item.message || '', 'line-clamp-2')}
                                {createdAt ? (
                                  <p className="text-[10px] text-black/50 mt-1">{createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                ) : null}
                                <Link
                                  href={`/dashboard/doubts?thread=${item.doubt_id}`}
                                  className="mt-1 inline-block text-[10px] font-bold text-[#1e3a8a] hover:underline"
                                  onClick={() => setNotifOpen(false)}
                                >
                                  OPEN THREAD
                                </Link>
                              </div>
                            </div>
                          )
                        })}

                        {doubtNotifications.length > 0 && (announcements.length > 0 || upcomingClasses.length > 0) && (
                          <div className="px-4 py-1 bg-black/5 text-[10px] font-bold uppercase tracking-wider text-black/50">
                            ANNOUNCEMENTS
                          </div>
                        )}

                        {announcements.slice(0, 3).map((announcement) => {
                          const id = announcementNotifId(announcement)
                          const isUnseen = !seenAnnouncementIds.includes(id)
                          const createdAt = announcement.created_at ? new Date(announcement.created_at) : null
                          return (
                            <div key={id} className={`px-4 py-3 flex items-start gap-3 ${isUnseen ? 'bg-[#1e3a8a]/10' : 'bg-white'}`}>
                              <div className={`mt-1 w-2 h-2 rounded-none shrink-0 ${isUnseen ? 'bg-[#1e3a8a]' : 'bg-black/20'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wide mb-0.5">ANNOUNCEMENT</p>
                                <p className="text-xs font-semibold text-black leading-snug">{announcement.title}</p>
                                {renderNotificationMessage(id, announcement.message || announcement.content || '', 'line-clamp-2')}
                                {createdAt ? (
                                  <p className="text-[10px] text-black/50 mt-1">{createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                ) : null}
                              </div>
                            </div>
                          )
                        })}

                        {announcements.length > 0 && upcomingClasses.length > 0 && (
                          <div className="px-4 py-1 bg-black/5 text-[10px] font-bold uppercase tracking-wider text-black/50">
                            LIVE CLASSES
                          </div>
                        )}

                        {upcomingClasses.map((cls, i) => {
                          const id = notifId(cls)
                          const isUnseen = !seenIds.includes(id)
                          const [h, min] = (cls.time || '0:0').split(':').map(Number)
                          const d = new Date(cls.date)
                          d.setHours(h, min, 0, 0)
                          const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                          const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
                          const courseNames: Record<string, string> = {
                            'ct': 'Computational Thinking',
                            'math-1': 'Mathematics I',
                            'stats-1': 'Statistics I',
                            'python': 'Programming in Python',
                            'math-2': 'Mathematics II',
                            'stats-2': 'Statistics II',
                            'doubts': 'Doubt Session',
                          }
                          const courseName = courseNames[cls.course?.toLowerCase()] ?? cls.course
                          return (
                            <div key={i} className={`px-4 py-3 flex items-start gap-3 ${isUnseen ? 'bg-[#1e3a8a]/10' : 'bg-white'}`}>
                              <div className={`mt-1 w-2 h-2 rounded-none shrink-0 ${isUnseen ? 'bg-[#1e3a8a]' : 'bg-black/20'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-black/50 uppercase tracking-wide mb-0.5">{courseName}</p>
                                <p className="text-xs font-semibold text-black leading-snug">{cls.topic}</p>
                                <p className="text-[10px] text-black/50 mt-1">{dateStr} &bull; {timeStr}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full border border-black/10 bg-white hover:bg-black/5 transition-colors overflow-hidden shadow-sm">
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
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border border-black/5 rounded-2xl shadow-xl p-2">
                    <div className="px-3 py-2 text-xs font-bold text-black/70 truncate">{user?.email}</div>
                    <DropdownMenuSeparator className="bg-black/10" />
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-black/5 focus:bg-black/5">
                      <Link href="/dashboard/settings" className="flex items-center gap-2 text-xs font-bold text-black">
                        <Settings className="w-4 h-4" />
                        SETTINGS
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-black/10" />
                    <DropdownMenuItem className="text-red-600 font-bold text-xs cursor-pointer rounded-xl hover:bg-red-50 focus:bg-red-50" onClick={handleLogout}>
                      LOGOUT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="hidden sm:flex border border-black/10 bg-white text-black hover:bg-black/5 text-xs font-bold transition-all rounded-full h-10 px-6 shadow-sm"
                  onClick={() => setLoginOpen(true)}
                  suppressHydrationWarning
                >
                  LOGIN
                </Button>
                <Button
                  className="bg-[#0a192f] hover:bg-[#112a52] text-white text-xs font-bold transition-all rounded-full h-10 px-6 shadow-md"
                  onClick={() => setSignUpOpen(true)}
                  suppressHydrationWarning
                >
                  SIGN UP
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
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs font-bold text-black/70 hover:text-black hover:bg-black/5 rounded-none transition-all">
              DASHBOARD
            </Link>
            <Link href="/dashboard/courses" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs font-bold text-black/70 hover:text-black hover:bg-black/5 rounded-none transition-all">
              COURSES
            </Link>
            <Link href="/quiz-prep" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs font-bold text-black/70 hover:text-black hover:bg-black/5 rounded-none transition-all">
              QUIZ PREP
            </Link>
            <Link href="/compiler" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs font-bold text-black/70 hover:text-black hover:bg-black/5 rounded-none transition-all">
              COMPILER
            </Link>
            <Link href="/resources" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs font-bold text-black/70 hover:text-black hover:bg-black/5 rounded-none transition-all">
              RESOURCES
            </Link>
            <Link href="/dashboard/doubts" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-xs font-bold text-black/70 hover:text-black hover:bg-black/5 rounded-none transition-all">
              DOUBTS
            </Link>
            <div className="px-4 py-2 text-[10px] font-bold text-black/40">
              TOOLS
            </div>
            <Link href="/tools/gpa-calculator" onClick={() => setIsOpen(false)} className="block px-6 py-2 text-xs font-bold text-black/70 hover:text-black hover:bg-black/5 rounded-none transition-all">
              GPA CALCULATOR
            </Link>
            <Link href="/tools/gpa-predictor" onClick={() => setIsOpen(false)} className="block px-6 py-2 text-xs font-bold text-black/70 hover:text-black hover:bg-black/5 rounded-none transition-all">
              GPA PREDICTOR
            </Link>
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
    </header>
  )
}
