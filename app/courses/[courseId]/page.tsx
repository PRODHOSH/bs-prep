"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Clock, CheckCircle2 } from "lucide-react"

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
  const courseId = params.courseId as string
  const course = courseData[courseId]

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
      <Navbar isAuthenticated={false} />

      {/* Course Header */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={course.thumbnail} alt="" className="w-full h-full object-cover blur-2xl" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
          <Link 
            href="/courses"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#51b206] transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge className={`${getLevelBadgeColor(course.level)} border mb-4`}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {course.title}
              </h1>
              
              <p className="text-xl text-slate-300 mb-6">
                {course.description}
              </p>

              <div className="flex items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.weeks} weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  <span>{course.videos.length} videos</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-slate-400">
                  Instructor: <span className="text-white font-semibold">{course.instructor}</span>
                </p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-black/80 backdrop-blur-sm border-slate-800">
                <CardContent className="p-6">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover object-left rounded-lg mb-4"
                  />
                  <Badge className="bg-[#51b206] hover:bg-[#51b206] text-white font-semibold w-full justify-center py-2">
                    FREE COURSE
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-8">Course Content</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.videos.map((video: any, index: number) => (
              <Link
                key={index}
                href={`/courses/${courseId}/week-${video.week}`}
                className="group"
              >
                <Card className="bg-black/80 backdrop-blur-sm border-slate-800 hover:border-[#51b206]/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#51b206]/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-[#51b206]/20 rounded-lg flex items-center justify-center group-hover:bg-[#51b206]/30 transition-colors">
                        <Play className="w-8 h-8 text-[#51b206]" fill="#51b206" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-slate-700 text-slate-300 hover:bg-slate-700">
                            Week {video.week}
                          </Badge>
                          <span className="text-sm text-slate-500">{video.duration}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#51b206] transition-colors">
                          {video.title}
                        </h3>

                        <p className="text-sm text-slate-400 line-clamp-2">
                          {video.description}
                        </p>
                      </div>

                      <CheckCircle2 className="w-5 h-5 text-slate-700 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
