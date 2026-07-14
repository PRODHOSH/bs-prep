"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { courses } from "@/lib/course-catalog"
import { createClient } from "@/lib/supabase/client"
import { BookOpen, CheckCircle2, PlayCircle, FileText, Download, Lock, ArrowLeft, ArrowUpRight } from "lucide-react"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const course = courses.find((c) => c.id === courseId)

  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!course) return
    const checkEnrollment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from("enrollments")
            .select("*")
            .eq("user_id", user.id)
            .eq("course_id", courseId)
            .single()
          
          if (data) {
            setIsEnrolled(true)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    checkEnrollment()
  }, [courseId, course, supabase])

  if (!course) {
    return (
      <div className="flex-1 p-10 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-black text-black uppercase">Course Not Found</h2>
        <Link href="/dashboard/courses" className="mt-4 text-black/60 hover:text-black uppercase font-bold text-sm underline">
          Back to Courses
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* Hero Header */}
      <div className="relative w-full bg-[#0a192f] text-white pt-12 pb-24 px-6 md:px-12 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col">
          <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-white/60 hover:text-white uppercase font-bold text-xs tracking-widest mb-8 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <div className="flex gap-3 mb-6">
                <span className="bg-white text-[#0a192f] font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                  IITM BS
                </span>
                <span className="bg-white/10 text-white border border-white/20 font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                  {course.level}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] mb-6">
                {course.title}
              </h1>
              <p className="text-lg text-white/70 font-medium max-w-2xl leading-relaxed">
                {course.description}
              </p>
            </div>
            
            <div className="shrink-0 flex flex-col items-start md:items-end gap-4">
              <div className="flex items-center gap-2 text-white/80 font-bold uppercase tracking-widest text-sm bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <BookOpen className="w-4 h-4" />
                <span>{course.weeks} WEEKS DURATION</span>
              </div>
              
              {!isEnrolled && course.price ? (
                <div className="bg-white text-[#0a192f] p-6 rounded-3xl shadow-sm border border-black/10 flex flex-col mt-4">
                  <span className="text-[10px] font-black text-[#0a192f]/50 uppercase tracking-widest mb-1">Total Price</span>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-4xl font-black">₹{course.price}</span>
                    {course.originalPrice && (
                      <span className="text-sm font-bold text-[#0a192f]/40 line-through mb-1">₹{course.originalPrice}</span>
                    )}
                  </div>
                  <Link 
                    href={`/dashboard/payment/${course.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-black hover:bg-black/90 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-sm hover:shadow-md"
                  >
                    ENROLL NOW
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : isEnrolled ? (
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-sm mt-4">
                  <div className="w-10 h-10 bg-emerald-500 text-[#0a192f] flex items-center justify-center rounded-full shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest">Status</span>
                    <span className="text-lg font-black uppercase">ENROLLED</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-12 lg:px-16 -mt-12 relative z-20 pb-24">
        <div className="bg-white rounded-3xl shadow-xl border border-black/5 p-6 md:p-10 flex flex-col min-h-[400px]">
          
          <div className="border-b-2 border-black/5 flex gap-8 mb-8 overflow-x-auto hide-scrollbar">
            {["COURSE CONTENT", "RESOURCES", "DISCUSSIONS"].map((tab, i) => (
              <button 
                key={tab} 
                className={`pb-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                  i === 0 ? "text-black border-b-2 border-black -mb-[2px]" : "text-black/40 hover:text-black/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {!isEnrolled ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-black/40" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-3">Content Locked</h3>
              <p className="text-sm font-bold text-black/50 uppercase tracking-widest mb-8 leading-relaxed">
                You need to enroll in this course to access the lectures, assignments, and exclusive resources.
              </p>
              <Link 
                href={`/dashboard/payment/${course.id}`}
                className="bg-black hover:bg-black/80 text-white px-8 h-12 rounded-full flex items-center justify-center font-black uppercase tracking-widest text-xs transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                ENROLL TO UNLOCK
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((week) => (
                <div key={week} className="border border-black/10 rounded-2xl p-6 hover:border-black/30 transition-colors group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-black uppercase text-black">WEEK {week}</h4>
                    <span className="bg-black/5 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      3 MODULES
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-black/70 group-hover:text-black transition-colors">
                      <PlayCircle className="w-5 h-5 text-black/40" />
                      <span>Video Lectures (2h 15m)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-black/70 group-hover:text-black transition-colors">
                      <FileText className="w-5 h-5 text-black/40" />
                      <span>Practice Assignments</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-black/70 group-hover:text-black transition-colors">
                      <Download className="w-5 h-5 text-black/40" />
                      <span>Downloadable Notes PDF</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
