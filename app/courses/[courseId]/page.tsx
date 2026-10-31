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

  // Signed-in students see the same public page. Their classes live in the dashboard.
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
