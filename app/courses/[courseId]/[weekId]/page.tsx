"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronLeft, ChevronRight, Clock } from "lucide-react"

// Same course data as parent page
const courseData: Record<string, any> = {
  "qualifier-python": {
    title: "Python Programming Basics",
    videos: [
      { week: 1, title: "Introduction to Python", description: "Getting started with Python programming", duration: "45:30", youtubeId: "kqtD5dpn9C8" },
      { week: 2, title: "Data Types and Variables", description: "Understanding Python data structures", duration: "52:15", youtubeId: "rfscVS0vtbw" },
      { week: 3, title: "Control Flow and Functions", description: "Mastering loops, conditions, and functions", duration: "48:20", youtubeId: "8ext9G7xspg" },
      { week: 4, title: "Object-Oriented Programming", description: "Classes, objects, and OOP concepts", duration: "55:45", youtubeId: "ZDa-Z5JzLYM" }
    ]
  },
  "qualifier-math": {
    title: "Mathematics Foundation",
    videos: [
      { week: 1, title: "Linear Algebra Basics", description: "Vectors, matrices, and operations", duration: "42:10", youtubeId: "fNk_zzaMoSs" },
      { week: 2, title: "Calculus Fundamentals", description: "Derivatives and integrals", duration: "50:25", youtubeId: "WUvTyaaNkzM" },
      { week: 3, title: "Probability Theory", description: "Introduction to probability", duration: "46:30", youtubeId: "uzkc-qNVoOk" },
      { week: 4, title: "Statistics Basics", description: "Descriptive and inferential statistics", duration: "53:15", youtubeId: "xxpc-HPKN28" }
    ]
  },
  "qualifier-stats": {
    title: "Statistics Primer",
    videos: [
      { week: 1, title: "Introduction to Statistics", description: "What is statistics and why it matters", duration: "40:15", youtubeId: "hjZJIVWHnPE" },
      { week: 2, title: "Data Visualization", description: "Charts, graphs, and visual analysis", duration: "47:20", youtubeId: "0P7QnIQDBJY" },
      { week: 3, title: "Hypothesis Testing", description: "Testing statistical hypotheses", duration: "51:30", youtubeId: "0oc49DyA3hU" },
      { week: 4, title: "Regression Analysis", description: "Linear and logistic regression", duration: "49:45", youtubeId: "nk2CQITm_eo" }
    ]
  },
  "foundation-python-advanced": {
    title: "Python for Data Science",
    videos: [
      { week: 1, title: "NumPy and Pandas", description: "Data manipulation with Python libraries", duration: "58:30", youtubeId: "ZyhVh-qRZPA" },
      { week: 2, title: "Data Visualization with Matplotlib", description: "Creating stunning visualizations", duration: "52:15", youtubeId: "UO98lJQ3QGI" },
      { week: 3, title: "Data Cleaning and Preprocessing", description: "Handling missing data and outliers", duration: "55:20", youtubeId: "xi0vhXFPegw" },
      { week: 4, title: "Introduction to Machine Learning", description: "Basic ML concepts with scikit-learn", duration: "60:10", youtubeId: "Gv9_4yMHFhI" }
    ]
  },
  "diploma-database": {
    title: "Database Management Systems",
    videos: [
      { week: 1, title: "Introduction to Databases", description: "Database fundamentals and SQL basics", duration: "45:40", youtubeId: "HXV3zeQKqGY" },
      { week: 2, title: "Advanced SQL Queries", description: "Joins, subqueries, and optimization", duration: "52:25", youtubeId: "7S_tz1z_5bA" },
      { week: 3, title: "Database Design", description: "Normalization and ER diagrams", duration: "48:15", youtubeId: "ztHopE5Wnpc" },
      { week: 4, title: "NoSQL Databases", description: "MongoDB, Redis, and document stores", duration: "50:30", youtubeId: "xh4gy1lbL2k" }
    ]
  }
}

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const weekId = params.weekId as string
  
  const course = courseData[courseId]
  if (!course) {
    return <div>Course not found</div>
  }

  const weekNumber = parseInt(weekId.replace("week-", ""))
  const currentVideo = course.videos.find((v: any) => v.week === weekNumber)
  const currentIndex = course.videos.findIndex((v: any) => v.week === weekNumber)

  if (!currentVideo) {
    return <div>Video not found</div>
  }

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < course.videos.length - 1

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevVideo = course.videos[currentIndex - 1]
      router.push(`/courses/${courseId}/week-${prevVideo.week}`)
    }
  }

  const handleNext = () => {
    if (hasNext) {
      const nextVideo = course.videos[currentIndex + 1]
      router.push(`/courses/${courseId}/week-${nextVideo.week}`)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar isAuthenticated={false} />

      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Link 
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#51b206] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Course
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Video Player */}
            <div className="lg:col-span-2">
              {/* YouTube Video Embed */}
              <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl mb-6">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Video Info */}
              <Card className="bg-black/80 backdrop-blur-sm border-slate-800 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="bg-slate-700 text-slate-300 hover:bg-slate-700 mb-3">
                        Week {currentVideo.week} of {course.videos.length}
                      </Badge>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {currentVideo.title}
                      </h1>
                      <p className="text-slate-400">
                        {currentVideo.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{currentVideo.duration}</span>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handlePrevious}
                      disabled={!hasPrevious}
                      variant="outline"
                      className="flex-1 border-slate-700 hover:border-[#51b206] hover:bg-[#51b206]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous Video
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!hasNext}
                      className="flex-1 bg-[#51b206] hover:bg-[#51b206]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Video
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Course Description */}
              <Card className="bg-black/80 backdrop-blur-sm border-slate-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">About This Course</h2>
                  <p className="text-slate-400 mb-4">
                    {course.title} is designed to provide you with comprehensive knowledge and hands-on experience. 
                    Each week builds upon the previous one, ensuring a smooth learning curve.
                  </p>
                  <p className="text-slate-400">
                    This course is completely free and accessible to all IITM BS students. 
                    Watch at your own pace and revisit any topic as needed.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Course Content */}
            <div className="lg:col-span-1">
              <Card className="bg-black/80 backdrop-blur-sm border-slate-800 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Course Content</h2>
                  
                  <div className="space-y-2">
                    {course.videos.map((video: any, index: number) => {
                      const isActive = video.week === weekNumber
                      const isWatched = index < currentIndex

                      return (
                        <Link
                          key={index}
                          href={`/courses/${courseId}/week-${video.week}`}
                          className={`block p-4 rounded-lg border transition-all ${
                            isActive
                              ? "bg-[#51b206]/20 border-[#51b206]/50"
                              : isWatched
                              ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                              : "bg-slate-900/50 border-slate-800 hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isActive
                                ? "bg-[#51b206] text-white"
                                : isWatched
                                ? "bg-slate-600 text-slate-300"
                                : "bg-slate-800 text-slate-500"
                            }`}>
                              {video.week}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-semibold mb-1 ${
                                isActive ? "text-[#51b206]" : "text-white"
                              }`}>
                                {video.title}
                              </h3>
                              <p className="text-xs text-slate-500">{video.duration}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
