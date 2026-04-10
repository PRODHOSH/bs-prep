"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  MessageCircle,
  Send,
  Upload,
  MessagesSquare,
  Clock,
  ChevronRight,
  Plus,
  X,
  CircleDot,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useSearchParams } from "next/navigation"

// ── Types ─────────────────────────────────────────────────────────────────────
type DoubtItem = {
  id: string
  subject: string
  status: "open" | "in_progress" | "resolved"
  screenshot_url: string | null
  unread_for_student: boolean
  created_at: string
  updated_at: string
  last_message: string
  last_message_sender_role: "student" | "admin"
  last_message_at: string
}

type DoubtMessage = {
  id: string
  sender_id: string
  sender_role: "student" | "admin"
  sender_name: string
  message: string
  screenshot_url: string | null
  created_at: string
}

type DoubtDetailResponse = {
  doubt: DoubtItem
  messages: DoubtMessage[]
  viewer_role: "student" | "admin"
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(value: string): string {
  const date = new Date(value)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = diff / (1000 * 60 * 60)
  if (hours < 24) return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function formatFull(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
  })
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  open:        { label: "Open",        icon: CircleDot,    class: "bg-amber-100  text-amber-700  border-amber-200",  dot: "bg-amber-500"  },
  in_progress: { label: "In Progress", icon: AlertCircle,  class: "bg-blue-100   text-blue-700   border-blue-200",   dot: "bg-blue-500"   },
  resolved:    { label: "Resolved",    icon: CheckCircle,  class: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function DashboardDoubtsPage() {
  const searchParams = useSearchParams()
  const [doubts,          setDoubts]          = useState<DoubtItem[]>([])
  const [selectedDoubtId, setSelectedDoubtId] = useState<string | null>(null)
  const [messages,        setMessages]        = useState<DoubtMessage[]>([])
  const [threadLoading,   setThreadLoading]   = useState(false)
  const [listLoading,     setListLoading]     = useState(true)
  const [showForm,        setShowForm]        = useState(false)

  const [subject,             setSubject]             = useState("")
  const [question,            setQuestion]            = useState("")
  const [newReply,            setNewReply]            = useState("")
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const [createScreenshotUrl, setCreateScreenshotUrl] = useState<string | null>(null)
  const [replyScreenshotUrl,  setReplyScreenshotUrl]  = useState<string | null>(null)
  const [creating,            setCreating]            = useState(false)
  const [replying,            setReplying]            = useState(false)
  const [statusUpdating,      setStatusUpdating]      = useState(false)
  const [error,               setError]               = useState("")

  const selectedDoubt = useMemo(
    () => doubts.find((d) => d.id === selectedDoubtId) ?? null,
    [doubts, selectedDoubtId],
  )

  // Derived stats
  const openCount     = doubts.filter((d) => d.status === "open").length
  const progressCount = doubts.filter((d) => d.status === "in_progress").length
  const resolvedCount = doubts.filter((d) => d.status === "resolved").length

  // ── Data fetching ──────────────────────────────────────────────────────────
  const loadDoubts = async () => {
    try {
      const res  = await fetch("/api/doubts", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch doubts")
      const list = (data.doubts || []) as DoubtItem[]
      setDoubts(list)
      if (!selectedDoubtId && list.length > 0) setSelectedDoubtId(list[0].id)
      if (selectedDoubtId && !list.some((i) => i.id === selectedDoubtId))
        setSelectedDoubtId(list[0]?.id ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load doubts")
    } finally {
      setListLoading(false)
    }
  }

  const loadThread = async (doubtId: string) => {
    setThreadLoading(true)
    try {
      const res  = await fetch(`/api/doubts/${doubtId}`, { cache: "no-store" })
      const data = (await res.json()) as DoubtDetailResponse | { error: string }
      if (!res.ok) throw new Error((data as { error?: string }).error || "Failed to load messages")
      setMessages((data as DoubtDetailResponse).messages || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load thread")
    } finally {
      setThreadLoading(false)
    }
  }

  useEffect(() => { void loadDoubts() }, [])

  useEffect(() => {
    if (!selectedDoubtId) { setMessages([]); return }
    void loadThread(selectedDoubtId)
    const iv = setInterval(() => {
      if (document.visibilityState === "visible") void loadThread(selectedDoubtId)
    }, 45000)
    return () => clearInterval(iv)
  }, [selectedDoubtId])

  useEffect(() => {
    const preferred = searchParams.get("thread")
    if (preferred && doubts.some((i) => i.id === preferred)) setSelectedDoubtId(preferred)
  }, [doubts, searchParams])

  // ── Upload ─────────────────────────────────────────────────────────────────
  const uploadScreenshot = async (file: File): Promise<string> => {
    const body = new FormData()
    body.append("file", file)
    const res  = await fetch("/api/doubts/upload-screenshot", { method: "POST", body })
    const data = await res.json()
    if (!res.ok || !data.url) throw new Error(data.error || "Upload failed")
    return data.url as string
  }

  const handleCreateScreenshot = async (file: File | null) => {
    if (!file) return
    setUploadingScreenshot(true); setError("")
    try { setCreateScreenshotUrl(await uploadScreenshot(file)) }
    catch (e) { setError(e instanceof Error ? e.message : "Upload failed") }
    finally { setUploadingScreenshot(false) }
  }

  const handleReplyScreenshot = async (file: File | null) => {
    if (!file) return
    setUploadingScreenshot(true); setError("")
    try { setReplyScreenshotUrl(await uploadScreenshot(file)) }
    catch (e) { setError(e instanceof Error ? e.message : "Upload failed") }
    finally { setUploadingScreenshot(false) }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const createDoubt = async () => {
    if (!subject.trim() || !question.trim()) { setError("Please enter both subject and question."); return }
    setCreating(true); setError("")
    try {
      const res  = await fetch("/api/doubts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message: question, screenshotUrl: createScreenshotUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create doubt")
      setSubject(""); setQuestion(""); setCreateScreenshotUrl(null); setShowForm(false)
      await loadDoubts()
      if (data?.doubt?.id) setSelectedDoubtId(data.doubt.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post doubt")
    } finally { setCreating(false) }
  }

  const sendReply = async () => {
    if (!selectedDoubtId || !newReply.trim()) return
    setReplying(true); setError("")
    try {
      const res  = await fetch(`/api/doubts/${selectedDoubtId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newReply, screenshotUrl: replyScreenshotUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send reply")
      setNewReply(""); setReplyScreenshotUrl(null)
      await loadThread(selectedDoubtId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send reply")
    } finally { setReplying(false) }
  }

  const updateStatus = async (status: DoubtItem["status"]) => {
    if (!selectedDoubtId) return
    setStatusUpdating(true); setError("")
    try {
      const res  = await fetch(`/api/doubts/${selectedDoubtId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update status")
      await loadDoubts(); await loadThread(selectedDoubtId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status")
    } finally { setStatusUpdating(false) }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ══ HERO HEADER ══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E5DBC8] bg-white shadow-sm">
        {/* Decorative beige stripe */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF8F5] via-white to-white pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#F7F2E8]/60 to-transparent pointer-events-none" />

        <div className="relative px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                Doubts &amp; Support
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Ask questions and get answers from your admin mentors.
              </p>

              {/* Stats row */}
              {!listLoading && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {openCount} Open
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {progressCount} In Progress
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {resolvedCount} Resolved
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowForm((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all ${
                showForm
                  ? "bg-[#F7F2E8] text-black border border-[#D8CCB2] hover:bg-[#EFE6D5]"
                  : "bg-black text-white hover:bg-black/85"
              }`}
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancel" : "New Doubt"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ ERROR BANNER ════════════════════════════════════════════════════ */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ══ NEW DOUBT FORM (collapsible) ═════════════════════════════════════ */}
      {showForm && (
        <div className="rounded-2xl border border-[#E5DBC8] bg-white shadow-sm overflow-hidden">
          {/* Form header strip */}
          <div className="border-b border-[#F0E8D8] bg-[#FAF8F5] px-6 py-3">
            <h2 className="text-sm font-semibold text-black">Post a New Doubt</h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Subject */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Probability question from Week 2"
                className="h-11 w-full rounded-lg border border-[#D8CCB2] bg-[#FAFAF7] px-3 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-black focus:bg-white"
                suppressHydrationWarning
              />
            </div>

            {/* Question */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Describe your doubt in detail…"
                rows={4}
                className="w-full resize-y rounded-lg border border-[#D8CCB2] bg-[#FAFAF7] px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-black focus:bg-white"
                suppressHydrationWarning
              />
            </div>

            {/* Actions row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#D8CCB2] bg-[#F7F2E8] px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#EFE6D5] transition">
                <ImagePlus className="h-3.5 w-3.5" />
                {uploadingScreenshot ? "Uploading…" : createScreenshotUrl ? "✓ Screenshot attached" : "Attach Screenshot"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => void handleCreateScreenshot(e.target.files?.[0] ?? null)}
                />
              </label>

              <Button
                onClick={createDoubt}
                disabled={creating || uploadingScreenshot}
                className="h-10 bg-black text-white hover:bg-black/85 rounded-lg"
                suppressHydrationWarning
              >
                {creating
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Upload className="mr-2 h-4 w-4" />}
                {creating ? "Posting…" : "Post Doubt"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MAIN PANELS ══════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-[288px_minmax(0,1fr)]" style={{ minHeight: 520 }}>

        {/* ── LEFT: Thread List ─────────────────────────────────────────── */}
        <aside className="flex flex-col rounded-2xl border border-[#E5DBC8] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#F0E8D8] bg-[#FAF8F5] px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Your Threads
            </h3>
            <span className="rounded-full bg-[#EFE6D5] px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {doubts.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
              <div className="flex h-full items-center justify-center gap-2 py-12 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : doubts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F2E8]">
                  <MessagesSquare className="h-5 w-5 text-[#C8BA97]" />
                </div>
                <p className="text-sm text-slate-400 px-4">No doubts posted yet.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-xs font-semibold text-black underline-offset-2 hover:underline"
                >
                  Post your first doubt →
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[#F5EDD8]">
                {doubts.map((doubt) => {
                  const cfg     = STATUS_CONFIG[doubt.status]
                  const active  = selectedDoubtId === doubt.id
                  return (
                    <li key={doubt.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedDoubtId(doubt.id)}
                        className={`group relative w-full px-4 py-3.5 text-left transition-all ${
                          active
                            ? "bg-[#F7F2E8]"
                            : "bg-white hover:bg-[#FDFAF6]"
                        }`}
                      >
                        {/* Active indicator strip */}
                        {active && (
                          <span className="absolute left-0 top-0 h-full w-0.5 rounded-r bg-black" />
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-1 text-sm font-semibold text-black pr-1">
                            {doubt.subject}
                          </p>
                          <div className="flex shrink-0 items-center gap-1 pt-0.5">
                            {doubt.unread_for_student && (
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                            )}
                            <ChevronRight className={`h-3.5 w-3.5 text-slate-300 transition-transform ${active ? "rotate-90 text-slate-500" : ""}`} />
                          </div>
                        </div>

                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.class}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="h-2.5 w-2.5" />
                            {formatTime(doubt.last_message_at)}
                          </span>
                        </div>

                        <p className="mt-1.5 line-clamp-1 text-xs text-slate-400">
                          {doubt.last_message || "No replies yet"}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ── RIGHT: Chat Panel ──────────────────────────────────────────── */}
        <div className="flex flex-col rounded-2xl border border-[#E5DBC8] bg-white shadow-sm overflow-hidden">
          {!selectedDoubt ? (
            /* Empty state */
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F7F2E8]">
                <MessagesSquare className="h-7 w-7 text-[#C8BA97]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">No thread selected</p>
                <p className="mt-0.5 text-xs text-slate-400">Select a doubt from the list to view the conversation.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex-shrink-0 border-b border-[#E5DBC8] bg-[#FAF8F5]">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-black">
                      {selectedDoubt.subject}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Created {formatFull(selectedDoubt.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`border text-xs ${STATUS_CONFIG[selectedDoubt.status].class}`}>
                      {STATUS_CONFIG[selectedDoubt.status].label}
                    </Badge>
                    {selectedDoubt.status !== "resolved" && (
                      <button
                        onClick={() => void updateStatus("resolved")}
                        disabled={statusUpdating}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CCB2] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#F7F2E8] transition disabled:opacity-50"
                        suppressHydrationWarning
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ background: "linear-gradient(to bottom, #FDFAF6, #FFFFFF)" }}>
                {threadLoading ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading conversation…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <MessageCircle className="h-8 w-8 text-[#D8CCB2]" />
                    <p className="text-sm text-slate-400">No messages yet — admin will reply soon.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isStudent = msg.sender_role === "student"
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2.5 ${isStudent ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isStudent
                              ? "bg-black text-white"
                              : "bg-[#EFE6D5] text-slate-700 border border-[#D8CCB2]"
                          }`}
                        >
                          {isStudent ? "Y" : getInitials(msg.sender_name || "Admin")}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[72%] space-y-1 ${isStudent ? "items-end" : "items-start"} flex flex-col`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 ${
                              isStudent
                                ? "rounded-br-sm bg-black text-white"
                                : "rounded-bl-sm border border-[#E5DBC8] bg-white text-black shadow-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {msg.message}
                            </p>
                            {msg.screenshot_url && (
                              <a
                                href={msg.screenshot_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`mt-2 block text-xs underline ${
                                  isStudent ? "text-white/80" : "text-blue-600"
                                }`}
                              >
                                View screenshot ↗
                              </a>
                            )}
                          </div>
                          <span className="px-1 text-[10px] text-slate-400">
                            {formatFull(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Reply box */}
              <div className="flex-shrink-0 border-t border-[#E5DBC8] bg-white px-5 py-4">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { void sendReply() }
                  }}
                  placeholder="Write a follow-up… (Ctrl+Enter to send)"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[#D8CCB2] bg-[#FAFAF7] px-3.5 py-2.5 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-black focus:bg-white"
                  suppressHydrationWarning
                />
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D8CCB2] bg-[#F7F2E8] px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-[#EFE6D5] transition">
                    <ImagePlus className="h-3.5 w-3.5" />
                    {replyScreenshotUrl ? "✓ Attached" : "Attach"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => void handleReplyScreenshot(e.target.files?.[0] ?? null)}
                    />
                  </label>

                  <button
                    onClick={sendReply}
                    disabled={replying || uploadingScreenshot || !newReply.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:opacity-40"
                    suppressHydrationWarning
                  >
                    {replying
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Send className="h-3.5 w-3.5" />}
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══ FOOTER NOTE ═════════════════════════════════════════════════════ */}
      <div className="flex items-start gap-3 rounded-xl border border-[#E5DBC8] bg-[#FDFAF6] px-4 py-3.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFE6D5]">
          <MessageCircle className="h-3.5 w-3.5 text-slate-600" />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Admin team responds in each thread. You&apos;ll receive a bell notification when there is a new reply.
          Use <kbd className="rounded border border-[#D8CCB2] bg-[#F7F2E8] px-1.5 py-0.5 font-mono text-[10px]">Ctrl + Enter</kbd> to send messages quickly.
        </p>
      </div>

    </div>
  )
}
