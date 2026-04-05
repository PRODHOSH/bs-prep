"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, FileText, Loader2, XCircle } from "lucide-react"

type Submission = {
  id: string
  student_email: string
  student_name: string
  level: string
  resource_type: string
  title: string
  description: string
  status: string
  admin_description?: string | null
  review_notes?: string | null
  reviewed_at?: string | null
  created_at: string
  pdf_url: string
}

export default function AdminResourcesPage() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected">("pending")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [statusCounts, setStatusCounts] = useState<Record<"pending" | "approved" | "rejected", number>>({
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [loadWarning, setLoadWarning] = useState("")
  const [reviewNotesById, setReviewNotesById] = useState<Record<string, string>>({})
  const [shortDescriptionById, setShortDescriptionById] = useState<Record<string, string>>({})
  const [fileNameById, setFileNameById] = useState<Record<string, string>>({})

  async function parseApiResponse(res: Response): Promise<{ data: any; fallbackMessage: string }> {
    const text = await res.text()
    try {
      const parsed = JSON.parse(text)
      return { data: parsed, fallbackMessage: `HTTP ${res.status}` }
    } catch {
      return { data: null, fallbackMessage: text || `HTTP ${res.status}` }
    }
  }

  async function loadSubmissions() {
    setIsLoading(true)
    setMessage("")
    try {
      const res = await fetch(`/api/admin/resources?status=${statusFilter}`, { cache: "no-store" })
      const { data, fallbackMessage } = await parseApiResponse(res)
      if (!res.ok) {
        setMessage((data && data.error) || fallbackMessage || "Failed to load submissions")
        setSubmissions([])
        return
      }
      setSubmissions(Array.isArray(data?.submissions) ? data.submissions : [])
      setLoadWarning(typeof data?.warning === "string" ? data.warning : "")
    } catch (error) {
      setSubmissions([])
      setMessage(error instanceof Error ? error.message : "Failed to load submissions")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadCounts() {
    try {
      const statuses: Array<"pending" | "approved" | "rejected"> = ["pending", "approved", "rejected"]
      const results = await Promise.all(
        statuses.map(async (status) => {
          const res = await fetch(`/api/admin/resources?status=${status}`, { cache: "no-store" })
          const { data } = await parseApiResponse(res)
          const count = Array.isArray(data?.submissions) ? data.submissions.length : 0
          return { status, count }
        }),
      )

      setStatusCounts({
        pending: results.find((item) => item.status === "pending")?.count ?? 0,
        approved: results.find((item) => item.status === "approved")?.count ?? 0,
        rejected: results.find((item) => item.status === "rejected")?.count ?? 0,
      })
    } catch {
      // Keep zero counts if count fetch fails.
    }
  }

  useEffect(() => {
    void loadSubmissions()
    void loadCounts()
  }, [statusFilter])

  async function updateSubmission(submissionId: string, status: "approved" | "rejected") {
    setIsSaving(true)
    setMessage("")
    try {
      const reviewNotes = reviewNotesById[submissionId]?.trim() ?? ""
      if (status === "rejected" && !reviewNotes) {
        setMessage("Reason is mandatory when rejecting a file.")
        return
      }

      const adminDescription = shortDescriptionById[submissionId]?.trim() ?? ""
      const approvedTitle = fileNameById[submissionId]?.trim() ?? ""

      const res = await fetch("/api/admin/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, status, reviewNotes, adminDescription, approvedTitle }),
      })
      const { data, fallbackMessage } = await parseApiResponse(res)
      if (!res.ok) {
        setMessage((data && data.error) || fallbackMessage || "Failed to update submission")
        return
      }
      setMessage(`Submission ${status}.`)
      setReviewNotesById((prev) => ({ ...prev, [submissionId]: "" }))
      setShortDescriptionById((prev) => ({ ...prev, [submissionId]: "" }))
      setFileNameById((prev) => {
        const next = { ...prev }
        delete next[submissionId]
        return next
      })
      await loadSubmissions()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update submission")
    } finally {
      setIsSaving(false)
    }
  }

  const title = useMemo(() => {
    if (statusFilter === "pending") return "Pending Resource Verifications"
    if (statusFilter === "approved") return "Approved Resources"
    return "Rejected Resources"
  }, [statusFilter])

  const hasSchemaWarning = loadWarning.toLowerCase().includes("schema") || loadWarning.toLowerCase().includes("migration")

  const statusOptions: Array<{
    key: "pending" | "approved" | "rejected"
    label: string
    icon: React.ComponentType<{ className?: string }>
    activeClasses: string
  }> = [
    {
      key: "pending",
      label: "Pending",
      icon: Clock3,
      activeClasses: "border-amber-400/40 bg-amber-500/10 text-amber-200",
    },
    {
      key: "approved",
      label: "Approved",
      icon: CheckCircle2,
      activeClasses: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    },
    {
      key: "rejected",
      label: "Rejected",
      icon: XCircle,
      activeClasses: "border-rose-400/40 bg-rose-500/10 text-rose-200",
    },
  ]

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-4xl font-semibold uppercase italic tracking-tight text-white">Resources Review</h1>
          <p className="mt-1 text-sm text-slate-400">Verify student-uploaded PDFs before they are visible in Resources page.</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {statusOptions.map((option) => {
            const Icon = option.icon
            const isActive = statusFilter === option.key

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setStatusFilter(option.key)}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  isActive
                    ? option.activeClasses
                    : "border-white/10 bg-[#0b1220] text-slate-300 hover:border-white/20 hover:bg-[#101a2d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{option.label}</span>
                  </div>
                  <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs">{statusCounts[option.key]}</span>
                </div>
              </button>
            )
          })}
        </div>
      </header>

      {message ? (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">{message}</div>
      ) : null}

      {loadWarning ? (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-wide">
                {hasSchemaWarning ? "Database Migration Needed" : "Notice"}
              </p>
              <p className="text-sm text-amber-200">{loadWarning}</p>
              {hasSchemaWarning ? (
                <div className="rounded-lg border border-amber-300/30 bg-black/20 px-3 py-2 text-xs text-amber-100">
                  <p className="font-semibold">Run these scripts in Supabase SQL Editor:</p>
                  <p className="mt-1">1. scripts/017_alter_resource_submissions_for_levels.sql</p>
                  <p>2. scripts/018_add_admin_description_to_resource_submissions.sql</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#070c15]">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {submissions.length} items
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 px-6 py-10 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-400">
            {hasSchemaWarning ? "No submissions shown until database migration is completed." : "No submissions found."}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {submissions.map((submission) => (
              <article key={submission.id} className="px-4 py-5 md:px-6">
                <div className="rounded-xl border border-white/10 bg-[#0a111d] p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-slate-100">{submission.title}</h3>
                      <p className="max-w-3xl text-sm leading-relaxed text-slate-300">{submission.description}</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            submission.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : submission.status === "rejected"
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {submission.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                          {submission.level}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                          {submission.resource_type}
                        </span>
                      </div>
                    </div>

                    <a
                      href={submission.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                    >
                      <FileText className="h-4 w-4" />
                      View PDF
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-xs text-slate-400">
                      <p>
                        Student: <span className="text-slate-200">{submission.student_name}</span>
                      </p>
                      <p className="mt-1">Email: {submission.student_email}</p>
                      <p className="mt-1">Submitted: {new Date(submission.created_at).toLocaleString()}</p>
                      {submission.reviewed_at ? <p className="mt-1">Reviewed: {new Date(submission.reviewed_at).toLocaleString()}</p> : null}
                    </div>

                    {submission.admin_description ? (
                      <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
                        <p className="font-semibold uppercase tracking-wide">Admin Short Description</p>
                        <p className="mt-1">{submission.admin_description}</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-xs text-slate-500">
                        No admin short description added yet.
                      </div>
                    )}
                  </div>

                  {statusFilter !== "approved" ? (
                    <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-[#0b1220] p-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Final File Name / Title (Optional)
                        </label>
                        <input
                          value={fileNameById[submission.id] ?? submission.title}
                          onChange={(event) =>
                            setFileNameById((prev) => ({
                              ...prev,
                              [submission.id]: event.target.value,
                            }))
                          }
                          placeholder="Rename title shown to students"
                          className="h-10 w-full rounded-md border border-white/10 bg-[#0a101b] px-3 text-xs text-slate-100 outline-none"
                        />
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Short Description (Optional)
                          </label>
                          <textarea
                            value={shortDescriptionById[submission.id] ?? submission.admin_description ?? ""}
                            onChange={(event) =>
                              setShortDescriptionById((prev) => ({
                                ...prev,
                                [submission.id]: event.target.value,
                              }))
                            }
                            placeholder="Public summary for resources page"
                            className="min-h-24 w-full rounded-md border border-white/10 bg-[#0a101b] px-3 py-2 text-xs text-slate-100 outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Comment To Uploader {statusFilter === "rejected" ? "(Required to Reject Again)" : "(Optional)"}
                          </label>
                          <textarea
                            value={reviewNotesById[submission.id] ?? submission.review_notes ?? ""}
                            onChange={(event) =>
                              setReviewNotesById((prev) => ({
                                ...prev,
                                [submission.id]: event.target.value,
                              }))
                            }
                            placeholder="Reason for approval/rejection"
                            className="min-h-24 w-full rounded-md border border-white/10 bg-[#0a101b] px-3 py-2 text-xs text-slate-100 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateSubmission(submission.id, "approved")}
                          disabled={isSaving}
                          className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {statusFilter === "rejected" ? "Approve Again" : "Approve"}
                        </button>
                        <button
                          onClick={() => updateSubmission(submission.id, "rejected")}
                          disabled={isSaving}
                          className="rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {statusFilter !== "pending" && submission.review_notes ? (
                    <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                      <p className="font-semibold uppercase tracking-wide">Review Note</p>
                      <p className="mt-1">{submission.review_notes}</p>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
