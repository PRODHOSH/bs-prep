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
    thumbnail: "/courses/mathematics_for_datascience_1.jpeg",
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
    thumbnail: "/courses/statistics_for_datascience_1.jpeg",
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
    thumbnail: "/courses/ct.jpeg",
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
    thumbnail: "/courses/english_for_datascience_1.jpeg",
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
    thumbnail: "/courses/programming_in_python.jpeg",
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
    thumbnail: "/courses/programming_in_java.jpeg",
    syllabus: [
      { week: 1, title: "Java Basics", topics: "Syntax, Data types, Variables, Operators" },
      { week: 2, title: "Control Structures", topics: "Conditional statements, Loops, Switch cases" },
      { week: 3, title: "Object Oriented Programming", topics: "Classes, Objects, Methods, Constructors" },
      { week: 4, title: "Advanced OOP concepts", topics: "Inheritance, Polymorphism, Encapsulation, Abstraction" }
    ]
  },
  "qualifier-bundle": {
    title: "Qualifier Bundle (All 4 Courses)",
    level: "qualifier",
    price: 1799, originalPrice: 1999,
    description: "Master Math, Statistics, Computational Thinking, and English.",
    thumbnail: "/courses/qualifier_bundle_4_courses.jpeg",
    syllabus: [
      { isCourseHeader: true, title: "Mathematics for Data Science I" },
      { week: 1, title: "Set Theory - Number system, Sets and their operations", topics: "Relations and functions - Relations and their types, Functions and their types" },
      { week: 2, title: "Rectangular coordinate system, Straight Lines", topics: "Slope of a line, Parallel and perpendicular lines, Representations of a Line, General equations of a line, Straight-line fit" },
      { week: 3, title: "Quadratic Functions", topics: "Quadratic functions, Minima, maxima, vertex, and slope, Quadratic Equations" },
      { week: 4, title: "Algebra of Polynomials", topics: "Addition, subtraction, multiplication, and division, Algorithms, Graphs of Polynomials - X-intercepts, multiplicities, end behavior, and turning points, Graphing & polynomial creation" },
      { isCourseHeader: true, title: "Statistics for Data Science I" },
      { week: 1, title: "Introduction and type of data", topics: "Types of data, Descriptive and Inferential statistics, Scales of measurement" },
      { week: 2, title: "Describing categorical data", topics: "Frequency distribution of categorical data, Best practices for graphing categorical data, Mode and median for categorical variable" },
      { week: 3, title: "Describing numerical data", topics: "Frequency tables for numerical data, Measures of central tendency - Mean, median and mode, Quartiles and percentiles, Measures of dispersion - Range, variance, standard deviation and IQR, Five number summary" },
      { week: 4, title: "Association between two variables", topics: "Association between two categorical variables - Using relative frequencies in contingency tables, Association between two numerical variables - Scatterplot, covariance, Pearson correlation coefficient, Point bi-serial correlation coefficient" },
      { isCourseHeader: true, title: "Computational Thinking" },
      { week: 1, title: "Variables, Initialization, Iterators, Filtering", topics: "Datatypes, Flowcharts, Sanity of data" },
      { week: 2, title: "Iteration, Filtering, Selection", topics: "Pseudocode, Finding max and min, AND operator" },
      { week: 3, title: "Multiple iterations (non-nested)", topics: "Three prizes problem, Procedures, Parameters, Side effects, OR operator" },
      { week: 4, title: "Nested iterations", topics: "Birthday paradox, Binning" },
      { isCourseHeader: true, title: "English I" },
      { week: 1, title: "Sounds and Words", topics: "Vowel and consonant sounds" },
      { week: 2, title: "Parts of Speech", topics: "Nouns, pronouns, verbs, adjectives, adverbs and usage" },
      { week: 3, title: "Sentences", topics: "Phrases and idioms" },
      { week: 4, title: "Speaking Skills", topics: "Spoken English preliminaries" }
    ]
  },
  "coding-bundle": {
    title: "Coding Bundle (Python + Java)",
    level: "qualifier",
    price: 999, originalPrice: 1199,
    description: "Master both Python and Java programming languages.",
    thumbnail: "/courses/python.png",
    syllabus: [
      { isCourseHeader: true, title: "Programming in Python" },
      { week: 1, title: "Introduction to Python", topics: "Variables, Data Types, Input/Output, Operators" },
      { week: 2, title: "Control Flow", topics: "If-Else statements, For loops, While loops" },
      { week: 3, title: "Data Structures", topics: "Lists, Tuples, Dictionaries, Sets" },
      { week: 4, title: "Functions and Modules", topics: "Defining functions, scope, importing modules" },
      { isCourseHeader: true, title: "Programming in Java" },
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
      <div className="min-h-screen bg-transparent">
        <Navbar isAuthenticated={isAuthenticated} />

        {/* Hero Section */}
        <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#0a192f]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            <Link
              href={isAuthenticated ? "/dashboard/courses" : "/courses"}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors mb-12"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO CATALOG
            </Link>

            <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white border border-white/10 shadow-sm">
                    {course.level}
                  </span>
                  <span className="inline-flex rounded-full bg-[#fb923c]/20 border border-[#fb923c]/30 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#fb923c] shadow-sm">
                    TAMIL MEDIUM
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 uppercase">
                  {course.title}
                </h1>
                <p className="text-white/70 text-lg font-bold uppercase max-w-2xl leading-relaxed mb-10">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-8 mb-12">
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Duration</p>
                      <p className="text-sm font-bold uppercase">{courseId.includes('bundle') ? 'Varies' : '4 WEEKS'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Schedule</p>
                      <p className="text-sm font-bold uppercase">SELF-PACED + LIVE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/20">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#10b981]/70 mb-0.5">Outcome</p>
                      <p className="text-sm font-bold uppercase text-[#10b981]">CERTIFICATE</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex-1">
                    {course.originalPrice && (
                      <p className="text-sm font-bold text-white/40 line-through mb-1">₹{course.originalPrice}</p>
                    )}
                    <div className="flex items-end gap-3">
                      <p className="text-4xl md:text-5xl font-black text-white leading-none">₹{course.price}</p>
                      {course.originalPrice && (
                        <span className="text-[10px] font-black text-[#0a192f] bg-white rounded-full px-2 py-0.5 uppercase tracking-wider mb-1.5 shadow-sm">
                          SAVE ₹{course.originalPrice - course.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleEnroll}
                    className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#0a192f] px-10 h-14 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-xl hover:-translate-y-1"
                  >
                    ENROLL NOW
                  </Button>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="hidden lg:block w-[400px] shrink-0">
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-transparent opacity-60 z-10" />
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover relative z-0"
                  />
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full inline-block mb-3 border border-white/10">
                      IITM BS PROGRAM
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase leading-[1.1]">{course.title}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section (Syllabus) */}
        <div className="bg-[#f8fafc] py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-[#0a192f] uppercase tracking-tight mb-4">
                COURSE SYLLABUS
              </h2>
              <p className="text-slate-500 font-bold uppercase text-sm">
                Comprehensive curriculum aligned with IIT Madras BS Degree
              </p>
            </div>

            <div className="space-y-5">
              {course.syllabus.map((item: any, i: number) => {
                if (item.isCourseHeader) {
                  return (
                    <div key={`header-${i}`} className={`flex items-center gap-4 ${i !== 0 ? 'mt-14' : ''} mb-8`}>
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <h3 className="font-black text-[#0a192f] text-lg uppercase tracking-widest px-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        {item.title}
                      </h3>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                  )
                }
                return (
                  <div key={`week-${i}`} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                    <div className="shrink-0 flex items-center justify-center h-10 min-w-[100px] rounded-xl bg-slate-50 text-slate-500 border border-slate-100 text-xs font-black uppercase tracking-widest group-hover:bg-[#0a192f] group-hover:text-white group-hover:border-[#0a192f] transition-colors">
                      WEEK {item.week}
                    </div>
                    <div className="flex-1 mt-1 sm:mt-0">
                      <p className="text-lg font-black text-[#0a192f] uppercase leading-tight mb-2">{item.title}</p>
                      <p className="text-sm font-semibold text-slate-500 leading-relaxed">{item.topics}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-24 bg-white rounded-3xl p-10 sm:p-16 text-center shadow-xl shadow-slate-200/50 border border-slate-200/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#0a192f]"></div>
              <h3 className="text-3xl font-black text-[#0a192f] uppercase tracking-tight mb-4">
                READY TO START LEARNING?
              </h3>
              <p className="text-slate-500 font-bold uppercase text-sm mb-10 max-w-xl mx-auto">
                Join hundreds of Tamil medium students mastering {course.title} and securing their foundation in Data Science.
              </p>
              <Button
                onClick={handleEnroll}
                className="bg-[#0a192f] hover:bg-blue-900 text-white px-12 h-14 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-md hover:-translate-y-1"
              >
                ENROLL FOR ₹{course.price}
                {course.originalPrice && (
                  <span className="text-[10px] font-bold text-white/60 line-through ml-2">₹{course.originalPrice}</span>
                )}
              </Button>
            </div>
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
