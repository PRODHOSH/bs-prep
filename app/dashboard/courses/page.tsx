'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Package, BookOpen, Clock, Lock, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { courses } from '@/lib/course-catalog'

const levelLabels: Record<string, string> = {
  all: "ALL LEVELS",
  qualifier: "QUALIFIER",
  foundation: "FOUNDATION",
  diploma: "DIPLOMA",
  degree: "DEGREE",
}

export default function DashboardCoursesPage() {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"explore" | "my">("my")
  const supabase = createClient()

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const levelMatch = selectedLevel === "all" || course.level === selectedLevel.toLowerCase()
    const searchMatch = searchQuery === "" || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const tabMatch = activeTab === "explore" || enrolledCourseIds.includes(course.id)
    return levelMatch && searchMatch && tabMatch
  })

  return (
    <div className="bg-transparent">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-[1.1] mb-4 uppercase">
            COURSES <span className="text-[#0a192f]">WE OFFER</span>
          </h1>
          <p className="text-black/60 font-bold uppercase text-base max-w-2xl">
            Master the IITM BS curriculum with structured video courses, expert mentorship, and comprehensive study materials in Tamil.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-black/10 pb-4">
        <button
          onClick={() => setActiveTab("explore")}
          className={`text-sm font-black uppercase tracking-widest transition-colors ${activeTab === "explore" ? "text-black border-b-2 border-black pb-4 -mb-[17px]" : "text-black/40 hover:text-black/70"}`}
        >
          EXPLORE COURSES
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`text-sm font-black uppercase tracking-widest transition-colors ${activeTab === "my" ? "text-black border-b-2 border-black pb-4 -mb-[17px]" : "text-black/40 hover:text-black/70"}`}
        >
          MY COURSES
        </button>
      </div>

      {/* Search + Level filter */}
      <div className="mb-12 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/50" />
          <Input
            type="text"
            placeholder="SEARCH IITM BS COURSES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 h-14 bg-white border border-black/10 rounded-2xl text-black font-black uppercase placeholder:text-black/30 text-sm shadow-sm focus:ring-2 focus:ring-[#0a192f]/20 focus:border-[#0a192f] transition-all"
            suppressHydrationWarning
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {Object.entries(levelLabels).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSelectedLevel(val)}
              className={`px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-1 shadow-sm ring-1 ${
                selectedLevel === val
                  ? "bg-black text-white ring-transparent shadow-md"
                  : "bg-white text-black/70 hover:bg-black/5 ring-black/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Package deals */}
            {activeTab === "explore" && (selectedLevel === "all" || selectedLevel === "qualifier") && searchQuery === "" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <Link
                  href="/dashboard/payment/qualifier-bundle" className="block col-span-1 md:col-span-2 relative bg-[#0a192f] text-white p-8 md:p-10 rounded-3xl cursor-pointer group hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-500 pointer-events-none">
                    <Package className="w-40 h-40" />
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-white/80">QUALIFIER BUNDLE</span>
                        <span className="inline-flex bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider">
                          BEST VALUE
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-4 uppercase">ALL 4 QUALIFIER COURSES</h3>
                      <p className="text-sm font-bold uppercase text-white/80">MATH, STATISTICS, COMPUTATIONAL THINKING, AND ENGLISH</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-12">
                      <div>
                        <p className="text-sm font-bold text-white/60 line-through mb-1">₹1999</p>
                        <div className="flex items-end gap-3">
                          <p className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white">₹1799</p>
                          <span className="text-xs font-black text-[#0a192f] bg-white rounded-full px-3 py-1 uppercase tracking-wider mb-2">SAVE ₹200</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center justify-center h-12 bg-white text-[#0a192f] text-sm font-black uppercase px-6 rounded-full shadow-md group-hover:-translate-y-1 transition-all gap-2">
                        GET PACKAGE DEAL
                        <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/payment/coding-bundle" className="block col-span-1 relative bg-white ring-1 ring-black/5 p-8 md:p-10 rounded-3xl cursor-pointer group hover:-translate-y-2 transition-all duration-300 shadow-xl"
                >
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-black/40 block mb-3">CODING BUNDLE</span>
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-[1.1] mb-4 text-[#0a192f]">PYTHON + JAVA</h3>
                      <p className="text-sm font-bold uppercase text-black/60">MASTER BOTH PROGRAMMING LANGUAGES</p>
                    </div>

                    <div className="mt-12">
                      <p className="text-sm font-bold text-black/40 line-through mb-1">₹1199</p>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl md:text-4xl font-black tracking-tight leading-none text-[#0a192f]">₹999</p>
                        <span className="inline-flex items-center justify-center h-10 bg-[#0a192f] text-white text-xs font-black uppercase px-5 rounded-full shadow-md group-hover:-translate-y-1 transition-all gap-1.5">
                          GET DEAL
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Courses Grid */}
      <div>
        <h2 className="text-2xl font-black text-black tracking-tight uppercase mb-8">
          {activeTab === "explore" ? "ALL COURSES" : "YOUR COURSES"}
        </h2>
        
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/10">
            <p className="text-black/60 font-bold uppercase tracking-widest">No courses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const isEnrolled = enrolledCourseIds.includes(course.id)
              
              return (
                
                <div key={course.id} className="h-full">
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="relative bg-white hover:-translate-y-2 transition-all duration-300 h-full flex flex-col shadow-lg hover:shadow-xl rounded-3xl overflow-hidden ring-1 ring-black/5 group group/card"
                  >
                    <div className="relative aspect-[16/9] bg-black/5 overflow-hidden">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        {course.courseType && (
                          <span className="bg-white text-black font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full shadow-sm">
                            {course.courseType}
                          </span>
                        )}
                        <span className="bg-[#0a192f] text-white font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full shadow-sm">
                          {levelLabels[course.level] || course.level}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-[10px] font-black text-[#0a192f] uppercase tracking-widest mb-2 bg-[#0a192f]/10 inline-block w-fit px-2 py-0.5 rounded-full">IITM BS</span>

                      <h3 className="text-xl font-black uppercase text-black mb-4 leading-[1.2]">
                        {course.title}
                      </h3>
                      <p className="text-xs font-bold uppercase text-black/60 mb-6 leading-relaxed flex-1">{course.description}</p>

                      <div className="flex items-center justify-between pt-5 border-t border-black/5 mt-auto">
                        <div className="flex items-center gap-2 text-xs font-black text-black/60 uppercase">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.weeks} WEEKS</span>
                        </div>
                        
                        {isEnrolled ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ENROLLED
                          </div>
                        ) : course.price ? (
                          <div className="flex items-center gap-2">
                            {course.originalPrice && (
                              <span className="text-xs font-bold text-black/40 line-through">₹{course.originalPrice}</span>
                            )}
                            <span className="text-xl font-black text-[#0a192f]">₹{course.price}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-black text-[#0a192f] bg-[#0a192f]/10 rounded-full px-3 py-1 uppercase tracking-wider">FREE</span>
                        )}
                      </div>
                    </div>

                    {/* Coming Soon overlay */}
                    {course.available === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-2 bg-[#0a192f] text-white rounded-full text-xs font-black px-4 py-2 uppercase shadow-lg">
                          <Lock className="w-4 h-4" />
                          COMING SOON
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
