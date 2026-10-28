"use client"

import { createClient } from "@/lib/supabase/client"
import { getUserCached } from "@/lib/supabase/cached-user"
import { HomeSkeleton } from "@/components/dashboard/skeleton"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Calendar, Clock, FileText, MessageCircleQuestion, Users, Video } from "lucide-react"
import { Avatar, Card, CardLink, EmptyState, IconTile, btnPrimary } from "@/components/dashboard/ui"

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
        const { data: { user } } = await getUserCached()
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

  if (loading) return <HomeSkeleton />

  const hasNoEnrollments = enrolledCourses.length === 0
  const dashboardLiveClasses = hasNoEnrollments
    ? liveClasses.filter((cls) => {
        const code = cls.course?.toLowerCase()
        return code === "python" || code === "doubts"
      })
    : liveClasses
  const nextClass = dashboardLiveClasses[0]
  const firstName = userName.split(" ")[0]

  const quickLinks = [
    { label: "Courses", href: "/dashboard/courses", icon: BookOpen, tone: "primary" as const },
    { label: "Live classes", href: "/dashboard/live-classes", icon: Video, tone: "pink" as const },
    { label: "Ask a doubt", href: "/dashboard/doubts/new", icon: MessageCircleQuestion, tone: "amber" as const },
    { label: "Resources", href: "/dashboard/resources", icon: FileText, tone: "green" as const },
  ]

  return (
    <div id="tour-dashboard-full" className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div id="tour-dashboard-welcome" className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome back, {firstName}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Continue your IITM BS learning journey.</p>

        <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
          {quickLinks.map((q) => (
            <li key={q.href}>
              <Link href={q.href} className="group inline-flex items-center gap-2.5 text-sm font-bold">
                <IconTile icon={q.icon} tone={q.tone} className="size-8 rounded-lg" />
                {q.label}
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Card title="Next live class" aside={nextClass ? new Date(nextClass.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined}>
            {nextClass ? (
              <>
                <p className="text-xs font-semibold text-muted-foreground">{getCourseDisplayName(nextClass.course)}</p>
                <p className="mt-1.5 line-clamp-2 text-base font-bold">{nextClass.topic}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Clock className="size-3.5" /> {formatTime12hr(nextClass.time)}
                </p>
                <a
                  href={nextClass.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-between border-t pt-3 text-sm font-semibold hover:text-primary"
                >
                  <span className="flex items-center gap-2"><Video className="size-4" /> Join meeting</span>
                  <ArrowUpRight className="size-4" />
                </a>
              </>
            ) : (
              <p className="py-3 text-sm text-muted-foreground">No live classes scheduled.</p>
            )}
          </Card>

          <Card title="My learning" aside="Enrolled">
            <p className="text-2xl font-extrabold">
              {enrolledCourses.length}
              <span className="ml-1.5 text-sm font-medium text-muted-foreground">{enrolledCourses.length === 1 ? "course" : "courses"}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {enrolledCourses.length ? "Pick up where you left off." : "Enrollments are currently closed."}
            </p>
            <CardLink href="/dashboard/courses">
              <span className="flex items-center gap-2"><BookOpen className="size-4" /> Browse courses</span>
            </CardLink>
          </Card>
        </div>

        <section id="tour-dashboard-live" className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">Upcoming live classes</h2>
            <Link href="/dashboard/live-classes" className="text-sm font-bold text-primary">View all</Link>
          </div>
          {dashboardLiveClasses.length === 0 ? (
            <EmptyState icon={Video} title="No live classes scheduled" hint="New sessions show up here as soon as they are added." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {dashboardLiveClasses.slice(0, 3).map((liveClass, index) => (
                <article key={index} className="flex flex-col rounded-2xl border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                      <span className="size-1.5 animate-pulse rounded-full bg-destructive" /> Live
                    </span>
                    <Calendar className="size-4 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-xs font-semibold text-muted-foreground">{getCourseDisplayName(liveClass.course)}</p>
                  <h3 className="mt-1 flex-1 text-[15px] font-bold leading-snug">{liveClass.topic}</h3>
                  <p className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />{new Date(liveClass.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{formatTime12hr(liveClass.time)}</span>
                  </p>
                  <button
                    onClick={() => window.open(liveClass.meetingLink, "_blank")}
                    className="mt-4 flex h-9 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-muted"
                  >
                    <Video className="size-4" /> Join meeting
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {enrolledCourses.length === 0 ? (
          <div id="tour-explore-courses" className="mt-8">
            <EmptyState
              icon={BookOpen}
              title="Start your IITM BS journey"
              hint="You haven't enrolled in any courses yet. Browse the Tamil-medium qualifier courses."
              action={<Link href="/dashboard/courses" className={btnPrimary}>Explore courses <ArrowUpRight className="size-4" /></Link>}
            />
          </div>
        ) : (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">My courses</h2>
              <Link href="/dashboard/courses" className="text-sm font-bold text-primary">Explore more</Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {enrolledCourses.slice(0, 6).map((course) => (
                <li key={course.id} className="group relative overflow-hidden rounded-2xl border bg-card p-2.5 transition-shadow hover:shadow-lg">
                  <div className="relative h-28 overflow-hidden rounded-xl bg-muted">
                    {course.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.thumbnail} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center"><BookOpen className="size-8 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="px-1.5 pb-1 pt-3">
                    <h3 className="line-clamp-2 text-[15px] font-bold leading-snug">{course.title}</h3>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      <li className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold capitalize text-muted-foreground">{course.level}</li>
                      <li className="rounded-md bg-chart-4/10 px-2 py-0.5 text-[11px] font-semibold text-chart-4">Enrolled</li>
                    </ul>
                  </div>
                  <Link href={`/dashboard/courses/${course.id}`} aria-label={course.title} className="absolute inset-0 rounded-2xl" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="space-y-5">
        <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-chart-1/15 via-card to-card p-6">
          <div className="flex items-center gap-3">
            <Avatar name={userName || "Student"} src={userAvatar} size={44} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <h2 className="mt-5 text-xl font-extrabold tracking-tight">Join the community</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Get class reminders and study help in our WhatsApp group.</p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfyhCw9tPgKmMWYPhjV6Kzixp2RdYEi-x7JPL6JUxoLwbnB_g/viewform?usp=sharing&ouid=109000575421815991569"
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnPrimary} mt-5 w-full`}
          >
            <Users className="size-4" /> Join on WhatsApp
          </a>
        </section>

        <Card title="Shortcuts">
          <ul className="divide-y">
            {[
              { label: "GPA calculator", href: "/dashboard/tools/gpa-calculator" },
              { label: "Quiz prep", href: "/dashboard/quiz-prep" },
              { label: "Study calendar", href: "/dashboard/calendar" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center justify-between py-3 text-sm font-semibold first:pt-1 last:pb-1 hover:text-primary">
                  {l.label}
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  )
}
