"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { courses } from "@/lib/course-catalog"
import { courseSyllabusData } from "@/lib/syllabus-data"
import { createClient } from "@/lib/supabase/client"
import {
  BookOpen, CheckCircle2, Lock, ArrowLeft, ArrowUpRight,
  Video, Youtube, ExternalLink, Calendar, Clock, Radio, Loader2,
  ChevronDown, Search, FileText, FolderOpen
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
  "foundation-stats-2":                ["stats-2", "foundation-stats-2"],
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
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"classes" | "slides" | "batch_details" | "other_content">("classes")
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

  const displayClasses = liveClasses.filter((c) => {
    const s = getStatus(c.date, c.time)
    const matchesSearch = c.topic.toLowerCase().includes(searchQuery.toLowerCase())
    const isValidStatus = s === "upcoming" || s === "live" || (s === "completed" && c.youtubeLink)
    return matchesSearch && isValidStatus
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
      <div className="relative w-full bg-[#0a192f] text-white pt-12 pb-12 px-6 md:px-12 lg:px-16 overflow-hidden">
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
                <span>{course.weeks} Weeks · {displayClasses.length} Total Sessions</span>
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

      {/* Content Area */}
      <div className="flex-1 w-full bg-white relative z-20 pb-24 border-t border-black/10">
        {/* Tabs Container */}
        <div className="w-full border-b border-black/5 bg-white">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 flex gap-0 overflow-x-auto">
            {[
              { key: "classes", label: "Classes" },
              { key: "slides", label: "Slides" },
              { key: "batch_details", label: "Batch Details" },
              { key: "other_content", label: "Other Content" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-7 py-5 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-[3px] flex items-center gap-2 ${
                  activeTab === key
                    ? "text-red-600 border-red-600"
                    : "text-black/40 border-transparent hover:text-black/70 hover:border-black/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar Container (Only for Classes) */}
        {activeTab === "classes" && (
          <div className="w-full border-b border-black/5 bg-[#FDFBF7]">
            <div className="w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-4">
              <div className="relative max-w-xl">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-lg py-3 pl-12 pr-4 text-sm font-semibold text-black placeholder:text-black/30 focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content List Container */}
        <div className="w-full bg-[#FDFBF7]">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-10 min-h-[50vh]">
            {!isEnrolled && activeTab !== "batch_details" && <LockedContent courseId={course.id} />}
            
            {isEnrolled && activeTab === "classes" && (
              classesLoading ? (
              <LoadingSpinner />
            ) : displayClasses.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-8 h-8 text-black/30" />}
                title="No Classes Found"
                description="No classes or recordings match your search right now."
              />
            ) : (
              <div className="space-y-6">
                {displayClasses.map((cls, i) => {
                  const status = getStatus(cls.date, cls.time)
                  const isCompleted = status === "completed"
                  
                  return (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row gap-6 p-5 rounded-xl border border-black/10 hover:shadow-lg hover:border-black/20 transition-all bg-white relative group"
                    >
                      {/* Left Icon/Image Area with Badge */}
                      <div className="relative w-full md:w-56 h-40 md:h-auto rounded-lg bg-[#0a192f]/5 flex items-center justify-center shrink-0 border border-black/5 overflow-hidden">
                        {status === "live" ? (
                          <Radio className="w-12 h-12 text-red-500" />
                        ) : isCompleted ? (
                          <Youtube className="w-12 h-12 text-red-500/80 group-hover:text-red-600 transition-colors" />
                        ) : (
                          <Video className="w-12 h-12 text-[#0a192f]/30" />
                        )}
                        
                        {/* Top-left Badge inside image area */}
                        <div className="absolute top-3 left-3">
                          {status === "live" && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-2.5 py-1 rounded shadow-sm">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              LIVE NOW
                            </span>
                          )}
                          {status === "upcoming" && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0a192f] bg-white border border-[#0a192f]/10 px-2.5 py-1 rounded shadow-sm">
                              UPCOMING
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-sm">
                              COMPLETED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Content Area */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        {/* Top Row: Date & Time */}
                        <div className="flex items-center gap-2 text-xs font-bold text-black/50 uppercase tracking-widest mb-3">
                          <span>{formatDate(cls.date)}</span>
                          <span className="w-1 h-1 bg-black/30 rounded-full" />
                          <span>{formatTime(cls.time)}</span>
                        </div>

                        {/* Middle Row: Title */}
                        <div className="mb-6">
                          <h3 className={`text-2xl font-black text-black leading-tight tracking-tight ${isCompleted ? 'group-hover:text-red-600 transition-colors' : ''}`}>{cls.topic}</h3>
                          <p className="text-sm font-bold text-black/50 mt-1">{course.title}</p>
                        </div>

                        {/* Bottom Row: Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-black/5">
                          {/* Bottom Left */}
                          <button className="text-xs font-black uppercase tracking-widest text-black/60 hover:text-black flex items-center gap-1.5 w-fit">
                            View topics <ChevronDown className="w-4 h-4" />
                          </button>

                          {/* Bottom Right */}
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <a
                                href={cls.youtubeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2.5 rounded font-black uppercase tracking-widest text-[11px] transition-all border border-black/10 hover:border-black/20 hover:bg-black/5 text-black flex items-center gap-2"
                              >
                                Replay <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <button
                                onClick={() => window.open(cls.meetingLink, "_blank")}
                                className={`px-6 py-2.5 rounded font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-2 ${
                                  status === "live"
                                    ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
                                    : "bg-[#0a192f] hover:bg-black text-white"
                                }`}
                              >
                                {status === "live" ? "JOIN NOW" : "JOIN LATER"}
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
            )}

            {activeTab === "batch_details" && (
              <div className="max-w-3xl bg-white border border-black/10 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-black/40 mb-1 block">Batch Duration</span>
                    <span className="text-lg font-bold text-black">{course.weeks} Weeks</span>
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-black/40 mb-1 block">Language</span>
                    <span className="text-lg font-bold text-black">English</span>
                  </div>
                  <div className="md:col-span-2 pt-4 border-t border-black/5">
                    <span className="text-xs font-black uppercase tracking-widest text-black/40 mb-6 block">Curriculum</span>
                    <div className="space-y-6">
                      {(courseSyllabusData[course.id]?.syllabus || []).map((item: any, i: number) => (
                        item.isCourseHeader ? (
                          <div key={i} className="text-sm font-black text-black/80 uppercase tracking-widest pt-4 pb-2 border-b border-black/5">
                            {item.title}
                          </div>
                        ) : (
                          <div key={i} className="flex gap-5">
                            <div className="bg-[#0a192f] text-white font-black text-[11px] px-3 py-1.5 rounded-full h-fit whitespace-nowrap uppercase tracking-widest shadow-sm">
                              WK {String(item.week).padStart(2, "0")}
                            </div>
                            <div>
                              <h4 className="font-black text-black text-[15px] uppercase tracking-tight">{item.title}</h4>
                              <p className="text-sm font-bold text-black/50 mt-1.5 leading-relaxed">{item.topics}</p>
                            </div>
                          </div>
                        )
                      ))}
                      {(!courseSyllabusData[course.id]?.syllabus || courseSyllabusData[course.id].syllabus.length === 0) && (
                        <p className="text-sm font-bold text-black/40 uppercase tracking-widest">Syllabus will be updated soon.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isEnrolled && activeTab === "slides" && (
              <EmptyState
                imageUrl="/slides.svg"
                title="No Slides Yet"
                description="Slides for this course will appear here once they are shared."
              />
            )}
            
            {isEnrolled && activeTab === "other_content" && (
              <EmptyState
                imageUrl="/knowledge.svg"
                title="No contents yet"
                description="Contents shared in this course will appear here."
              />
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

function EmptyState({ icon, imageUrl, title, description }: { icon?: React.ReactNode; imageUrl?: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-64 h-auto mb-8 opacity-90" />
      ) : icon ? (
        <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-5">
          {icon}
        </div>
      ) : null}
      <h3 className="font-black uppercase text-black text-xl mb-2">{title}</h3>
      <p className="text-sm font-bold text-black/40 uppercase max-w-sm leading-relaxed">{description}</p>
    </div>
  )
}
