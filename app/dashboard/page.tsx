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
        return { bg: "bg-gradient-to-r from-cyan-50 to-cyan-100", text: "text-cyan-900", label: "Skill path", border: "border-l-4 border-cyan-500" }
      case "course":
        return { bg: "bg-gradient-to-r from-emerald-50 to-emerald-100", text: "text-emerald-900", label: "Course", border: "border-l-4 border-emerald-500" }
      case "career-path":
        return { bg: "bg-gradient-to-r from-slate-800 to-slate-900", text: "text-white", label: "Career path", border: "border-l-4 border-amber-500" }
      case "free-course":
        return { bg: "bg-gradient-to-r from-lime-100 to-lime-200", text: "text-lime-950", label: "Free course", border: "border-l-4 border-lime-600" }
      default:
        return { bg: "bg-gradient-to-r from-slate-50 to-slate-100", text: "text-black", label: "Course", border: "border-l-4 border-slate-400" }
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
      <div className="bg-white rounded-xl p-8 border border-[#E5DBC8]">
        <h1 className="text-3xl font-bold text-black mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-black/70">
          Continue your learning journey with IITM BS courses
        </p>
      </div>

      {/* Upcoming Live Classes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Upcoming Live Classes</h2>
          <Link href="/dashboard/live-classes">
            <Button variant="outline" size="sm" className="text-sm">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveClasses.length === 0 ? (
            <div className="col-span-full bg-[#F5EFE7] border border-slate-300 rounded-lg p-8 text-center">
              <p className="text-black/90">No live classes scheduled at the moment.</p>
            </div>
          ) : (
            liveClasses.slice(0, 3).map((liveClass, index) => (
            <Card key={index} className="bg-white border border-[#E5DBC8] hover:border-[#3e3098] transition-all duration-300 hover:shadow-lg rounded-lg">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border-red-500/20">
                    <Video className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                  <Calendar className="w-4 h-4 text-black/70" />
                </div>
                
                <h3 className="font-semibold text-black mb-2 line-clamp-2">
                  {liveClass.subject}
                </h3>
                
                <p className="text-xs text-black/70 mb-4">
                  {liveClass.topic}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-black/80">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(liveClass.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-black/80">
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
          <h2 className="text-2xl font-bold text-black">My Courses</h2>
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
                <Link key={course.id} href={`/courses/${course.id}`} className="group block h-full">
                  <Card className="relative bg-white border border-[#E5DBC8] hover:border-[#3e3098] transition-all duration-200 overflow-hidden hover:shadow-md rounded-xl h-full">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Top Badge - Certification Path / Course Type */>
                      <div className="px-4 pt-3 pb-2">
                        <span className="inline-block px-2.5 py-1 bg-[#F5EFE7] text-black/70 text-xs font-medium rounded">
                          {typeStyles.label}
                        </span>
                      </div>

                      <div className="px-4 pb-4 flex-grow flex flex-col">
                        {/* Course Branding/Provider */}
                        <div className="mb-2">
                          <span className="text-sm font-bold text-[#3e3098]">IITM BS</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-black mb-2 line-clamp-2 leading-tight min-h-[44px]">
                          {course.title}
                        </h3>

                        {/* Description */>
                        <p className="text-sm text-black/70 mb-3 line-clamp-2 leading-relaxed flex-grow">
                          {course.description}
                        </p>

                        {/* Dotted Divider */}
                        <div className="border-t border-dotted border-gray-300 my-3"></div>

                        {/* Includes Courses */}
                        {course.includesCourses && (
                          <>
                            <div className="text-sm text-black/80 mb-2">
                              Includes <span className="font-semibold text-black">{course.includesCourses} courses</span>
                            </div>
                            <div className="border-t border-dotted border-gray-300 my-3"></div>
                          </>
                        )}

                        {/* Bottom Row: Level and Duration */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-black/80">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm font-medium capitalize">{course.level}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-black/80">
                            <span className="text-sm font-medium">{course.weeks * 6} hours</span>
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
              <BookOpen className="w-10 h-10 text-black/50" />
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
