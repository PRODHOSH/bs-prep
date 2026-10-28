"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Award, FileText, Video, Search, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { LiveClassCard } from "@/components/live-class-card"
import { courseSyllabusData } from "@/lib/syllabus-data"
import { ENROLLMENTS_CLOSED } from "@/lib/course-catalog"
import { CoursePublicView } from "@/components/courses/course-public-view"


const LoginModal = dynamic(
  () => import("@/components/auth/login-modal").then((m) => ({ default: m.LoginModal })),
  { ssr: false }
)
const SignUpModal = dynamic(
  () => import("@/components/auth/signup-modal").then((m) => ({ default: m.SignUpModal })),
  { ssr: false }
)

interface LiveClass {
  course: string
  topic: string
  meetingLink: string
  time: string
  date: string
  youtubeLink?: string
}



export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const course = courseSyllabusData[courseId]
  const supabase = createClient()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [certEnabled, setCertEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [previousSearch, setPreviousSearch] = useState("")

  useEffect(() => {
    checkAuthAndEnrollment()
  }, [])

  const checkAuthAndEnrollment = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)

    if (user) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      setIsEnrolled(!!enrollment)

      if (enrollment) {
        fetchClasses()
        const { data: cert } = await supabase
          .from("course_certificates")
          .select("enabled")
          .eq("course_id", courseId)
          .single()
        setCertEnabled(cert?.enabled ?? false)
      }
    }

    setLoading(false)
  }

  const fetchClasses = async () => {
    setLoadingClasses(true)
    try {
      const response = await fetch("/api/live-classes")
      if (response.ok) {
        const data = await response.json()
        const courseMap: { [key: string]: string } = {
          'qualifier-computational-thinking': 'ct',
          'qualifier-stats-1': 'stats-1',
          'qualifier-math-1': 'math-1',
          'foundation-programming-python': 'python',
          'qualifier-python': 'python',
          'qualifier-java': 'java',
          'qualifier-english-1': 'english-1',
          'foundation-stats-2': 'stats-2'
        }
        const courseCode = courseMap[courseId]
        const filteredClasses = (data.classes || []).filter(
          (cls: LiveClass) => cls.course.toLowerCase() === courseCode
        )
        setClasses(filteredClasses)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleEnroll = () => {
    if (ENROLLMENTS_CLOSED) return
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    router.push(`/payment/${courseId}`)
  }

  const isUpcoming = (dateStr: string, timeStr: string) => {
    try {
      const classDate = new Date(dateStr)
      const [hours, minutes] = timeStr.split(':').map(Number)
      classDate.setHours(hours, minutes, 0, 0)
      const diffMins = Math.floor((classDate.getTime() - Date.now()) / 60000)
      return diffMins > -60
    } catch {
      return false
    }
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="mx-auto max-w-3xl px-4 pt-32 text-center">
          <h1 className="text-2xl font-semibold text-[#111111] mb-4">Course Not Found</h1>
          <Link href="/courses">
            <Button className="bg-[#111111] hover:bg-[#242424] text-white rounded-lg h-10 text-sm font-semibold">
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ─── Enrolled View ───────────────────────────────────────────────────────────
  if (isEnrolled) {
    const upcomingClasses = classes.filter(cls => isUpcoming(cls.date, cls.time))
    const previousClasses = classes.filter(cls => !isUpcoming(cls.date, cls.time))
    const filteredPrevious = previousClasses.filter(cls =>
      !previousSearch.trim() || cls.topic.toLowerCase().includes(previousSearch.trim().toLowerCase())
    )

    return (
      <div className="min-h-screen bg-white">
        <Navbar isAuthenticated={isAuthenticated} />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 pb-24">
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#111111] transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          {/* Course header */}
          <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
            <div className="w-full md:w-72 h-44 bg-[#f5f5f5] rounded-2xl overflow-hidden border border-[#e5e7eb] shrink-0">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-semibold text-[#374151]">
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
                <span className="inline-flex rounded-full bg-[#f0fdf4] border border-[#10b981]/30 px-3 py-1 text-xs font-semibold text-[#10b981]">
                  Enrolled
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold text-[#111111] tracking-[-1px] leading-[1.1] mb-2">
                {course.title}
              </h1>
              <p className="text-[#374151] text-base mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-3">
                {certEnabled && (
                  <Button asChild className="bg-white border border-[#e5e7eb] text-[#111111] hover:bg-[#f5f5f5] px-5 h-10 rounded-lg text-sm font-semibold gap-2 transition-colors">
                    <a href={`/certificate/${courseId}`} target="_blank" rel="noopener noreferrer">
                      <Award className="w-4 h-4" />
                      Download Certificate
                    </a>
                  </Button>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#111111] hover:bg-[#242424] text-white px-5 h-10 rounded-lg text-sm font-semibold gap-2">
                      <FileText className="w-4 h-4" />
                      View Syllabus
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-[#e5e7eb] rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-[#111111] tracking-[-0.3px]">Course Syllabus — 4 Weeks</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-0 mt-4 divide-y divide-[#e5e7eb]">
                      {course.syllabus.map((item: any, i: number) => {
                        if (item.isCourseHeader) {
                          return (
                            <div key={`header-${i}`} className="bg-[#f9fafb] py-3 px-4 font-bold text-[#111111] text-sm uppercase tracking-wider">
                              {item.title}
                            </div>
                          )
                        }
                        return (
                          <div key={`week-${i}`} className="flex gap-4 py-4 px-4">
                            <span className="shrink-0 inline-flex h-7 items-center rounded-full bg-[#111111] text-white text-xs font-semibold px-3">
                              Week {item.week}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-[#111111] mb-1">{item.title}</p>
                              <p className="text-sm text-[#374151] leading-relaxed">{item.topics}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Classes */}
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-semibold text-[#111111] tracking-[-0.5px] mb-5">Upcoming Classes</h2>
              {loadingClasses ? (
                <div className="text-center py-8 text-[#6b7280] text-sm">Loading classes...</div>
              ) : upcomingClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-[#f5f5f5] rounded-xl text-center">
                  <Video className="w-10 h-10 text-[#e5e7eb] mb-3" />
                  <p className="text-sm text-[#6b7280]">No upcoming classes scheduled</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingClasses.map((cls, idx) => (
                    <LiveClassCard key={idx} course={cls.course} topic={cls.topic} meetingLink={cls.meetingLink} time={cls.time} date={cls.date} youtubeLink={cls.youtubeLink} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <h2 className="text-2xl font-semibold text-[#111111] tracking-[-0.5px]">Previous Classes</h2>
                {previousClasses.length > 0 && (
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by topic…"
                      value={previousSearch}
                      onChange={e => setPreviousSearch(e.target.value)}
                      className="w-full pl-9 pr-8 h-9 rounded-lg border border-[#e5e7eb] bg-white text-sm text-[#111111] placeholder:text-[#6b7280] focus:outline-none focus:border-[#111111] transition-colors"
                      suppressHydrationWarning
                    />
                    {previousSearch && (
                      <button onClick={() => setPreviousSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111111]">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {previousClasses.length === 0 ? (
                <div className="flex items-center justify-center py-10 bg-[#f5f5f5] rounded-xl text-sm text-[#6b7280]">
                  No previous classes
                </div>
              ) : filteredPrevious.length === 0 ? (
                <div className="flex flex-col items-center py-10 bg-[#f5f5f5] rounded-xl text-center text-sm text-[#6b7280]">
                  <p>No classes match "{previousSearch}"</p>
                  <button onClick={() => setPreviousSearch("")} className="mt-2 text-[#111111] underline underline-offset-2 text-sm">Clear search</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPrevious.map((cls, idx) => (
                    <LiveClassCard key={idx} course={cls.course} topic={cls.topic} meetingLink={cls.meetingLink} time={cls.time} date={cls.date} youtubeLink={cls.youtubeLink} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

  // ─── Non-enrolled (public) view ───────────────────────────────────────────────
  return (
    <>
      <CoursePublicView courseId={courseId} course={course} isAuthenticated={isAuthenticated} onEnroll={handleEnroll} />

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        onSwitchToSignUp={() => { setShowLogin(false); setShowSignup(true) }}
        onSwitchToForgotPassword={() => setShowLogin(false)}
      />
      <SignUpModal
        open={showSignup}
        onOpenChange={setShowSignup}
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true) }}
      />
    </>
  )
}
