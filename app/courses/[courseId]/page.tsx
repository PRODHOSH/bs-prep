"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Clock, CheckCircle2, Lock, Award } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

// Mock course data with videos
const courseData: Record<string, any> = {
  "qualifier-math-1": {
    title: "Mathematics for Data Science I",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Fundamental mathematics concepts for data science including vectors, matrices, and calculus",
    instructor: "IITM BS Faculty",
    thumbnail: "/courses/math.jpg",
    videos: [
      { week: 1, title: "Week 1 - Part 1", description: "Introduction to mathematical foundations", duration: "45:30", youtubeId: "21e6j8G-njE" },
      { week: 1, title: "Week 1 - Part 2", description: "Vectors and matrices basics", duration: "52:15", youtubeId: "vJvx_NtHrmA" },
      { week: 1, title: "Week 1 - Part 3", description: "Matrix operations", duration: "48:20", youtubeId: "0IUbec8P_ok" },
      { week: 2, title: "Week 2 - Part 1", description: "Linear transformations", duration: "50:10", youtubeId: "Yfn_BOY_0YI" },
      { week: 2, title: "Week 2 - Part 2", description: "Advanced matrix concepts", duration: "55:45", youtubeId: "ACoKBjv4E_8" }
    ]
  },
  "qualifier-stats-1": {
    title: "Statistics for Data Science I",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Introduction to statistical thinking and data analysis fundamentals",
    instructor: "IITM BS Faculty",
    thumbnail: "/courses/stats.jpg",
    videos: [
      { week: 1, title: "Week 1 - Introduction", description: "Fundamentals of statistics", duration: "46:35", youtubeId: "KnQ3EiRiePA" },
      { week: 2, title: "Week 2 - Descriptive Statistics", description: "Measures of central tendency", duration: "52:13", youtubeId: "0yqZiTCwGlc" },
      { week: 3, title: "Week 3 - Probability Basics", description: "Introduction to probability theory", duration: "61:32", youtubeId: "7tC9xgjFzoc" },
      { week: 4, title: "Week 4 - Statistical Inference", description: "Hypothesis testing fundamentals", duration: "48:43", youtubeId: "zk_LyywNlFQ" }
    ]
  },
  "qualifier-computational-thinking": {
    title: "Computational Thinking",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Problem-solving and algorithmic thinking fundamentals",
    instructor: "IITM BS Faculty",
    thumbnail: "/courses/ct.jpg",
    videos: [
      { week: 1, title: "Week 1 - Introduction", description: "What is computational thinking?", duration: "42:15", youtubeId: "hH7xlmnNvR8" },
      { week: 2, title: "Week 2 - Algorithms", description: "Basic algorithmic concepts", duration: "50:20", youtubeId: "IGRGpZD_mrc" },
      { week: 2, title: "Week 2-4 - Pseudocode", description: "Writing pseudocode effectively", duration: "45:30", youtubeId: "LHM0ymdQ9jw" },
      { week: 3, title: "Week 3 - Practice Problems", description: "Solving computational problems", duration: "52:40", youtubeId: "W8JeI7fyW0A" },
      { week: 4, title: "Week 4 - Advanced Topics", description: "Complex problem solving", duration: "48:05", youtubeId: "IvcVmO9BY78" }
    ]
  },
  "qualifier-english-1": {
    title: "English I",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Essential English communication skills for academic success",
    instructor: "IITM BS Faculty",
    thumbnail: "/courses/english.jpg",
    videos: [
      { week: 1, title: "Week 1 - Communication Basics", description: "Fundamentals of effective communication", duration: "62:52", youtubeId: "YLRCCeQR95o" },
      { week: 4, title: "Week 4 - Advanced Skills", description: "Professional communication techniques", duration: "55:30", youtubeId: "9SLWfl6icMU" }
    ]
  },
  "foundation-math-2": {
    title: "Mathematics for Data Science II",
    level: "foundation",
    type: "paid",
    weeks: 12,
    description: "Advanced mathematical concepts for data science",
    instructor: "IITM BS Faculty",
    thumbnail: "/courses/math.jpg",
    videos: []
  },
  "foundation-stats-2": {
    title: "Statistics for Data Science II",
    level: "foundation",
    type: "paid",
    weeks: 12,
    description: "Comprehensive statistical methods and applications",
    instructor: "IITM BS Faculty",
    thumbnail: "/courses/stats.jpg",
    videos: []
  },
  "foundation-programming-python": {
    title: "Programming in Python",
    level: "foundation",
    type: "paid",
    weeks: 12,
    description: "Python programming for data analysis and applications",
    instructor: "IITM BS Faculty",
    thumbnail: "/courses/ct.jpg",
    videos: []
  },
  "foundation-english-2": {
    title: "English II",
    level: "foundation",
    type: "paid",
    weeks: 12,
    description: "Advanced English communication and writing skills",
    instructor: "IITM BS Faculty",
    thumbnail: "/courses/english.jpg",
    videos: []
  }
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const course = courseData[courseId]
  const supabase = createClient()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [courseId])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
    
    if (user) {
      // Check enrollment from database
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()
      
      setIsEnrolled(!!enrollment)
    }
    setLoading(false)
  }

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    setEnrolling(true)
    
    try {
      if (course.type === 'paid') {
        // Redirect to payment page
        router.push(`/payment/${courseId}`)
      } else {
        // Free course - enroll via API
        const response = await fetch('/api/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId })
        })

        if (response.ok) {
          alert('Enrolled successfully! This course has been added to My Courses.')
          setIsEnrolled(true)
          // Refresh enrollment status
          checkAuth()
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to enroll')
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      alert('Failed to enroll. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Navbar isAuthenticated={false} />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Course Not Found</h1>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "qualifier": return "bg-[#51b206]/20 text-[#51b206] border-[#51b206]/50"
      case "foundation": return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/50"
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Course Header */}
      <section className="relative pt-24 pb-8 overflow-hidden bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
          <Link 
            href={isAuthenticated ? "/dashboard/courses" : "/courses"}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#51b206] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left side - Course Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${getLevelBadgeColor(course.level)} border text-xs px-3 py-1`}>
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)} Path
                  </Badge>
                  <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/50 text-xs px-3 py-1">
                    🇮🇳 Tamil
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {course.title}
                </h1>
                
                <p className="text-base text-slate-300 mb-6">
                  {course.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="text-2xl font-bold text-white mb-1">{course.weeks}</div>
                    <div className="text-xs text-slate-400">Weeks</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="text-2xl font-bold text-white mb-1">{course.videos.length}</div>
                    <div className="text-xs text-slate-400">Videos</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="text-2xl font-bold text-white mb-1">{course.weeks * 6}</div>
                    <div className="text-xs text-slate-400">Hours</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="text-2xl font-bold text-[#51b206] mb-1">{course.type === 'free' ? 'FREE' : 'PAID'}</div>
                    <div className="text-xs text-slate-400">Access</div>
                  </div>
                </div>

                {isEnrolled ? (
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#51b206] hover:bg-[#51b206] text-white font-semibold px-4 py-2">
                      ✓ Enrolled
                    </Badge>
                    <span className="text-sm text-slate-400">You have access to all course materials</span>
                  </div>
                ) : (
                  <Button 
                    onClick={handleEnroll}
                    disabled={loading || enrolling}
                    className="bg-[#3e3098] hover:bg-[#3e3098]/90 text-white font-semibold px-8 py-6 text-base"
                  >
                    {enrolling ? 'Enrolling...' : course.type === 'paid' ? '🔒 Enroll Now - Premium' : 'Start Learning - Free'}
                  </Button>
                )}
              </div>

              {/* Right side - Course Preview/Info Box */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">This skill path includes</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">Hands-on {course.videos.length} video tutorials</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">Practice exercises to apply skills</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">Taught in Tamil language</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">Quizzes to test your knowledge</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">A certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* About This Course */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">About this skill path</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Ready to start your journey with {course.title}? This skill path covers everything 
                you need to build a solid foundation for analyzing data in Python. You'll get hands-on 
                experience through practical exercises while learning to program and analyze data in 
                one of the most in-demand skills in today's world with industry-standard platforms for 
                interactively developing data analytics.
              </p>
            </div>

            {/* Skills You'll Gain */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Skills you'll gain</h2>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600">Mathematical foundations</Badge>
                <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600">Statistical analysis</Badge>
                <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600">Problem solving</Badge>
                <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600">Critical thinking</Badge>
                <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600">Data visualization</Badge>
                <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600">Python programming</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus/Course Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Syllabus</h2>
            <p className="text-slate-400 text-sm">{course.weeks} units • {course.videos.length} lessons • {course.videos.length} quizzes</p>
          </div>

          <div className="space-y-4">
            {Array.from({ length: course.weeks }, (_, i) => i + 1).map((weekNum) => {
              const weekVideos = course.videos.filter((v: any) => v.week === weekNum)
              const hasContent = weekVideos.length > 0

              return (
                <div key={weekNum} className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
                  {/* Week Header */}
                  <div className="bg-slate-800/60 px-6 py-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#51b206]/20 text-[#51b206] w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {weekNum}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {hasContent ? weekVideos[0]?.title.split(' - ')[0] : `Week ${weekNum} - Introduction`}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {hasContent ? weekVideos[0]?.description : 'Course materials and introductory content'}
                          </p>
                        </div>
                      </div>
                      {!isAuthenticated || !isEnrolled ? (
                        <Lock className="w-5 h-5 text-slate-500" />
                      ) : null}
                    </div>
                  </div>

                  {/* Video Content */}
                  <div className="p-6">
                    {!isAuthenticated ? (
                      <div className="text-center py-8">
                        <Lock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm mb-4">Sign in to preview course content</p>
                        <Button onClick={() => router.push('/auth/login')} className="bg-[#3e3098] hover:bg-[#3e3098]/90">
                          Sign In
                        </Button>
                      </div>
                    ) : !isEnrolled ? (
                      <div className="text-center py-8">
                        <Lock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm mb-4">Enroll to access {weekVideos.length || 'all'} video{weekVideos.length !== 1 ? 's' : ''} in this week</p>
                        <Button onClick={handleEnroll} className="bg-[#3e3098] hover:bg-[#3e3098]/90">
                          {course.type === 'paid' ? 'Enroll - Premium' : 'Enroll Free'}
                        </Button>
                      </div>
                    ) : hasContent ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {weekVideos.map((video: any, idx: number) => (
                          <Link key={idx} href={`/courses/${courseId}/week-${weekNum}`} className="group">
                            <div className="relative bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-[#51b206]/50 transition-all">
                              {/* Video Thumbnail */}
                              <div className="relative aspect-video bg-slate-800">
                                <img 
                                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <div className="bg-[#51b206] rounded-full p-3 group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 text-white" fill="white" />
                                  </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                  {video.duration}
                                </div>
                              </div>
                              {/* Video Info */}
                              <div className="p-3">
                                <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-[#51b206] transition-colors">
                                  {video.title}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-1">
                                  {video.description}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">Content coming soon</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Certificate Info */}
          <div className="mt-8 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#51b206]/20 rounded-lg p-3">
                <CheckCircle2 className="w-6 h-6 text-[#51b206]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Certificate of completion available with Plus or Pro</h3>
                <p className="text-slate-300 text-sm">
                  Earn a certificate of completion to showcase your accomplishment on your resume or LinkedIn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
