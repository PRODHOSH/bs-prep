"use client"

import { useEffect, useState } from "react"
import { getUserCached } from "@/lib/supabase/cached-user"
import { DetailPageSkeleton } from "@/components/dashboard/skeleton"
import { useParams } from "next/navigation"
import Link from "next/link"
import { courses, ENROLLMENTS_CLOSED } from "@/lib/course-catalog"
import { courseSyllabusData } from "@/lib/syllabus-data"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowUpRight, BookOpen, Calendar, CheckCircle2, ChevronDown, Download, ExternalLink,
  FileText, FolderOpen, Lock, Radio, Video, Youtube,
} from "lucide-react"
import { Card, EmptyState, IconTile, Stat, Tag, btnGhost, btnPrimary } from "@/components/dashboard/ui"
import { SearchBox, Tabs } from "@/components/dashboard/controls"
import { cn } from "@/lib/utils"

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

interface Slide {
  id: string
  name: string
  webViewLink: string
  webContentLink?: string
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
  const [expandedClass, setExpandedClass] = useState<number | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [slidesLoading, setSlidesLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!course) return
    const checkEnrollment = async () => {
      try {
        const { data: { user } } = await getUserCached()
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

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/slides`)
        if (res.ok) {
          const data = await res.json()
          setSlides(data.files || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setSlidesLoading(false)
      }
    }
    fetchSlides()
  }, [courseId])

  const displayClasses = liveClasses.filter((c) => {
    const s = getStatus(c.date, c.time)
    const matchesSearch = c.topic.toLowerCase().includes(searchQuery.toLowerCase())
    const isValidStatus = s === "upcoming" || s === "live" || (s === "completed" && c.youtubeLink)
    return matchesSearch && isValidStatus
  }).sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date)
    }
    return b.time.localeCompare(a.time)
  })

  if (!course) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Course not found"
        hint="This course doesn't exist or has been removed."
        action={<Link href="/dashboard/courses" className={btnPrimary}>Back to courses</Link>}
      />
    )
  }

  if (loading) return <DetailPageSkeleton />

  const syllabus: any[] = courseSyllabusData[course.id]?.syllabus || []

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <article className="min-w-0">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Link href="/dashboard/courses" className="hover:text-foreground">Courses</Link> /
          <span className="truncate text-foreground">{course.title}</span>
        </nav>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="primary">IITM BS</Tag>
            <Tag className="capitalize">{course.level}</Tag>
            {isEnrolled && <Tag tone="green"><CheckCircle2 className="size-3" /> Enrolled</Tag>}
          </div>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{course.description}</p>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><BookOpen className="size-4" />{course.weeks} weeks</span>
            <span className="inline-flex items-center gap-1.5"><Video className="size-4" />{displayClasses.length} sessions</span>
          </p>
        </div>

        <Tabs
          className="mt-8"
          tabs={[
            { id: "classes", label: "Classes" },
            { id: "slides", label: "Slides" },
            { id: "batch_details", label: "Batch details" },
            { id: "other_content", label: "Other content" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        <div className="pt-6">
          {!isEnrolled && activeTab !== "batch_details" && <LockedContent />}

          {isEnrolled && activeTab === "classes" && (
            <>
              <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search classes" className="mb-5 max-w-sm" />
              {classesLoading ? (
                <RowsLoading />
              ) : displayClasses.length === 0 ? (
                <EmptyState icon={Calendar} title="No classes found" hint="No classes or recordings match your search right now." />
              ) : (
                <ul className="space-y-3">
                  {displayClasses.map((cls, i) => {
                    const status = getStatus(cls.date, cls.time)
                    const isCompleted = status === "completed"
                    const [year, month, day] = cls.date.split("-")
                    const matchingSlide = slides.find((s) => s.name.startsWith(`${day}-${month}-${year}`))
                    return (
                      <li key={i} className="rounded-2xl border bg-card p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <IconTile
                            icon={status === "live" ? Radio : isCompleted ? Youtube : Video}
                            tone={status === "live" ? "pink" : isCompleted ? "amber" : "primary"}
                            className="size-11 rounded-xl"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {status === "live" && <Tag tone="red"><span className="size-1.5 animate-pulse rounded-full bg-current" /> Live now</Tag>}
                              {status === "upcoming" && <Tag tone="primary">Upcoming</Tag>}
                              {isCompleted && <Tag>Recording</Tag>}
                              <span className="font-medium">{formatDate(cls.date)} · {formatTime(cls.time)}</span>
                            </div>
                            <h3 className="mt-1.5 text-[15px] font-bold leading-snug">{cls.topic}</h3>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {matchingSlide && (
                              <a href={matchingSlide.webViewLink} target="_blank" rel="noopener noreferrer" className={cn(btnGhost, "h-9 px-3 text-xs")}>
                                <FileText className="size-3.5" /> Slides
                              </a>
                            )}
                            {isCompleted ? (
                              <a href={cls.youtubeLink} target="_blank" rel="noopener noreferrer" className={cn(btnGhost, "h-9 px-3 text-xs")}>
                                Replay <ExternalLink className="size-3.5" />
                              </a>
                            ) : (
                              <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" className={cn(btnPrimary, "h-9 px-3 text-xs")}>
                                {status === "live" ? "Join now" : "Join later"} <ExternalLink className="size-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setExpandedClass(expandedClass === i ? null : i)}
                              aria-expanded={expandedClass === i}
                              aria-label="Class details"
                              className="grid size-9 place-items-center rounded-xl border text-muted-foreground hover:bg-muted"
                            >
                              <ChevronDown className={cn("size-4 transition-transform", expandedClass === i && "rotate-180")} />
                            </button>
                          </div>
                        </div>
                        {expandedClass === i && (
                          <dl className="mt-4 grid gap-3 rounded-xl bg-muted/60 p-4 text-sm sm:grid-cols-2">
                            <div><dt className="text-xs font-semibold text-muted-foreground">Class</dt><dd className="mt-0.5 font-semibold">{cls.course}</dd></div>
                            <div><dt className="text-xs font-semibold text-muted-foreground">Topic</dt><dd className="mt-0.5 font-semibold">{cls.topic}</dd></div>
                          </dl>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}

          {isEnrolled && activeTab === "slides" &&
            (slidesLoading ? (
              <RowsLoading />
            ) : slides.length === 0 ? (
              <EmptyState icon={FolderOpen} art="/slides.svg" title="No slides yet" hint="Slides for this course appear here once they are shared." />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {slides.map((slide) => {
                  const match = slide.name.match(/^(\d{2}-\d{2}-\d{4})/)
                  let matchingClass: LiveClass | undefined
                  if (match) {
                    const [d, m, y] = match[1].split("-")
                    matchingClass = liveClasses.find((c) => c.date === `${y}-${m}-${d}`)
                  }
                  const title = matchingClass ? matchingClass.topic : slide.name
                  const subtitle = matchingClass ? `${formatDate(matchingClass.date)} · ${formatTime(matchingClass.time)}` : "PDF document"
                  return (
                    <li key={slide.id} className="flex flex-col rounded-2xl border bg-card p-4">
                      <div className="flex items-start gap-3">
                        <IconTile icon={FileText} tone="green" className="size-11 rounded-xl" />
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug" title={title}>{title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2 border-t pt-4">
                        <a href={slide.webViewLink} target="_blank" rel="noopener noreferrer" className={cn(btnPrimary, "h-9 flex-1 text-xs")}>
                          View slide
                        </a>
                        {slide.webContentLink && (
                          <a href={slide.webContentLink} target="_blank" rel="noopener noreferrer" title="Download" aria-label="Download" className={cn(btnGhost, "h-9 w-9 px-0")}>
                            <Download className="size-4" />
                          </a>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ))}

          {activeTab === "batch_details" && (
            <div className="space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Stat label="Batch duration" value={`${course.weeks} weeks`} />
                <Stat label="Language" value="English" />
              </dl>
              <Card title="Curriculum">
                {syllabus.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Syllabus will be updated soon.</p>
                ) : (
                  <ul className="space-y-4">
                    {syllabus.map((item: any, i: number) =>
                      item.isCourseHeader ? (
                        <li key={i} className="border-b pb-2 pt-3 text-sm font-bold first:pt-0">{item.title}</li>
                      ) : (
                        <li key={i} className="flex gap-4">
                          <Tag tone="primary" className="h-fit whitespace-nowrap">Week {String(item.week).padStart(2, "0")}</Tag>
                          <div>
                            <h4 className="text-[15px] font-bold leading-snug">{item.title}</h4>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.topics}</p>
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </Card>
            </div>
          )}

          {isEnrolled && activeTab === "other_content" && (
            <EmptyState icon={FolderOpen} art="/knowledge.svg" title="No content yet" hint="Anything shared in this course will appear here." />
          )}
        </div>
      </article>

      <aside className="space-y-5 self-start xl:sticky xl:top-2">
        <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-chart-1/15 via-card to-card p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.thumbnail} alt="" className="mb-5 h-36 w-full rounded-xl object-cover" />
          {isEnrolled ? (
            <>
              <Tag tone="green"><CheckCircle2 className="size-3" /> Enrolled</Tag>
              <p className="mt-3 text-sm text-muted-foreground">You have full access to classes, recordings and slides.</p>
            </>
          ) : ENROLLMENTS_CLOSED ? (
            <>
              <Tag tone="red"><Lock className="size-3" /> Enrollments closed</Tag>
              <p className="mt-3 text-sm text-muted-foreground">This course isn&apos;t accepting new students right now.</p>
            </>
          ) : course.price ? (
            <>
              <p className="text-xs font-semibold text-muted-foreground">Total price</p>
              <p className="mt-1 text-3xl font-extrabold">
                ₹{course.price}
                {course.originalPrice && <span className="ml-2 text-sm font-medium text-muted-foreground line-through">₹{course.originalPrice}</span>}
              </p>
              <Link href={`/dashboard/payment/${course.id}`} className={cn(btnPrimary, "mt-4 w-full")}>
                Enroll now <ArrowUpRight className="size-4" />
              </Link>
            </>
          ) : null}
        </section>
        <Card title="This course">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between"><span className="text-muted-foreground">Level</span><span className="font-semibold capitalize">{course.level}</span></li>
            <li className="flex items-center justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{course.weeks} weeks</span></li>
            {course.withCertificate && <li className="flex items-center justify-between"><span className="text-muted-foreground">Certificate</span><span className="font-semibold">Included</span></li>}
          </ul>
        </Card>
      </aside>
    </div>
  )
}

function LockedContent() {
  return (
    <EmptyState
      icon={Lock}
      title="Content locked"
      hint={
        ENROLLMENTS_CLOSED
          ? "Enrollments are closed. This content is available to enrolled students only."
          : "Enroll to access live sessions, recordings and course resources."
      }
      action={ENROLLMENTS_CLOSED ? <Tag tone="red"><Lock className="size-3" /> Closed</Tag> : undefined}
    />
  )
}

function RowsLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  )
}
