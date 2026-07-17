"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { courses } from "@/lib/course-catalog"
import { createClient } from "@/lib/supabase/client"
import {
  BookOpen, CheckCircle2, Lock, ArrowLeft, ArrowUpRight,
  Video, Youtube, ExternalLink, Calendar, Clock, Radio, Loader2
} from "lucide-react"

// Map course catalog ID → live-class course codes (one course may match multiple codes)
const COURSE_CODE_MAP: Record<string, string[]> = {
  "qualifier-math-1":                  ["math-1"],
  "qualifier-stats-1":                 ["stats-1"],
  "qualifier-computational-thinking":  ["ct"],
  "qualifier-english-1":               ["english-1"],
  "qualifier-python":                  ["qualifier-python", "python"],
  "qualifier-java":                    ["qualifier-java"],
  "qualifier-math-2":                  ["math-2"],
  "qualifier-stats-2":                 ["stats-2"],
  "qualifier-english-2":               ["english-2"],
  "qualifier-bundle":                  ["math-1", "stats-1", "ct", "english-1"],
  "coding-bundle":                     ["qualifier-python", "qualifier-java"],
}

interface LiveClass {
  course: string
  topic: string
  meetingLink: string
  time: string
  date: string
  youtubeLink?: string
}

type ClassStatus = "live" | "upcoming" | "completed"

function getStatus(date: string, time: string): ClassStatus {
  const classDate = new Date(date)
  const [hours, minutes] = time.split(":").map(Number)
  classDate.setHours(hours, minutes, 0, 0)
  const diffMins = Math.floor((classDate.getTime() - Date.now()) / 60000)
  if (diffMins < -60) return "completed"
  if (diffMins <= 15 && diffMins >= -60) return "live"
  return "upcoming"
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const course = courses.find((c) => c.id === courseId)

  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"live" | "recordings">("live")
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
          if (data) setIsEnrolled(true)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    checkEnrollment()
  }, [courseId, course, supabase])

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/live-classes")
        if (!res.ok) return
        const data = await res.json()
        const allClasses: LiveClass[] = data.classes || []

        // Filter by courses that match this course catalog entry
        const codes = COURSE_CODE_MAP[courseId] ?? []
        if (codes.length === 0) {
          setLiveClasses(allClasses) // show all if no mapping
        } else {
          setLiveClasses(
            allClasses.filter((cls) =>
              codes.includes(cls.course?.toLowerCase())
            )
          )
        }
      } catch (e) {
        console.error(e)
      } finally {
        setClassesLoading(false)
      }
    }
    fetchClasses()
  }, [courseId])

  const upcoming = liveClasses.filter((c) => {
    const s = getStatus(c.date, c.time)
    return s === "upcoming" || s === "live"
  })

  const recordings = liveClasses.filter((c) => {
    const s = getStatus(c.date, c.time)
    return s === "completed" && c.youtubeLink
  })

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
      <div className="flex-1 p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-black animate-spin" />
        <p className="text-sm font-black text-black/60 uppercase tracking-widest">LOADING COURSE...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{
      backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
      backgroundSize: "22px 22px",
      backgroundColor: "#FDFBF7"
    }}>
      {/* Blue Hero Header */}
      <div className="relative w-full bg-[#0a192f] text-white pt-12 pb-28 px-6 md:px-12 lg:px-16 overflow-hidden">
        {/* Subtle dot grid overlay on blue */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Gradient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col">
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white uppercase font-bold text-xs tracking-widest mb-10 transition-colors w-fit"
          >
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6">
                {course.title}
              </h1>
              <p className="text-lg text-white/70 font-medium max-w-2xl leading-relaxed">
                {course.description}
              </p>
              <div className="flex items-center gap-2 mt-6 text-white/60 font-bold uppercase tracking-widest text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{course.weeks} Weeks · {liveClasses.length} Live Sessions · {recordings.length} Recordings</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-4">
              {!isEnrolled && course.price ? (
                <div className="bg-white text-[#0a192f] p-6 rounded-3xl shadow-lg border border-black/10 flex flex-col min-w-[220px]">
                  <span className="text-[10px] font-black text-[#0a192f]/50 uppercase tracking-widest mb-1">Total Price</span>
                  <div className="flex items-end gap-3 mb-5">
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
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-emerald-500 text-[#0a192f] flex items-center justify-center rounded-full shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-300/70">Status</span>
                    <span className="text-lg font-black uppercase">ENROLLED</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area — floats up over the blue */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-12 lg:px-16 -mt-14 relative z-20 pb-24">
        <div className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-black/5 flex gap-0 overflow-x-auto">
            {[
              { key: "live", label: "Live Classes", count: upcoming.length },
              { key: "recordings", label: "Recordings", count: recordings.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as "live" | "recordings")}
                className={`px-7 py-5 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === key
                    ? "text-black border-black"
                    : "text-black/40 border-transparent hover:text-black/70"
                }`}
              >
                {label}
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${activeTab === key ? "bg-black text-white" : "bg-black/5 text-black/40"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10">
            {/* LIVE CLASSES TAB */}
            {activeTab === "live" && (
              <>
                {!isEnrolled ? (
                  <LockedContent courseId={course.id} />
                ) : classesLoading ? (
                  <LoadingSpinner />
                ) : upcoming.length === 0 ? (
                  <EmptyState
                    icon={<Calendar className="w-8 h-8 text-black/30" />}
                    title="No Upcoming Classes"
                    description="No live classes scheduled for this course right now. Check back soon!"
                  />
                ) : (
                  <div className="space-y-4">
                    {upcoming.map((cls, i) => {
                      const status = getStatus(cls.date, cls.time)
                      return (
                        <div
                          key={i}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-black/8 hover:border-black/20 hover:shadow-md transition-all bg-white group"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              status === "live"
                                ? "bg-red-500 text-white"
                                : "bg-[#0a192f]/5 text-[#0a192f]"
                            }`}>
                              {status === "live" ? (
                                <Radio className="w-5 h-5" />
                              ) : (
                                <Video className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {status === "live" && (
                                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    LIVE NOW
                                  </span>
                                )}
                                {status === "upcoming" && (
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#0a192f] bg-[#0a192f]/8 px-2 py-0.5 rounded-full">
                                    UPCOMING
                                  </span>
                                )}
                              </div>
                              <p className="font-black text-black uppercase tracking-tight text-base leading-tight">{cls.topic}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[11px] font-bold text-black/50 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(cls.date)}
                                </span>
                                <span className="text-[11px] font-bold text-black/50 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(cls.time)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(cls.meetingLink, "_blank")}
                            className={`shrink-0 flex items-center gap-2 px-5 h-10 rounded-full font-black uppercase tracking-widest text-[11px] transition-all ${
                              status === "live"
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
                                : "bg-[#0a192f] hover:bg-[#112a52] text-white"
                            }`}
                          >
                            {status === "live" ? "JOIN NOW" : "JOIN WHEN LIVE"}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* RECORDINGS TAB */}
            {activeTab === "recordings" && (
              <>
                {!isEnrolled ? (
                  <LockedContent courseId={course.id} />
                ) : classesLoading ? (
                  <LoadingSpinner />
                ) : recordings.length === 0 ? (
                  <EmptyState
                    icon={<Youtube className="w-8 h-8 text-black/30" />}
                    title="No Recordings Yet"
                    description="Recordings of completed live classes will appear here once they're uploaded."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recordings.map((cls, i) => (
                      <a
                        key={i}
                        href={cls.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-4 p-5 rounded-2xl border border-black/8 hover:border-red-500/30 hover:shadow-md bg-white transition-all"
                      >
                        <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:border-transparent transition-colors">
                          <Youtube className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-black uppercase tracking-tight text-sm leading-tight mb-1.5 group-hover:text-red-600 transition-colors">{cls.topic}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-black/40 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(cls.date)}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-black/20 group-hover:text-red-400 transition-colors shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LockedContent({ courseId }: { courseId: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-14">
      <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-black/40" />
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-3">Content Locked</h3>
      <p className="text-sm font-bold text-black/50 uppercase tracking-widest mb-8 leading-relaxed">
        Enroll to access live sessions, recordings, and exclusive course resources.
      </p>
      <Link
        href={`/dashboard/payment/${courseId}`}
        className="bg-black hover:bg-black/80 text-white px-8 h-12 rounded-full flex items-center justify-center font-black uppercase tracking-widest text-xs transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
      >
        ENROLL TO UNLOCK
      </Link>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Loader2 className="w-8 h-8 text-black animate-spin" />
      <p className="text-sm font-black text-black/60 uppercase tracking-widest">LOADING CONTENT...</p>
    </div>
  )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="font-black uppercase text-black text-xl mb-2">{title}</h3>
      <p className="text-sm font-bold text-black/40 uppercase max-w-sm leading-relaxed">{description}</p>
    </div>
  )
}
