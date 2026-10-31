"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Calculator, ChevronLeft, ChevronRight, Flag, Maximize2, Minimize2, X, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { btnGhost, btnPrimary, Notice } from "@/components/dashboard/ui"
import { Modal } from "@/components/dashboard/controls"
import { TimerPill } from "./timer"
import { ConfirmDialog } from "./confirm"
import { QuestionCard } from "./question-card"
import { Calculator as CalculatorPanel } from "./calculator"
import { isAnswered, passageRanges, saveSession, type ActiveSession } from "@/lib/quiz/client"
import type { Response } from "@/lib/quiz/types"

const clock = (sec: number) => {
  const s = Math.max(0, sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, "0")
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`
}

export function Player({
  initial,
  submitting,
  error,
  onSubmit,
  onExit,
  onLeave,
}: {
  initial: ActiveSession
  submitting: boolean
  error: string | null
  onSubmit: (session: ActiveSession, timeSpentSec: number) => void
  onExit: () => void
  onLeave: () => void
}) {
  const [session, setSession] = useState(initial)
  const [now, setNow] = useState(() => Date.now())
  const [confirm, setConfirm] = useState<"submit" | "exit" | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [palette, setPalette] = useState(false)
  const [calc, setCalc] = useState(false)
  const [zoom, setZoomState] = useState(1.1)

  useEffect(() => {
    try {
      const z = Number(localStorage.getItem("bsprep:quiz:zoom"))
      if (z >= 0.9 && z <= 1.6) setZoomState(z)
    } catch {}
  }, [])
  const setZoom = (z: number) => {
    const next = Math.min(1.6, Math.max(0.9, Math.round(z * 100) / 100))
    setZoomState(next)
    try {
      localStorage.setItem("bsprep:quiz:zoom", String(next))
    } catch {}
  }
  const sent = useRef(false)

  const { test } = session
  const total = test.questions.length
  const q = test.questions[session.current]
  const limitMs = test.minutes ? test.minutes * 60_000 : null
  const elapsedSec = Math.floor((now - session.startedAt) / 1000)
  const remainingSec = limitMs ? Math.ceil((session.startedAt + limitMs - now) / 1000) : null
  const ranges = useMemo(() => passageRanges(test.questions), [test.questions])

  const update = useCallback((fn: (s: ActiveSession) => ActiveSession) => {
    setSession((prev) => {
      const next = fn(prev)
      saveSession(next)
      return next
    })
  }, [])

  const finish = useCallback(() => {
    if (sent.current) return
    sent.current = true
    setConfirm(null)
    onSubmit(session, Math.min(Math.floor((Date.now() - session.startedAt) / 1000), limitMs ? limitMs / 1000 : Infinity))
  }, [onSubmit, session, limitMs])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Time is up: submit what has been answered.
  useEffect(() => {
    if (remainingSec !== null && remainingSec <= 0) finish()
  }, [remainingSec, finish])

  // Keep the page from scrolling behind the overlay.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  // Warn before the tab is closed mid-test.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [])

  const go = useCallback((i: number) => update((s) => ({ ...s, current: Math.min(Math.max(i, 0), total - 1) })), [update, total])
  const setResponse = (r: Response) => update((s) => ({ ...s, responses: { ...s.responses, [s.current]: r } }))
  const toggleMark = () => update((s) => ({ ...s, marked: s.marked.includes(s.current) ? s.marked.filter((m) => m !== s.current) : [...s.marked, s.current] }))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirm || (e.target as HTMLElement)?.tagName === "INPUT") return
      if (e.key === "ArrowRight" || e.key === "n") go(session.current + 1)
      if (e.key === "ArrowLeft" || e.key === "p") go(session.current - 1)
      if (e.key === "m") toggleMark()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm, go, session.current])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      // some browsers refuse; the overlay already fills the window
    }
  }

  const answered = test.questions.filter((_, i) => isAnswered(session.responses[i])).length
  const unanswered = total - answered
  const lowTime = remainingSec !== null && remainingSec <= 600
  const critical = remainingSec !== null && remainingSec <= 120
  const range = ranges.get(session.current)

  const paletteGrid = (
    <div className="grid grid-cols-5 gap-2">
      {test.questions.map((_, i) => {
        const done = isAnswered(session.responses[i])
        const marked = session.marked.includes(i)
        return (
          <button
            key={i}
            onClick={() => {
              go(i)
              setPalette(false)
            }}
            aria-label={`Question ${i + 1}${done ? ", answered" : ""}${marked ? ", marked" : ""}`}
            className={cn(
              "relative grid h-10 place-items-center rounded-lg border text-sm font-semibold transition-colors",
              done ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
              i === session.current && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
            )}
          >
            {i + 1}
            {marked && <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-background bg-chart-2" />}
          </button>
        )
      })}
    </div>
  )

  const legend = (
    <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
      <p className="flex items-center gap-2"><span className="size-3 rounded bg-primary" /> Answered ({answered})</p>
      <p className="flex items-center gap-2"><span className="size-3 rounded border bg-card" /> Not answered ({unanswered})</p>
      <p className="flex items-center gap-2"><span className="size-3 rounded-full bg-chart-2" /> Marked for review ({session.marked.length})</p>
    </div>
  )

  const info = (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between gap-3"><span className="text-muted-foreground">Exam</span><span className="text-right font-semibold">{test.title}</span></div>
      <div className="flex justify-between gap-3"><span className="text-muted-foreground">Paper</span><span className="text-right font-semibold">{test.subtitle}</span></div>
      <div className="flex justify-between gap-3"><span className="text-muted-foreground">Total marks</span><span className="font-semibold">{test.totalMarks}</span></div>
    </div>
  )

  return (
    <div className="lms fixed inset-0 z-[60] flex flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3 sm:px-5">
        <button onClick={() => setConfirm("exit")} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Leave test">
          <X className="size-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-bold">{test.title}</p>
        <TimerPill remainingSec={remainingSec} elapsedSec={elapsedSec} totalSec={limitMs ? limitMs / 1000 : null} />
        <div className="flex items-center rounded-lg border bg-card">
          <button onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 0.9} className="grid size-9 place-items-center rounded-l-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40" aria-label="Smaller text" title="Zoom out">
            <ZoomOut className="size-4" />
          </button>
          <button onClick={() => setZoom(zoom + 0.1)} disabled={zoom >= 1.6} className="grid size-9 place-items-center rounded-r-lg border-l text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40" aria-label="Larger text" title="Zoom in">
            <ZoomIn className="size-4" />
          </button>
        </div>
        <button onClick={() => setCalc((c) => !c)} aria-pressed={calc} className={cn("grid size-9 place-items-center rounded-lg hover:bg-muted", calc ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")} aria-label="Calculator" title="Calculator">
          <Calculator className="size-4" />
        </button>
        <button onClick={toggleFullscreen} className="hidden size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground sm:grid" aria-label="Toggle full screen" title="Full screen">
          {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
        <button onClick={() => setConfirm("submit")} disabled={submitting} className={cn(btnPrimary, "h-9")}>
          {submitting ? "Submitting" : "Submit"}
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 space-y-5 overflow-y-auto border-r bg-card/40 p-5 lg:block">
          {info}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Question menu</p>
            {paletteGrid}
            {legend}
          </div>
          <p className="text-xs text-muted-foreground">Arrow keys move between questions. Press M to mark for review.</p>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8" style={{ zoom }}>
            {error && <Notice tone="error" className="mb-4">{error}</Notice>}
            <QuestionCard
              key={q.id + ":" + session.current}
              question={q}
              number={session.current + 1}
              response={session.responses[session.current]}
              onChange={setResponse}
              passageNote={range && range[0] !== range[1] ? `Questions ${range[0] + 1} to ${range[1] + 1} use this passage` : undefined}
            />
          </div>
        </main>
      </div>

      <footer className="flex h-16 shrink-0 items-center gap-2 border-t px-3 sm:px-5">
        <button onClick={() => go(session.current - 1)} disabled={session.current === 0} className={btnGhost}>
          <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Previous</span>
        </button>
        <button onClick={toggleMark} className={cn(btnGhost, session.marked.includes(session.current) && "border-chart-2/50 bg-chart-2/15 text-chart-2")}>
          <Flag className="size-4" /> <span className="hidden sm:inline">{session.marked.includes(session.current) ? "Marked" : "Mark for review"}</span>
        </button>
        {isAnswered(session.responses[session.current]) && (
          <button onClick={() => setResponse(q.type === "NUM" ? "" : q.type === "MSQ" ? [] : null)} className="h-10 px-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            Clear
          </button>
        )}
        <button onClick={() => setPalette(true)} className={cn(btnGhost, "ml-auto lg:hidden")}>
          {session.current + 1} / {total}
        </button>
        <button onClick={() => go(session.current + 1)} disabled={session.current === total - 1} className={cn(btnPrimary, "lg:ml-auto")}>
          <span className="hidden sm:inline">Next</span> <ChevronRight className="size-4" />
        </button>
      </footer>

      {calc && <CalculatorPanel onClose={() => setCalc(false)} />}

      <Modal open={palette} onClose={() => setPalette(false)} title="Question menu">
        {paletteGrid}
        {legend}
      </Modal>

      <ConfirmDialog
        open={confirm === "submit"}
        title="Submit your test?"
        body={
          <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold">
            <span className="rounded-lg bg-chart-4/10 px-2.5 py-1 text-chart-4">{answered} answered</span>
            <span className="rounded-lg bg-muted px-2.5 py-1 text-muted-foreground">{unanswered} skipped</span>
            {session.marked.length > 0 && <span className="rounded-lg bg-chart-2/15 px-2.5 py-1 text-chart-2">{session.marked.length} marked</span>}
          </div>
        }
        primary={{ label: "Submit", onClick: finish }}
        secondary={{ label: "Keep working", onClick: () => setConfirm(null) }}
        onClose={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm === "exit"}
        title="Leave the test?"
        body="Your answers are saved here and the clock keeps running, so you can pick it up again from Quiz prep."
        primary={{ label: "Save and leave", onClick: () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); onLeave() } }}
        secondary={{ label: "Keep going", onClick: () => setConfirm(null) }}
        danger={{ label: "Discard this test", onClick: onExit }}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}
