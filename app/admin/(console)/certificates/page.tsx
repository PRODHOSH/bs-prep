"use client"

import { useEffect, useState } from "react"
import { Award } from "lucide-react"

type CourseCert = {
  id: string
  title: string
  enabled: boolean
  enabled_at: string | null
}

export default function AdminCertificatesPage() {
  const [courses, setCourses] = useState<CourseCert[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/admin/certificates")
    if (res.ok) setCourses(await res.json())
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  async function toggle(course: CourseCert) {
    setToggling(course.id)
    setStatus("")
    const res = await fetch("/api/admin/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: course.id, enabled: !course.enabled }),
    })
    if (res.ok) {
      setStatus({ ok: true, msg: !course.enabled
        ? `✓ Certificate enabled for "${course.title}". Announcement sent to students.`
        : `Certificate disabled for "${course.title}".`
      })
      await load()
    } else {
      const d = await res.json()
      setStatus({ ok: false, msg: d.error || "Something went wrong" })
    }
    setToggling(null)
    setTimeout(() => setStatus(null), 4000)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-semibold uppercase italic tracking-tight text-white">Certificates</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enable certificates per course. Students will see a download button on their course page and receive a dashboard notification.
        </p>
      </header>

      {status && (
        <p className={`rounded-xl border px-4 py-3 text-sm ${status.ok
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
          : "border-rose-400/30 bg-rose-500/10 text-rose-300"
        }`}>
          {status.msg}
        </p>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#070c15] p-5">
        {loading ? (
          <p className="text-sm text-slate-400">Loading courses...</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0a101c] px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${course.enabled ? "bg-emerald-500/15 border border-emerald-400/30" : "bg-white/5 border border-white/10"}`}>
                    <Award className={`h-4 w-4 ${course.enabled ? "text-emerald-300" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100 text-sm">{course.title}</p>
                    {course.enabled && course.enabled_at && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enabled {new Date(course.enabled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                    {!course.enabled && (
                      <p className="text-xs text-slate-600 mt-0.5">Certificate not available</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggle(course)}
                  disabled={toggling === course.id}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 disabled:opacity-50 ${
                    course.enabled
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-600 bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      course.enabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#070c15] p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-2">How it works</h2>
        <ol className="space-y-1.5 text-sm text-slate-400 list-decimal list-inside">
          <li>Toggle ON for a course when you want students to receive certificates.</li>
          <li>A dashboard announcement is auto-sent to all users.</li>
          <li>Enrolled students see a &ldquo;Download Certificate&rdquo; button on that course page.</li>
          <li>Clicking it opens a print-ready certificate with their name — save as PDF.</li>
        </ol>
      </section>
    </div>
  )
}
