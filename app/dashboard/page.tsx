"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Trophy, Users, TrendingUp, Calendar, Clock, Video, Award } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  level: string
  type: string
  courseType?: string
  weeks: number
  thumbnail: string
  includesCourses?: number
  withCertificate?: boolean
}

interface LiveClass {
  subject: string
  topic: string
  meetingLink: string
  time: string
  date: string
}

export default function StudentDashboard() {
  const [userName, setUserName] = useState("")
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        const response = await fetch("/api/live-classes")
        if (response.ok) {
          const data = await response.json()
          setLiveClasses(data.classes || [])
        }
      } catch (error) {
        console.error("Error fetching live classes:", error)
      }
    }
    fetchLiveClasses()
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserName(user.email?.split("@")[0] || "Student")
          
          // Get enrolled courses with details
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('user_id', user.id)
          
          if (enrollments && enrollments.length > 0) {
            const courseIds = enrollments.map(e => e.course_id)
            const { data: courses } = await supabase
              .from('courses')
              .select('*')
              .in('id', courseIds)
            
            setEnrolledCourses(courses || [])
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const getCourseTypeStyles = (courseType: string) => {
    switch (courseType) {
      case "skill-path":
        return { bg: "bg-cyan-100", text: "text-cyan-900", label: "Skill path" }
      case "course":
        return { bg: "bg-emerald-100", text: "text-emerald-900", label: "Course" }
      case "career-path":
        return { bg: "bg-slate-900", text: "text-white", label: "Career path" }
      case "free-course":
        return { bg: "bg-lime-200", text: "text-lime-950", label: "Free course" }
      default:
        return { bg: "bg-slate-100", text: "text-slate-900", label: "Course" }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#51b206]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-xl p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-slate-300">
          Continue your learning journey with IITM BS courses
        </p>
      </div>

      {/* Upcoming Live Classes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming Live Classes</h2>
          <Link href="/dashboard/live-classes">
            <Button variant="outline" size="sm" className="text-sm">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveClasses.length === 0 ? (
            <div className="col-span-full bg-white/5 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">No live classes scheduled at the moment.</p>
            </div>
          ) : (
            liveClasses.slice(0, 3).map((liveClass, index) => (
            <Card key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#51b206]/50 dark:hover:border-[#51b206]/50 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border-red-500/20">
                    <Video className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {liveClass.subject}
                </h3>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  {liveClass.topic}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(liveClass.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{liveClass.time}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-[#E8E889] hover:bg-[#d4d477] text-black font-semibold"
                  onClick={() => window.open(liveClass.meetingLink, "_blank")}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
              </CardContent>
            </Card>
          )))}
        </div>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h2>
          <Link href="/dashboard/courses">
            <Button variant="outline" size="sm" className="text-sm">
              Explore More
            </Button>
          </Link>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.slice(0, 6).map((course) => {
              const typeStyles = getCourseTypeStyles(course.courseType || "course")
              
              return (
                <Link key={course.id} href={`/courses/${course.id}`} className="group">
                  <Card className="relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-[#51b206]/50 dark:hover:border-[#51b206]/50 transition-all duration-300 overflow-hidden h-full hover:shadow-lg hover:shadow-[#51b206]/10">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Colored Header with Type */}
                      <div className={`${typeStyles.bg} ${typeStyles.text} px-4 py-2.5 font-medium text-sm`}>
                        {typeStyles.label}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-grow flex flex-col">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 min-h-[56px]">
                          {course.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-grow">
                          {course.description}
                        </p>

                        {/* Divider */}
                        <div className="border-t border-slate-200 dark:border-slate-700/50 mb-4"></div>

                        {/* Footer Meta Info */}
                        <div className="space-y-3">
                          {/* Includes Courses (if applicable) */}
                          {course.includesCourses && (
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Includes <span className="font-semibold text-slate-900 dark:text-white">{course.includesCourses} Courses</span>
                            </div>
                          )}

                          {/* Bottom row: Certificate, Level, Duration */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              {/* Certificate Badge */}
                              {(course.withCertificate !== false) && (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                  <Award className="w-4 h-4" />
                                  <span className="text-xs">With Certificate</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Level and Duration */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <BookOpen className="w-4 h-4" />
                              <span className="text-xs capitalize">{course.level} Friendly</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">{course.weeks * 6} hours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 border border-slate-700 rounded-xl text-center">
            <div className="w-20 h-20 mx-auto bg-slate-800 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Welcome to BSPrep!
            </h2>
            <p className="text-slate-300 mb-6">
              Start your IITM BS journey by exploring our courses. Enroll in free qualifier courses or upgrade to foundation level courses.
            </p>
            <Link href="/dashboard/courses">
              <Button className="bg-[#51b206] hover:bg-[#51b206]/90 text-white px-6 py-2.5 shadow-lg">
                Browse Courses
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
