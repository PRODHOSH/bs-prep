"use client"

import { createClient } from "@/lib/supabase/client"
import { PROFILE_UPDATED_EVENT, getDisplayProfile, getUserCached } from "@/lib/supabase/cached-user"
import { HomeSkeleton } from "@/components/dashboard/skeleton"
import { useEffect, useState } from "react"

import { Course, courses as staticCourses } from "@/lib/course-catalog"
import { StudentHomeView } from "@/components/dashboard/views/home-view"

import type { LiveClass } from "@/components/dashboard/views/home-view"

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
        const { data: { user } } = await getUserCached()
        if (user) {
          const profile = await getDisplayProfile()
          setUserName(profile.name || user.email?.split("@")[0] || "Student")
          setUserEmail(user.email || "")
          setUserAvatar(profile.avatarUrl)
          
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
    const onProfile = async () => {
      const profile = await getDisplayProfile()
      if (profile.name) setUserName(profile.name)
    }
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfile)
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, onProfile)
  }, [])

  if (loading) return <HomeSkeleton />

  return (
    <StudentHomeView
      userName={userName}
      userEmail={userEmail}
      userAvatar={userAvatar}
      enrolledCourses={enrolledCourses}
      liveClasses={liveClasses}
    />
  )
}
