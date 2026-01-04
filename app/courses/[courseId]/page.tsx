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
  "qualifier-python": {
    title: "Python Programming Basics",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Learn Python fundamentals with hands-on examples",
    instructor: "Dr. Rajesh Kumar",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
    videos: [
      {
        week: 1,
        title: "Introduction to Python",
        description: "Getting started with Python programming",
        duration: "45:30",
        youtubeId: "kqtD5dpn9C8"
      },
      {
        week: 2,
        title: "Data Types and Variables",
        description: "Understanding Python data structures",
        duration: "52:15",
        youtubeId: "rfscVS0vtbw"
      },
      {
        week: 3,
        title: "Control Flow and Functions",
        description: "Mastering loops, conditions, and functions",
        duration: "48:20",
        youtubeId: "8ext9G7xspg"
      },
      {
        week: 4,
        title: "Object-Oriented Programming",
        description: "Classes, objects, and OOP concepts",
        duration: "55:45",
        youtubeId: "ZDa-Z5JzLYM"
      }
    ]
  },
  "qualifier-math": {
    title: "Mathematics Foundation",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Essential mathematical concepts for data science",
    instructor: "Prof. Anitha Sharma",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800",
    videos: [
      {
        week: 1,
        title: "Linear Algebra Basics",
        description: "Vectors, matrices, and operations",
        duration: "42:10",
        youtubeId: "fNk_zzaMoSs"
      },
      {
        week: 2,
        title: "Calculus Fundamentals",
        description: "Derivatives and integrals",
        duration: "50:25",
        youtubeId: "WUvTyaaNkzM"
      },
      {
        week: 3,
        title: "Probability Theory",
        description: "Introduction to probability",
        duration: "46:30",
        youtubeId: "uzkc-qNVoOk"
      },
      {
        week: 4,
        title: "Statistics Basics",
        description: "Descriptive and inferential statistics",
        duration: "53:15",
        youtubeId: "xxpc-HPKN28"
      }
    ]
  },
  "qualifier-stats": {
    title: "Statistics Primer",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Introduction to statistical thinking and analysis",
    instructor: "Dr. Venkat Reddy",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    videos: [
      {
        week: 1,
        title: "Introduction to Statistics",
        description: "What is statistics and why it matters",
        duration: "40:15",
        youtubeId: "hjZJIVWHnPE"
      },
      {
        week: 2,
        title: "Data Visualization",
        description: "Charts, graphs, and visual analysis",
        duration: "47:20",
        youtubeId: "0P7QnIQDBJY"
      },
      {
        week: 3,
        title: "Hypothesis Testing",
        description: "Testing statistical hypotheses",
        duration: "51:30",
        youtubeId: "0oc49DyA3hU"
      },
      {
        week: 4,
        title: "Regression Analysis",
        description: "Linear and logistic regression",
        duration: "49:45",
        youtubeId: "nk2CQITm_eo"
      }
    ]
  },
  "foundation-python-advanced": {
    title: "Python for Data Science",
    level: "foundation",
    type: "free",
    weeks: 4,
    description: "Advanced Python programming for data analysis",
    instructor: "Dr. Priya Patel",
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
    videos: [
      {
        week: 1,
        title: "NumPy and Pandas",
        description: "Data manipulation with Python libraries",
        duration: "58:30",
        youtubeId: "ZyhVh-qRZPA"
      },
      {
        week: 2,
        title: "Data Visualization with Matplotlib",
        description: "Creating stunning visualizations",
        duration: "52:15",
        youtubeId: "UO98lJQ3QGI"
      },
      {
        week: 3,
        title: "Data Cleaning and Preprocessing",
        description: "Handling missing data and outliers",
        duration: "55:20",
        youtubeId: "xi0vhXFPegw"
      },
      {
        week: 4,
        title: "Introduction to Machine Learning",
        description: "Basic ML concepts with scikit-learn",
        duration: "60:10",
        youtubeId: "Gv9_4yMHFhI"
      }
    ]
  },
  "diploma-database": {
    title: "Database Management Systems",
    level: "diploma",
    type: "free",
    weeks: 4,
    description: "SQL, NoSQL, and database design principles",
    instructor: "Prof. Suresh Babu",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800",
    videos: [
      {
        week: 1,
        title: "Introduction to Databases",
        description: "Database fundamentals and SQL basics",
        duration: "45:40",
        youtubeId: "HXV3zeQKqGY"
      },
      {
        week: 2,
        title: "Advanced SQL Queries",
        description: "Joins, subqueries, and optimization",
        duration: "52:25",
        youtubeId: "7S_tz1z_5bA"
      },
      {
        week: 3,
        title: "Database Design",
        description: "Normalization and ER diagrams",
        duration: "48:15",
        youtubeId: "ztHopE5Wnpc"
      },
      {
        week: 4,
        title: "NoSQL Databases",
        description: "MongoDB, Redis, and document stores",
        duration: "50:30",
        youtubeId: "xh4gy1lbL2k"
      }
    ]
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
      case "diploma": return "bg-purple-500/20 text-purple-400 border-purple-500/50"
      case "degree": return "bg-orange-500/20 text-orange-400 border-orange-500/50"
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
                    className="w-full h-48 object-cover rounded-lg mb-4"
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
