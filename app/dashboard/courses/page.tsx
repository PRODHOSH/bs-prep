'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Award, BookOpen, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Course {
  id: string
  title: string
  description: string
  level: string
  type: string
  courseType?: string
  weeks: number
  price: number
  thumbnail: string
  instructor: string
  students_count: number
  includesCourses?: number
  withCertificate?: boolean
}

export default function ExploreCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('level', { ascending: true })

      if (coursesError) throw coursesError

      // Fetch user's enrollments
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id)

        if (!enrollError && enrollments) {
          setEnrolledCourseIds(enrollments.map(e => e.course_id))
        }
      }

      setCourses(coursesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCourseTypeStyles = (courseType: string) => {
    switch (courseType) {
      case "skill-path":
        return {
          bg: "bg-cyan-100",
          text: "text-cyan-900",
          label: "Skill path"
        }
      case "course":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-900",
          label: "Course"
        }
      case "career-path":
        return {
          bg: "bg-slate-900",
          text: "text-white",
          label: "Career path"
        }
      case "free-course":
        return {
          bg: "bg-lime-200",
          text: "text-lime-950",
          label: "Free course"
        }
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-900",
          label: "Course"
        }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Explore Courses</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Discover and enroll in new IITM BS courses taught in Tamil
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#51b206] mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm">Loading courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const typeStyles = getCourseTypeStyles(course.courseType || "course")
              const isPaid = course.type === "paid"
              const isEnrolled = enrolledCourseIds.includes(course.id)
              
              return (
                <Link key={course.id} href={`/courses/${course.id}`} className="group">
                  <Card className="relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-[#51b206]/50 dark:hover:border-[#51b206]/50 transition-all duration-300 overflow-hidden h-full hover:shadow-lg hover:shadow-[#51b206]/10">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Colored Header with Type */}
                      <div className={`${typeStyles.bg} ${typeStyles.text} px-4 py-2.5 font-medium text-sm flex items-center justify-between`}>
                        <span>{typeStyles.label}</span>
                        {isEnrolled && (
                          <Badge className="bg-[#51b206] hover:bg-[#51b206] text-white text-xs px-2 py-0.5">Enrolled</Badge>
                        )}
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

                          {/* Bottom row: Certificate */}
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

                      {/* Locked Overlay for Paid Courses */}
                      {isPaid && !isEnrolled && (
                        <div className="absolute top-12 right-3">
                          <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-semibold shadow-lg">
                            <Lock className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
