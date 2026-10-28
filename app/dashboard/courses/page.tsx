"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getUserCached } from "@/lib/supabase/cached-user"
import { CoursesView } from "@/components/dashboard/views/courses-view"

export default function DashboardCoursesPage() {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await getUserCached()
        if (user) {
          const { data, error } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id)
          if (!error && data) setEnrolledCourseIds(data.map((e) => e.course_id))
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <CoursesView enrolledCourseIds={enrolledCourseIds} loading={loading} />
}
