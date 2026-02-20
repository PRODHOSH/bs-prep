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
          bg: "bg-gradient-to-r from-cyan-50 to-cyan-100",
          text: "text-cyan-900",
          label: "Skill path",
          border: "border-l-4 border-cyan-500"
        }
      case "course":
        return {
          bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
          text: "text-emerald-900",
          label: "Course",
          border: "border-l-4 border-emerald-500"
        }
      case "career-path":
        return {
          bg: "bg-gradient-to-r from-slate-800 to-slate-900",
          text: "text-white",
          label: "Career path",
          border: "border-l-4 border-amber-500"
        }
      case "free-course":
        return {
          bg: "bg-gradient-to-r from-lime-100 to-lime-200",
          text: "text-lime-950",
          label: "Free course",
          border: "border-l-4 border-lime-600"
        }
      default:
        return {
          bg: "bg-gradient-to-r from-slate-50 to-slate-100",
          text: "text-black",
          label: "Course",
          border: "border-l-4 border-slate-400"
        }
    }
  }

  return (
    <div className="min-h-screen bg-[#FEF9E7]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Explore Courses</h1>
          <p className="text-sm text-black/70">
            Discover and enroll in new IITM BS courses taught in Tamil
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#51b206] mx-auto"></div>
            <p className="text-black/70 mt-4 text-sm">Loading courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => {
              const typeStyles = getCourseTypeStyles(course.courseType || "course")
              const isPaid = course.type === "paid"
              const isEnrolled = enrolledCourseIds.includes(course.id)
              
              return (
                <Link key={course.id} href={`/courses/${course.id}`} className="group block h-full">
                  <Card className="relative bg-white border border-gray-200 hover:border-gray-400 transition-all duration-200 hover:shadow-lg rounded-xl h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Top Badge - Certification Path / Course Type */}
                      <div className="mb-3">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-black text-xs font-semibold rounded">
                          {typeStyles.label}
                        </span>
                        {isEnrolled && (
                          <Badge className="ml-2 bg-[#51b206] hover:bg-[#51b206] text-white text-xs px-2 py-0.5">Enrolled</Badge>
                        )}
                        {isPaid && !isEnrolled && (
                          <Badge className="ml-2 bg-amber-500 hover:bg-amber-500 text-white text-xs px-2 py-0.5">
                            <Lock className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>

                      {/* Course Branding/Provider */}
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">IITM BS</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-black mb-3 line-clamp-2 leading-tight min-h-[44px]">
                        {course.title}
                      </h3>

                      {/* Divider */}
                      <div className="h-px bg-gray-200 my-3"></div>

                      {/* Includes Courses */}
                      {course.includesCourses && (
                        <>
                          <div className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-500" />
                            Includes <span className="font-semibold text-black">{course.includesCourses} courses</span>
                          </div>
                        </>
                      )}

                      <div className="mt-auto">
                        {/* Level */}
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium capitalize text-gray-700">{course.level}</span>
                        </div>
                        
                        {/* Price */}
                        {course.price && (
                          <div className="flex items-center justify-between py-2 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-600">Price</span>
                            <div className="text-xl font-bold text-black">
                              ₹{course.price}
                            </div>
                          </div>
                        )}
                      </div>
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
