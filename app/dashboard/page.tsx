"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Trophy, Users, TrendingUp, Calendar, Clock, Video, Award, Star, ArrowUpRight } from "lucide-react"

import { Course, courses as staticCourses } from "@/lib/course-catalog"

interface LiveClass {
  course: string
  topic: string
  meetingLink: string
  time: string
  date: string
}

const COURSE_DISPLAY_NAMES: Record<string, string> = {
  "ct": "Computational Thinking",
  "math-1": "Mathematics for Data Science I",
  "stats-1": "Statistics I",
  "python": "Programming in Python (Free)",
  "qualifier-python": "Programming in Python",
  "qualifier-java": "Programming in Java",
  "math-2": "Mathematics for Data Science II",
  "stats-2": "Statistics II",
  "english-1": "English I",
  "english-2": "English II",
  "doubts": "Doubt Session",
}

function getCourseDisplayName(code: string): string {
  return COURSE_DISPLAY_NAMES[code.toLowerCase()] ?? code
}

function formatTime12hr(time: string): string {
  const [hourStr, minuteStr] = time.split(":")
  let hour = parseInt(hourStr, 10)
  const minute = minuteStr ?? "00"
  const period = hour >= 12 ? "PM" : "AM"
  hour = hour % 12 || 12
  return `${hour}:${minute} ${period}`
}

export default function StudentDashboard() {
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
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
          const now = Date.now()
          const upcoming = (data.classes || []).filter((cls: LiveClass) => {
            try {
              const [h, m] = (cls.time || "0:0").split(":").map(Number)
              const d = new Date(cls.date)
              d.setHours(h, m, 0, 0)
              // keep classes that haven't ended (allow 60 min past start)
              return d.getTime() + 60 * 60 * 1000 > now
            } catch {
              return true
            }
          })
          setLiveClasses(upcoming)
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
          setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Student")
          setUserEmail(user.email || "")
          const av = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
          setUserAvatar(av)
          
          // Get enrolled courses with details
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('user_id', user.id)
          
          if (enrollments && enrollments.length > 0) {
            const courseIds = enrollments.map(e => e.course_id)
            const { data: dbCourses } = await supabase
              .from('courses')
              .select('*')
              .in('id', courseIds)
            
            // Map course details, fallback to static if DB is missing
            const courses = courseIds.map(id => {
              const dbCourse = dbCourses?.find(c => c.id === id);
              const staticCourse = staticCourses.find(c => c.id === id);
              
              if (!staticCourse && dbCourse) return dbCourse;
              if (!dbCourse && staticCourse) return staticCourse;
              
              return { ...dbCourse, ...staticCourse };
            }).filter(Boolean)

            setEnrolledCourses(courses)
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
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
    </div>
  }

  const hasNoEnrollments = enrolledCourses.length === 0
  const dashboardLiveClasses = hasNoEnrollments
    ? liveClasses.filter((cls) => {
        const code = cls.course?.toLowerCase()
        return code === "python" || code === "doubts"
      })
    : liveClasses

  return (
    <div id="tour-dashboard-full" className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div id="tour-dashboard-welcome" className="bg-[#0a192f] rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-start justify-between gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>
        
        <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative shrink-0">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="h-20 w-20 rounded-full border-4 border-white/20 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-3xl font-black text-white">
                {(userName[0] || "S").toUpperCase()}
              </div>
            )}
            {enrolledCourses.length > 0 && (
              <span
                title="Enrolled student"
                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0a192f] bg-white shadow-xl"
              >
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                WELCOME, {userName}
              </h1>
            </div>
            <p className="text-white/70 font-bold uppercase tracking-widest text-xs max-w-md leading-relaxed">
              CONTINUE YOUR LEARNING JOURNEY WITH IITM BS COURSES
            </p>
          </div>
        </div>

        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfyhCw9tPgKmMWYPhjV6Kzixp2RdYEi-x7JPL6JUxoLwbnB_g/viewform?usp=sharing&ouid=109000575421815991569"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 shrink-0 px-8 h-14 flex items-center justify-center bg-white text-[#0a192f] font-black uppercase tracking-widest text-xs rounded-full hover:bg-gray-100 transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.25)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.23)] hover:-translate-y-1 gap-2"
        >
          JOIN US ON WHATSAPP
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* Upcoming Live Classes */}
      <div id="tour-dashboard-live">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6" />
            UPCOMING LIVE CLASSES
          </h2>
          <Link 
            href="/dashboard/live-classes"
            className="text-xs font-black uppercase tracking-widest text-black/50 hover:text-black underline underline-offset-4 transition-colors"
          >
            VIEW ALL
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardLiveClasses.length === 0 ? (
            <div className="col-span-full bg-black/5 border border-black/10 rounded-3xl p-12 text-center flex flex-col items-center">
              <Video className="w-12 h-12 text-black/20 mb-4" />
              <p className="text-black/60 font-bold uppercase tracking-widest text-sm">
                NO LIVE CLASSES SCHEDULED.
              </p>
            </div>
          ) : (
            dashboardLiveClasses.slice(0, 3).map((liveClass, index) => (
            <div key={index} className="bg-white border border-black/10 hover:border-black hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden flex flex-col group group/card">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                  <Calendar className="w-4 h-4 text-black/30" />
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">{getCourseDisplayName(liveClass.course)}</p>
                <h3 className="font-black text-black uppercase tracking-tight text-xl leading-[1.2] mb-6 flex-1">
                  {liveClass.topic}
                </h3>
                
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-black/60 pt-6 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-black/40" />
                    <span>{new Date(liveClass.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-black/40" />
                    <span>{formatTime12hr(liveClass.time)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-black/5 group-hover/card:bg-black transition-colors">
                <button
                  onClick={() => window.open(liveClass.meetingLink, "_blank")}
                  className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-black group-hover/card:text-white py-3 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  JOIN MEETING
                </button>
              </div>
            </div>
          )))}
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        /* Not enrolled — show explore prompt */
        <div id="tour-explore-courses" className="flex flex-col items-center justify-center py-24 px-6 bg-white border border-black/10 rounded-3xl text-center shadow-sm">
          <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-8">
            <BookOpen className="w-10 h-10 text-black/40" />
          </div>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight mb-4">START YOUR IITM BS JOURNEY</h2>
          <p className="text-black/50 font-bold uppercase tracking-widest text-sm max-w-lg mb-10 leading-relaxed">
            You haven&apos;t enrolled in any courses yet. Explore our tamil-medium qualifier courses and get started today.
          </p>
          <Link href="/dashboard/courses">
            <button className="bg-black text-white hover:bg-black/90 shadow-md px-10 h-14 rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-transform hover:-translate-y-1">
              EXPLORE COURSES
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      ) : (
        /* My Courses */
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              MY COURSES
            </h2>
            <Link 
              href="/dashboard/courses"
              className="text-xs font-black uppercase tracking-widest text-black/50 hover:text-black underline underline-offset-4 transition-colors"
            >
              EXPLORE MORE
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.slice(0, 6).map((course) => {
              return (
                <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="group block h-full">
                  <div className="relative bg-white border border-black/10 hover:border-black transition-all duration-300 hover:shadow-xl rounded-3xl overflow-hidden h-full flex flex-col">
                    
                    <div className="relative aspect-[16/9] bg-black/5 overflow-hidden">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-black/20" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white text-black font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full shadow-sm">
                          IITM BS
                        </span>
                        <span className="bg-[#0a192f] text-white font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full shadow-sm">
                          {course.level}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-black text-black uppercase tracking-tight leading-[1.2] mb-3 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-black/50 mb-6 line-clamp-2 leading-relaxed flex-1">
                        {course.description}
                      </p>
                      
                      <div className="pt-5 border-t border-black/5 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-black/60">
                          <Award className="w-4 h-4" />
                          IN PROGRESS
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-black/30 group-hover:text-black transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

}
