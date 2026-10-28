"use client"

import { useEffect, useMemo, useState } from "react"
import { getUserCached } from "@/lib/supabase/cached-user"
import { SkCards } from "@/components/dashboard/skeleton"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Clock, LayoutGrid, List, Lock, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { courses, ENROLLMENTS_CLOSED, type Course } from "@/lib/course-catalog"
import { Segmented, SearchBox, Tabs } from "@/components/dashboard/controls"
import { EmptyState, IconTile, PageHeader, Tag } from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

const LEVELS = [
  { id: "all", label: "All levels" },
  { id: "qualifier", label: "Qualifier" },
  { id: "foundation", label: "Foundation" },
  { id: "diploma", label: "Diploma" },
  { id: "degree", label: "Degree" },
] as const

const HIDDEN_IDS = new Set(["qualifier-bundle", "coding-bundle"])

function CourseCard({ course, enrolled, list }: { course: Course; enrolled: boolean; list: boolean }) {
  const comingSoon = course.available === false
  const status = enrolled ? (
    <Tag tone="green">Enrolled</Tag>
  ) : comingSoon ? (
    <Tag tone="amber">
      <Clock className="size-3" /> Coming soon
    </Tag>
  ) : ENROLLMENTS_CLOSED ? (
    <Tag tone="red">
      <Lock className="size-3" /> Closed
    </Tag>
  ) : course.price ? (
    <span className="text-sm font-extrabold">₹{course.price}</span>
  ) : (
    <Tag tone="green">Free</Tag>
  )

  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-2.5 transition-shadow hover:shadow-lg",
        list && "flex items-center gap-4",
        comingSoon && "opacity-70",
      )}
    >
      <div className={cn("relative overflow-hidden rounded-xl bg-muted", list ? "h-20 w-44 shrink-0" : "h-32")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={course.thumbnail} alt="" className="size-full object-cover" />
      </div>
      <div className={cn("min-w-0 px-1.5 pb-1 pt-3", list && "flex flex-1 items-center gap-6 py-1")}>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug">{course.title}</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            <li><Tag className="capitalize">{course.level}</Tag></li>
            <li><Tag>{course.weeks} weeks</Tag></li>
            {course.withCertificate && <li><Tag tone="primary">Certificate</Tag></li>}
          </ul>
        </div>
        <div className={cn("flex items-center justify-between gap-3", list ? "w-40 shrink-0 justify-end" : "mt-4")}>
          {status}
          {!comingSoon && <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />}
        </div>
      </div>
      {!comingSoon && <Link href={`/dashboard/courses/${course.id}`} aria-label={course.title} className="absolute inset-0 rounded-2xl" />}
    </li>
  )
}

function BundleCard({ href, eyebrow, title, blurb, price, was, className }: { href: string; eyebrow: string; title: string; blurb: string; price: number; was: number; className?: string }) {
  return (
    <Link href={href} className={cn("group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br from-chart-1/15 via-card to-card p-6 transition-shadow hover:shadow-lg", className)}>
      <Package className="pointer-events-none absolute -right-4 -top-4 size-28 text-chart-1/10" />
      <div className="relative">
        <Tag tone="primary">{eyebrow}</Tag>
        <h3 className="mt-3 text-xl font-extrabold tracking-tight">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      </div>
      <div className="relative mt-6 flex items-end justify-between">
        {ENROLLMENTS_CLOSED ? (
          <Tag tone="red"><Lock className="size-3" /> Closed</Tag>
        ) : (
          <p className="text-2xl font-extrabold">
            ₹{price} <span className="text-sm font-medium text-muted-foreground line-through">₹{was}</span>
          </p>
        )}
        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
          View bundle <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}

export default function DashboardCoursesPage() {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"explore" | "my">("my")
  const [view, setView] = useState<"grid" | "list">("grid")
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

  const filtered = useMemo(
    () =>
      courses
        .filter((c) => {
          const levelMatch = selectedLevel === "all" || c.level === selectedLevel
          const searchMatch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())
          const tabMatch = activeTab === "explore" || enrolledCourseIds.includes(c.id)
          return levelMatch && searchMatch && tabMatch && !HIDDEN_IDS.has(c.id)
        })
        .sort((a, b) => Number(b.available !== false) - Number(a.available !== false)),
    [selectedLevel, searchQuery, activeTab, enrolledCourseIds],
  )

  const myCount = courses.filter((c) => enrolledCourseIds.includes(c.id) && !HIDDEN_IDS.has(c.id)).length
  const showBundles = activeTab === "explore" && (selectedLevel === "all" || selectedLevel === "qualifier") && !searchQuery

  return (
    <div id="tour-courses-page" className="space-y-6">
      <PageHeader
        title="Courses"
        description="Structured Tamil-medium video courses for the IITM BS curriculum."
        actions={<IconTile icon={BookOpen} className="hidden sm:grid" />}
      />

      <div>
        <Tabs
          tabs={[
            { id: "my", label: "My courses", count: myCount },
            { id: "explore", label: "Explore" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Segmented options={LEVELS.map((l) => ({ id: l.id, label: l.label }))} value={selectedLevel} onChange={setSelectedLevel} className="max-w-full overflow-x-auto" />
          <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search courses" className="ml-auto w-full sm:w-64" />
          <Segmented
            options={[
              { id: "grid", label: <LayoutGrid className="size-4" />, title: "Grid" },
              { id: "list", label: <List className="size-4" />, title: "List" },
            ]}
            value={view}
            onChange={setView}
            className="[&_button]:px-2"
          />
        </div>
      </div>

      {showBundles && (
        <div className="grid gap-5 md:grid-cols-3">
          <BundleCard
            href="/dashboard/courses/qualifier-bundle"
            eyebrow="Best value"
            title="All 4 qualifier courses"
            blurb="Maths, statistics, computational thinking and English."
            price={1799}
            was={1999}
            className="md:col-span-2"
          />
          <BundleCard href="/dashboard/courses/coding-bundle" eyebrow="Coding bundle" title="Python + Java" blurb="Learn both languages together." price={899} was={1199} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold">
          {activeTab === "explore" ? "All courses" : "Your courses"} <span className="ml-1 font-medium text-muted-foreground">{filtered.length}</span>
        </h2>
        {loading ? (
          <SkCards count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={activeTab === "my" ? "You're not enrolled in any course yet" : "No courses match"}
            hint={activeTab === "my" ? "Browse the catalogue to see what's available." : "Try a different level or search term."}
            action={
              activeTab === "my" ? (
                <button onClick={() => setActiveTab("explore")} className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Explore courses
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className={cn("grid gap-5", view === "list" ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3")}>
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} enrolled={enrolledCourseIds.includes(c.id)} list={view === "list"} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
