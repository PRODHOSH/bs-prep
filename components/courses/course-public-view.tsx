"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, Award, CalendarClock, CheckCircle2, Clock, Lock, Video } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ENROLLMENTS_CLOSED, courses } from "@/lib/course-catalog"

type SyllabusItem = { isCourseHeader?: boolean; title: string; week?: number; topics?: string }
type CourseData = {
  title: string
  level: string
  description: string
  thumbnail: string
  price: number
  originalPrice?: number
  syllabus: SyllabusItem[]
}

/** Bundles list several courses; group their weeks under each course name. */
function groupSyllabus(items: SyllabusItem[]) {
  const groups: { title: string | null; weeks: SyllabusItem[] }[] = []
  for (const item of items) {
    if (item.isCourseHeader) groups.push({ title: item.title, weeks: [] })
    else {
      if (!groups.length) groups.push({ title: null, weeks: [] })
      groups[groups.length - 1].weeks.push(item)
    }
  }
  return groups
}

function EnrollBlock({ course, onEnroll, compact = false }: { course: CourseData; onEnroll: () => void; compact?: boolean }) {
  if (ENROLLMENTS_CLOSED) {
    return (
      <div className={`flex items-center gap-2 rounded-2xl bg-red-50 text-red-700 ring-1 ring-red-200 ${compact ? "px-4 py-3 text-xs" : "px-5 py-4 text-sm"} font-bold`}>
        <Lock className="size-4 shrink-0" />
        Enrollments are closed
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onEnroll}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#0a192f] font-bold text-white shadow-lg transition-all hover:bg-[#112a52] hover:shadow-xl active:scale-[0.98] ${compact ? "px-6 py-3 text-sm" : "w-full py-4 text-base"}`}
    >
      Enroll now
      {!compact && <span className="text-white/60">· ₹{course.price}</span>}
      <ArrowRight className="size-4" />
    </button>
  )
}

export function CoursePublicView({
  courseId,
  course,
  isAuthenticated,
  onEnroll,
}: {
  courseId: string
  course: CourseData
  isAuthenticated: boolean
  onEnroll: () => void
}) {
  const isBundle = courseId.includes("bundle")
  const groups = groupSyllabus(course.syllabus)
  const saving = course.originalPrice ? course.originalPrice - course.price : 0
  const level = course.level.charAt(0).toUpperCase() + course.level.slice(1)
  const related = courses.filter((c) => c.available && c.id !== courseId && !c.id.endsWith("-bundle") && c.level === course.level).slice(0, 3)

  const facts = [
    { icon: Clock, label: "Duration", value: isBundle ? "Varies" : "4 weeks" },
    { icon: CalendarClock, label: "Format", value: "Self-paced + live" },
    { icon: Award, label: "Outcome", value: "Certificate" },
  ]

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="mx-auto max-w-7xl px-5 pb-32 pt-6 sm:px-8 md:px-12 lg:pb-24">
        <Link
          href={isAuthenticated ? "/dashboard/courses" : "/courses"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/55 transition-colors hover:text-black"
        >
          <ArrowLeft className="size-4" />
          All courses
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-16">
          {/* Title and facts */}
          <header className="lg:col-span-7">
            <div className="mb-6 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-[#0a192f]/10 px-4 py-1.5 text-xs font-bold text-[#0a192f]">{level}</span>
              <span className="rounded-full bg-[#0a192f]/10 px-4 py-1.5 text-xs font-bold text-[#0a192f]">Tamil medium</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">{course.title}</h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-black/60 sm:text-lg">{course.description}</p>

            <dl className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0a192f]/10 text-[#0a192f]">
                    <Icon className="size-[18px]" />
                  </span>
                  <div>
                    <dt className="text-xs font-semibold text-black/45">{label}</dt>
                    <dd className="text-sm font-bold">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </header>

          {/* Enroll card: sticks beside the content on desktop */}
          <aside className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_20px_60px_-24px_rgba(10,25,47,0.25)] lg:sticky lg:top-28">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-[#f5f5f5]">
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
              </div>
              <div className="px-2 pb-2 pt-6">
                <div className="flex items-end justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold tracking-tight">₹{course.price}</span>
                    {course.originalPrice && <span className="text-base font-semibold text-black/35 line-through">₹{course.originalPrice}</span>}
                  </div>
                  {saving > 0 && <span className="rounded-full bg-[#0a192f]/10 px-3 py-1 text-xs font-bold text-[#0a192f]">Save ₹{saving}</span>}
                </div>

                <div className="mt-5">
                  <EnrollBlock course={course} onEnroll={onEnroll} />
                </div>

                <ul className="mt-6 space-y-3 border-t border-black/10 pt-6 text-sm font-semibold text-black/70">
                  {["Tamil-medium video lectures", "Live classes with mentors", "Certificate on completion"].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="size-[18px] shrink-0 text-[#0a192f]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Syllabus */}
          <section className="lg:col-span-7">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Syllabus</h2>
            <p className="mt-3 text-base font-medium text-black/60">Week by week, aligned with the IIT Madras BS curriculum.</p>

            <div className="mt-10 space-y-12">
              {groups.map((group, gi) => (
                <div key={gi}>
                  {group.title && <h3 className="mb-5 text-xl font-extrabold tracking-tight">{group.title}</h3>}
                  <ol className="space-y-3">
                    {group.weeks.map((w) => (
                      <li key={`${gi}-${w.week}`} className="flex gap-4 rounded-3xl border border-black/10 bg-white p-5 transition-colors hover:border-[#0a192f]/30 sm:gap-5 sm:p-6">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#0a192f] text-sm font-bold text-white">{w.week}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-black/40">Week {w.week}</p>
                          <p className="mt-0.5 text-lg font-bold leading-snug">{w.title}</p>
                          {w.topics && <p className="mt-2 text-sm font-medium leading-relaxed text-black/60">{w.topics}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">More {course.level} courses</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <Link key={c.id} href={`/courses/${c.id}`} className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition-shadow hover:shadow-xl">
                  <div className="aspect-[16/9] overflow-hidden bg-[#f5f5f5]">
                    <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="p-5">
                    <p className="text-base font-bold">{c.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#0a192f]">
                      View course <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile enroll bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-black/10 bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="text-xl font-extrabold leading-none">₹{course.price}</p>
          {course.originalPrice && <p className="mt-1 text-xs font-semibold text-black/40 line-through">₹{course.originalPrice}</p>}
        </div>
        <EnrollBlock course={course} onEnroll={onEnroll} compact />
      </div>

      <Footer />
    </div>
  )
}
