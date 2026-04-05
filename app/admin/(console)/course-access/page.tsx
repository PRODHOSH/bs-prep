"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CalendarDays, Loader2, Search } from "lucide-react"

type StudentCourse = {
  course_id: string
  title: string
  enrolled_at: string
  payment_status: string
}

type StudentAccess = {
  user_id: string
  name: string
  email: string
  latest_access_at: string
  courses: StudentCourse[]
}

type GrantableUser = {
  id: string
  name: string | null
  email: string | null
}

type PaidCourse = {
  id: string
  title: string
}

type AccessResponse = {
  students: StudentAccess[]
  paidCourses: PaidCourse[]
  grantableUsers: GrantableUser[]
  stats: {
    studentsWithPaidAccess: number
    totalPaidEnrollments: number
  }
}

export default function AdminCourseAccessPage() {
  const [students, setStudents] = useState<StudentAccess[]>([])
  const [paidCourses, setPaidCourses] = useState<PaidCourse[]>([])
  const [users, setUsers] = useState<GrantableUser[]>([])
  const [stats, setStats] = useState({ studentsWithPaidAccess: 0, totalPaidEnrollments: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [typedEmail, setTypedEmail] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [status, setStatus] = useState("")

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/course-access")
      if (!res.ok) {
        throw new Error("Failed to load course access data")
      }

      const data = (await res.json()) as AccessResponse
      setStudents(Array.isArray(data.students) ? data.students : [])
      setPaidCourses(Array.isArray(data.paidCourses) ? data.paidCourses : [])
      setUsers(Array.isArray(data.grantableUsers) ? data.grantableUsers : [])
      setStats(
        data.stats ?? {
          studentsWithPaidAccess: 0,
          totalPaidEnrollments: 0,
        },
      )
    } catch {
      setStudents([])
      setPaidCourses([])
      setUsers([])
      setStats({ studentsWithPaidAccess: 0, totalPaidEnrollments: 0 })
      setStatus("Failed to load course access data.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredStudents = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) {
      return students
    }

    return students.filter((student) => {
      const courseText = student.courses.map((course) => course.title.toLowerCase()).join(" ")
      return (
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        courseText.includes(query)
      )
    })
  }, [searchValue, students])

  async function grantAccess() {
    const normalizedEmail = typedEmail.trim().toLowerCase()

    if (!normalizedEmail || !selectedCourseId) {
      setStatus("Enter exact student email and select a paid course.")
      return
    }

    const matchedUser = users.find((user) => (user.email ?? "").trim().toLowerCase() === normalizedEmail)
    if (!matchedUser) {
      setStatus("No user found with that exact email.")
      return
    }

    setIsSaving(true)
    setStatus("")

    try {
      const res = await fetch("/api/admin/course-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: matchedUser.id, courseId: selectedCourseId }),
      })

      const data = (await res.json()) as { error?: string; message?: string }

      if (!res.ok) {
        setStatus(data.error || "Failed to grant course access.")
        return
      }

      setStatus(data.message || "Course access granted.")
      setTypedEmail("")
      await loadData()
    } catch {
      setStatus("Failed to grant course access.")
    } finally {
      setIsSaving(false)
    }
  }

  async function revokeAccess(userId: string, courseId: string) {
    setIsSaving(true)
    setStatus("")

    try {
      const res = await fetch("/api/admin/course-access", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId }),
      })

      const data = (await res.json()) as { error?: string; message?: string }

      if (!res.ok) {
        setStatus(data.error || "Failed to revoke course access.")
        return
      }

      setStatus(data.message || "Course access revoked.")
      await loadData()
    } catch {
      setStatus("Failed to revoke course access.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold uppercase italic tracking-tight text-white">Course Access</h1>
          <p className="mt-1 text-sm text-slate-400">
            Students who bought paid courses and admin-managed course access.
          </p>
        </div>

        <label className="flex h-11 w-full max-w-xs items-center gap-2 rounded-xl border border-white/10 bg-[#0a101c] px-3 text-sm text-slate-400">
          <Search className="h-4 w-4" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search student or course..."
            className="h-full w-full bg-transparent text-slate-200 outline-none placeholder:text-slate-500"
          />
        </label>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#070c15] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Students with Paid Access</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{stats.studentsWithPaidAccess}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#070c15] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Paid Enrollments</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{stats.totalPaidEnrollments}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#070c15] p-5">
        <h2 className="text-lg font-semibold text-slate-100">Grant Access Without Payment (Admin)</h2>
        <p className="mt-1 text-sm text-slate-400">Type the exact student email and select a paid course.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
          <input
            type="email"
            value={typedEmail}
            onChange={(event) => setTypedEmail(event.target.value)}
            placeholder="Enter exact student email"
            className="h-11 rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />

          <select
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            className="h-11 rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-slate-100 outline-none"
          >
            <option value="">Select paid course</option>
            {paidCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          <button
            onClick={grantAccess}
            disabled={isSaving}
            className="h-11 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Grant Access"}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">Email match is exact (case-insensitive). Example: studentname@gmail.com</p>

        {status && (
          <div
            className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
              status.toLowerCase().includes("failed") || status.toLowerCase().includes("error")
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {status}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#070c15]">
        <div className="border-b border-white/10 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Student Course Access</p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 px-6 py-12 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading course access...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="px-6 py-12 text-sm text-slate-400">No students with paid course access found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredStudents.map((student) => {
              const uniqueCourseIds = new Set(student.courses.map((course) => course.course_id))
              const hasAllCourseAccess = paidCourses.length > 0 && uniqueCourseIds.size >= paidCourses.length

              return (
                <article key={student.user_id} className="px-6 py-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-100">{student.name || "N/A"}</p>
                      <p className="text-xs text-slate-400">{student.email || "N/A"}</p>
                    </div>

                    <div className="flex flex-col items-start gap-2 text-xs md:items-end">
                      <span
                        className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-wider ${
                          hasAllCourseAccess
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-blue-500/40 bg-blue-500/10 text-blue-200"
                        }`}
                      >
                        {hasAllCourseAccess ? "All Courses Access" : `${uniqueCourseIds.size} Course Access`}
                      </span>
                      <p className="flex items-center gap-1 text-slate-400">
                        <CalendarDays className="h-4 w-4" />
                        Last update: {new Date(student.latest_access_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a101c]">
                    <div className="grid grid-cols-[1.4fr_1fr_120px_auto] border-b border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <p>Course</p>
                      <p>Status</p>
                      <p>Date</p>
                      <p className="text-right">Action</p>
                    </div>

                    <div className="divide-y divide-white/5">
                      {student.courses.map((course) => (
                        <div
                          key={`${student.user_id}-${course.course_id}`}
                          className="grid grid-cols-[1.4fr_1fr_120px_auto] items-center gap-2 px-4 py-3 text-sm"
                        >
                          <p className="truncate text-slate-100" title={course.title}>
                            {course.title}
                          </p>

                          <span
                            className={`inline-flex w-fit rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                              course.payment_status === "completed"
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {course.payment_status}
                          </span>

                          <p className="text-xs text-slate-400">{new Date(course.enrolled_at).toLocaleDateString()}</p>

                          <div className="text-right">
                            <button
                              onClick={() => revokeAccess(student.user_id, course.course_id)}
                              className="h-7 rounded-md border border-rose-500/40 bg-rose-500/10 px-2.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}