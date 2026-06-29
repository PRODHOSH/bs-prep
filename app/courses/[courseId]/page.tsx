"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Award, BookOpen, Calendar, FileText, Video, Search, X, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { LiveClassCard } from "@/components/live-class-card"

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

const courseSyllabusData: Record<string, any> = {
  "qualifier-math-1": {
    title: "Mathematics for Data Science I",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Fundamental mathematics concepts for data science",
    thumbnail: "/courses/math.png",
    syllabus: [
      { week: 1, title: "Set Theory - Number system, Sets and their operations", topics: "Relations and functions - Relations and their types, Functions and their types" },
      { week: 2, title: "Rectangular coordinate system, Straight Lines", topics: "Slope of a line, Parallel and perpendicular lines, Representations of a Line, General equations of a line, Straight-line fit" },
      { week: 3, title: "Quadratic Functions", topics: "Quadratic functions, Minima, maxima, vertex, and slope, Quadratic Equations" },
      { week: 4, title: "Algebra of Polynomials", topics: "Addition, subtraction, multiplication, and division, Algorithms, Graphs of Polynomials - X-intercepts, multiplicities, end behavior, and turning points, Graphing & polynomial creation" }
    ]
  },
  "qualifier-stats-1": {
    title: "Statistics for Data Science I",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Introduction to statistical thinking and analysis",
    thumbnail: "/courses/stats.png",
    syllabus: [
      { week: 1, title: "Introduction and type of data", topics: "Types of data, Descriptive and Inferential statistics, Scales of measurement" },
      { week: 2, title: "Describing categorical data", topics: "Frequency distribution of categorical data, Best practices for graphing categorical data, Mode and median for categorical variable" },
      { week: 3, title: "Describing numerical data", topics: "Frequency tables for numerical data, Measures of central tendency - Mean, median and mode, Quartiles and percentiles, Measures of dispersion - Range, variance, standard deviation and IQR, Five number summary" },
      { week: 4, title: "Association between two variables", topics: "Association between two categorical variables - Using relative frequencies in contingency tables, Association between two numerical variables - Scatterplot, covariance, Pearson correlation coefficient, Point bi-serial correlation coefficient" }
    ]
  },
  "qualifier-computational-thinking": {
    title: "Computational Thinking",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Problem-solving and algorithmic thinking fundamentals",
    thumbnail: "/courses/ct.png",
    syllabus: [
      { week: 1, title: "Variables, Initialization, Iterators, Filtering", topics: "Datatypes, Flowcharts, Sanity of data" },
      { week: 2, title: "Iteration, Filtering, Selection", topics: "Pseudocode, Finding max and min, AND operator" },
      { week: 3, title: "Multiple iterations (non-nested)", topics: "Three prizes problem, Procedures, Parameters, Side effects, OR operator" },
      { week: 4, title: "Nested iterations", topics: "Birthday paradox, Binning" }
    ]
  },
  "qualifier-english-1": {
    title: "English I",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Build core spoken and written English skills for IITM BS.",
    thumbnail: "/courses/english.png",
    syllabus: [
      { week: 1, title: "Sounds and Words", topics: "Vowel and consonant sounds" },
      { week: 2, title: "Parts of Speech", topics: "Nouns, pronouns, verbs, adjectives, adverbs and usage" },
      { week: 3, title: "Sentences", topics: "Phrases and idioms" },
      { week: 4, title: "Speaking Skills", topics: "Spoken English preliminaries" }
    ]
  },
  "qualifier-python": {
    title: "Programming in Python",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Learn Python from scratch and build real-world applications.",
    thumbnail: "/courses/python.png",
    syllabus: [
      { week: 1, title: "Introduction to Python", topics: "Variables, Data Types, Input/Output, Operators" },
      { week: 2, title: "Control Flow", topics: "If-Else statements, For loops, While loops" },
      { week: 3, title: "Data Structures", topics: "Lists, Tuples, Dictionaries, Sets" },
      { week: 4, title: "Functions and Modules", topics: "Defining functions, scope, importing modules" }
    ]
  },
  "qualifier-java": {
    title: "Programming in Java",
    level: "qualifier",
    price: 499, originalPrice: 599,
    description: "Master Object Oriented Programming principles with Java.",
    thumbnail: "/courses/java.png",
    syllabus: [
      { week: 1, title: "Java Basics", topics: "Syntax, Data types, Variables, Operators" },
      { week: 2, title: "Control Structures", topics: "Conditional statements, Loops, Switch cases" },
      { week: 3, title: "Object Oriented Programming", topics: "Classes, Objects, Methods, Constructors" },
      { week: 4, title: "Advanced OOP concepts", topics: "Inheritance, Polymorphism, Encapsulation, Abstraction" }
    ]
  }
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
          'foundation-programming-python': 'python'
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
                      {course.syllabus.map((week: any) => (
                        <div key={week.week} className="flex gap-4 py-4">
                          <span className="shrink-0 inline-flex h-7 items-center rounded-full bg-[#111111] text-white text-xs font-semibold px-3">
                            Week {week.week}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#111111] mb-1">{week.title}</p>
                            <p className="text-sm text-[#374151] leading-relaxed">{week.topics}</p>
                          </div>
                        </div>
                      ))}
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
      <div className="min-h-screen bg-white">
        <Navbar isAuthenticated={isAuthenticated} />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-28 pb-24">
          <Link
            href={isAuthenticated ? "/dashboard/courses" : "/courses"}
            className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#111111] transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          {/* Course hero card */}
          <div className="bg-[#f5f5f5] rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex rounded-full bg-white border border-[#e5e7eb] px-3 py-1 text-xs font-semibold text-[#374151]">
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </span>
                  <span className="inline-flex rounded-full bg-[#fff7ed] border border-[#fb923c]/30 px-3 py-1 text-xs font-semibold text-[#fb923c]">
                    Tamil
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-semibold text-[#111111] tracking-[-1px] leading-[1.1] mb-3">
                  {course.title}
                </h1>
                <p className="text-[#374151] text-base mb-6">{course.description}</p>

                <div className="flex items-center gap-5 text-sm text-[#6b7280] mb-8">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    4 weeks
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Self-paced
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    Certificate included
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div>
                    {course.originalPrice && (
                      <p className="text-sm text-[#6b7280] line-through">₹{course.originalPrice}</p>
                    )}
                    <p className="text-3xl font-semibold text-[#111111] tracking-[-0.5px] leading-none">₹{course.price}</p>
                  </div>
                  <Button
                    onClick={handleEnroll}
                    className="bg-[#111111] hover:bg-[#242424] text-white px-8 h-12 text-sm font-semibold rounded-lg transition-colors"
                  >
                    Enroll Now
                  </Button>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="hidden md:block shrink-0">
                <div className="w-72 h-44 bg-white rounded-2xl overflow-hidden border border-[#e5e7eb]">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Syllabus */}
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[#111111] tracking-[-0.5px]">Course Syllabus</h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e7eb] divide-y divide-[#e5e7eb]">
            {course.syllabus.map((week: any) => (
              <div key={week.week} className="flex gap-5 p-6">
                <span className="shrink-0 inline-flex h-7 items-center rounded-full bg-[#111111] text-white text-xs font-semibold px-3 mt-0.5">
                  Week {week.week}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#111111] mb-1">{week.title}</p>
                  <p className="text-sm text-[#374151] leading-relaxed">{week.topics}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="bg-[#111111] rounded-2xl p-8 text-center mt-8">
            <h3 className="text-2xl font-semibold text-white tracking-[-0.5px] mb-2">Ready to start learning?</h3>
            <p className="text-white/60 text-sm mb-6">
              Join students mastering {course.title}
            </p>
            <Button
              onClick={handleEnroll}
              className="bg-white hover:bg-[#f5f5f5] text-[#111111] px-10 h-12 text-sm font-semibold rounded-lg transition-colors"
            >
              Enroll for ₹{course.price}{" "}
              <span className="text-xs font-normal opacity-50 line-through ml-1">₹{course.originalPrice}</span>
            </Button>
          </div>
        </div>

        <Footer />
      </div>

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
