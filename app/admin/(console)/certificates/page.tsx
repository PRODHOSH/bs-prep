"use client"

import { useEffect, useState } from "react"
import { Award, Eye, X } from "lucide-react"
import { CertificateDocument } from "@/components/certificate-document"

type CourseCert = {
  id: string
  title: string
  enabled: boolean
  enabled_at: string | null
}

type PreviewData = {
  studentName: string
  courseName: string
  issueDate: string
} | null

export default function AdminCertificatesPage() {
  const [courses, setCourses] = useState<CourseCert[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [preview, setPreview] = useState<PreviewData>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/admin/certificates")
    if (res.ok) setCourses(await res.json())
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  async function toggle(course: CourseCert) {
    setToggling(course.id)
    setStatus(null)
    const res = await fetch("/api/admin/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: course.id, enabled: !course.enabled }),
    })
    if (res.ok) {
      setStatus({
        ok: true,
        msg: !course.enabled
          ? `✓ Certificate enabled for "${course.title}". Announcement sent to students.`
          : `Certificate disabled for "${course.title}".`,
      })
      await load()
    } else {
      const d = await res.json()
      setStatus({ ok: false, msg: d.error || "Something went wrong" })
    }
    setToggling(null)
    setTimeout(() => setStatus(null), 4000)
  }

  async function openPreview(courseId: string) {
    setPreviewLoading(true)
    try {
      const res = await fetch(`/api/certificate/${courseId}`)
      if (res.ok) {
        const data = await res.json()
        setPreview({ studentName: data.studentName, courseName: data.courseName, issueDate: data.issueDate })
      }
    } finally {
      setPreviewLoading(false)
    }
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
        <p className={`rounded-xl border px-4 py-3 text-sm ${
          status.ok
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
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    course.enabled
                      ? "bg-emerald-500/15 border border-emerald-400/30"
                      : "bg-white/5 border border-white/10"
                  }`}>
                    <Award className={`h-4 w-4 ${course.enabled ? "text-emerald-300" : "text-slate-500"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-100 text-sm">{course.title}</p>
                    {course.enabled && course.enabled_at ? (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enabled {new Date(course.enabled_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-600 mt-0.5">Certificate not available</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Preview button */}
                  <button
                    onClick={() => openPreview(course.id)}
                    disabled={previewLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>

                  {/* Toggle */}
                  <button
                    onClick={() => toggle(course)}
                    disabled={toggling === course.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 disabled:opacity-50 ${
                      course.enabled
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-600 bg-slate-700"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      course.enabled ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
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

      {/* ── Certificate Preview Modal ── */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-10 right-0 flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
            >
              <X className="h-4 w-4" /> Close
            </button>

            {/* Label */}
            <div className="absolute -top-10 left-0 text-xs text-white/40 font-medium tracking-wide">
              CERTIFICATE PREVIEW
            </div>

            {/* Scaled certificate */}
            <div
              style={{
                /* Certificate is 297mm × 210mm ≈ 1122px × 793px at 96dpi.
                   Scale to fit ~900px wide. Scale = 900/1122 ≈ 0.802 */
                width: "900px",
                height: `${Math.round(793 * 0.802)}px`,
                overflow: "hidden",
                boxShadow: "0 30px 100px rgba(0,0,0,0.6)",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  transform: "scale(0.802)",
                  transformOrigin: "top left",
                  width: "1122px",
                  height: "793px",
                }}
              >
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap');`}</style>
                <CertificateDocument
                  studentName={preview.studentName}
                  courseName={preview.courseName}
                  issueDate={preview.issueDate}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
