"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Calculator, ChevronLeft, ChevronRight, Flag, Maximize2, Minimize2, X, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { btnGhost, btnPrimary, Notice, Tag } from "@/components/dashboard/ui"
import { Modal } from "@/components/dashboard/controls"
import { TimerPill } from "./timer"
import { ConfirmDialog } from "./confirm"
import { QuestionCard } from "./question-card"
import { Calculator as CalculatorPanel } from "./calculator"
import { isAnswered, passageRanges, saveSession, type ActiveSession } from "@/lib/quiz/client"
import { TYPE_LABEL, type Response } from "@/lib/quiz/types"

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
  const [paletteOpen, setPaletteOpen] = useState(false)
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
  const range = ranges.get(session.current)
  const marked = session.marked
  const isMarked = marked.includes(session.current)
  const iconBtn = "grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"

  const stateOf = (i: number) => (i === session.current ? "current" : isAnswered(session.responses[i]) ? "answered" : "new")
  const cell = (state: string) =>
    cn(
      "relative grid h-9 w-full place-items-center rounded-lg border text-sm font-bold transition-colors",
      state === "current" && "border-primary bg-primary text-primary-foreground",
      state === "answered" && "border-primary/30 bg-primary/15 text-primary hover:bg-primary/25",
      state === "new" && "bg-card text-muted-foreground hover:bg-muted/60",
    )

  const palette = (onPick: (i: number) => void) => (
    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 lg:grid-cols-4">
      {test.questions.map((_, i) => (
        <button key={i} onClick={() => onPick(i)} aria-label={`Question ${i + 1}${isAnswered(session.responses[i]) ? ", answered" : ""}${marked.includes(i) ? ", marked" : ""}`} className={cell(stateOf(i))}>
          {i + 1}
          {marked.includes(i) && <Flag className="absolute -right-1 -top-1 size-3.5 fill-chart-2 text-chart-2" />}
        </button>
      ))}
    </div>
  )

  return (
    <div className="lms fixed inset-0 z-[60] flex flex-col bg-background text-foreground">
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button onClick={() => setConfirm("exit")} className={iconBtn} aria-label="Leave test">
            <X className="size-5" />
          </button>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold">{test.title}</p>
            <p className="truncate text-xs text-muted-foreground">{test.subtitle} · {test.totalMarks} marks</p>
          </div>
        </div>
        <TimerPill remainingSec={remainingSec} elapsedSec={elapsedSec} totalSec={limitMs ? limitMs / 1000 : null} />
        <div className="flex items-center justify-end gap-1">
          <div className="hidden items-center rounded-lg border bg-card sm:flex">
            <button onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 0.9} className="grid size-9 place-items-center rounded-l-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40" aria-label="Smaller text" title="Smaller text">
              <ZoomOut className="size-4" />
            </button>
            <button onClick={() => setZoom(zoom + 0.1)} disabled={zoom >= 1.6} className="grid size-9 place-items-center rounded-r-lg border-l text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40" aria-label="Larger text" title="Larger text">
              <ZoomIn className="size-4" />
            </button>
          </div>
          <button onClick={() => setCalc((c) => !c)} aria-pressed={calc} className={cn(iconBtn, calc && "bg-muted text-foreground")} aria-label="Calculator" title="Calculator">
            <Calculator className="size-4" />
          </button>
          <button onClick={toggleFullscreen} className={cn(iconBtn, "hidden sm:grid")} aria-label="Toggle full screen" title="Full screen">
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-2 bg-muted/60 p-2">
        <aside className="hidden w-[176px] shrink-0 flex-col overflow-hidden rounded-xl border bg-card lg:flex">
          <div className="flex items-center justify-between px-3 pb-1 pt-3">
            <p className="text-xs font-bold">Questions</p>
            <p className="text-xs tabular-nums text-muted-foreground">{session.current + 1} / {total}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-1">{palette((i) => go(i))}</div>
          <dl className="space-y-0.5 border-t p-2 text-xs">
            <div className="flex items-center gap-2 rounded-md px-1.5 py-1.5">
              <span className="size-3.5 rounded border border-primary/30 bg-primary/15" />
              <dt className="flex-1 font-medium text-muted-foreground">Answered</dt>
              <dd className="font-bold tabular-nums">{answered}</dd>
            </div>
            <div className="flex items-center gap-2 rounded-md px-1.5 py-1.5">
              <span className="size-3.5 rounded border bg-card" />
              <dt className="flex-1 font-medium text-muted-foreground">Not answered</dt>
              <dd className="font-bold tabular-nums">{unanswered}</dd>
            </div>
            <div className="flex items-center gap-2 rounded-md px-1.5 py-1.5">
              <Flag className="size-3.5 fill-chart-2 text-chart-2" />
              <dt className="flex-1 font-medium text-muted-foreground">Marked</dt>
              <dd className="font-bold tabular-nums">{marked.length}</dd>
            </div>
          </dl>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b bg-muted/40 px-4">
            <p className="text-sm font-bold">Question {session.current + 1} <span className="font-medium text-muted-foreground">/ {total}</span></p>
            <Tag>{TYPE_LABEL[q.type]}</Tag>
            <Tag>{q.marks} {q.marks === 1 ? "mark" : "marks"}</Tag>
            {q.type === "MSQ" && <span className="hidden text-xs text-muted-foreground sm:inline">Select all that apply</span>}
            <button
              onClick={toggleMark}
              aria-pressed={isMarked}
              title="Mark for review (M)"
              className={cn("ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-semibold hover:bg-muted", isMarked ? "border-chart-2/50 bg-chart-2/15 text-chart-2" : "bg-card text-muted-foreground")}
            >
              <Flag className={cn("size-4", isMarked && "fill-chart-2")} /> <span className="hidden sm:inline">{isMarked ? "Marked" : "Mark for review"}</span>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-5" style={{ zoom }}>
              {error && <Notice tone="error" className="mb-4">{error}</Notice>}
              <QuestionCard
                key={q.id + ":" + session.current}
                question={q}
                number={session.current + 1}
                response={session.responses[session.current]}
                onChange={setResponse}
                passageNote={range && range[0] !== range[1] ? `Questions ${range[0] + 1} to ${range[1] + 1} use this passage` : undefined}
                bare
              />
            </div>
          </div>
          <div className="flex h-12 shrink-0 items-center gap-2 border-t bg-muted/40 px-3">
            <button onClick={() => go(session.current - 1)} disabled={session.current === 0} className={cn(btnGhost, "h-8 px-3")}>
              <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Previous</span>
            </button>
            <button onClick={() => go(session.current + 1)} disabled={session.current === total - 1} className={cn(btnGhost, "h-8 px-3")}>
              <span className="hidden sm:inline">Next</span> <ChevronRight className="size-4" />
            </button>
            <span className="ml-auto hidden text-xs text-muted-foreground xl:inline">Arrow keys move · M marks</span>
            <button onClick={() => setPaletteOpen(true)} className={cn(btnGhost, "ml-auto h-8 px-3 lg:hidden")}>
              {session.current + 1} / {total}
            </button>
            {isAnswered(session.responses[session.current]) && (
              <button onClick={() => setResponse(q.type === "NUM" ? "" : q.type === "MSQ" ? [] : null)} className="h-8 rounded-lg px-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                Clear
              </button>
            )}
            <button onClick={() => setConfirm("submit")} disabled={submitting} className={cn(btnPrimary, "h-8 px-5")}>
              {submitting ? "Submitting" : "Submit test"}
            </button>
          </div>
        </section>
      </div>

      {calc && <CalculatorPanel onClose={() => setCalc(false)} />}

      <Modal open={paletteOpen} onClose={() => setPaletteOpen(false)} title="Questions">
        {palette((i) => {
          go(i)
          setPaletteOpen(false)
        })}
      </Modal>

      {confirm === "submit" && (
        <ReviewDialog
          total={total}
          answered={answered}
          marked={marked.length}
          states={test.questions.map((_, i) => ({ done: isAnswered(session.responses[i]), marked: marked.includes(i) }))}
          onJump={(i) => {
            go(i)
            setConfirm(null)
          }}
          onSubmit={finish}
          onClose={() => setConfirm(null)}
        />
      )}

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

/** A popup over the dimmed test: how many answered, which are left, and a map to jump back to any question. */
function ReviewDialog({ total, answered, marked, states, onJump, onSubmit, onClose }: {
  total: number
  answered: number
  marked: number
  states: { done: boolean; marked: boolean }[]
  onJump: (i: number) => void
  onSubmit: () => void
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const left = total - answered
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Review your answers" onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-extrabold tracking-tight">Review before you submit</h2>
          <p className="mt-1 text-sm text-muted-foreground">{left === 0 ? "Every question has an answer." : `${left} ${left === 1 ? "question has" : "questions have"} no answer yet.`} Tap a number to go back to it.</p>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-primary/10 p-3"><p className="text-2xl font-extrabold tabular-nums text-primary">{answered}</p><p className="text-[11px] font-semibold text-muted-foreground">Answered</p></div>
            <div className="rounded-xl bg-muted p-3"><p className="text-2xl font-extrabold tabular-nums">{left}</p><p className="text-[11px] font-semibold text-muted-foreground">Not answered</p></div>
            <div className="rounded-xl bg-chart-2/15 p-3"><p className="text-2xl font-extrabold tabular-nums text-chart-2">{marked}</p><p className="text-[11px] font-semibold text-muted-foreground">Marked</p></div>
          </div>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
            {states.map((s, i) => (
              <button
                key={i}
                onClick={() => onJump(i)}
                aria-label={`Question ${i + 1}${s.done ? ", answered" : ", not answered"}${s.marked ? ", marked" : ""}`}
                className={cn("relative grid h-9 place-items-center rounded-lg border text-sm font-bold transition-colors", s.done ? "border-primary/30 bg-primary/15 text-primary hover:bg-primary/25" : "bg-card text-muted-foreground hover:bg-muted/60")}
              >
                {i + 1}
                {s.marked && <Flag className="absolute -right-1 -top-1 size-3.5 fill-chart-2 text-chart-2" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t px-6 py-4">
          <button className={btnGhost} onClick={onClose}>Keep working</button>
          <button className={cn(btnPrimary, "ml-auto px-6")} onClick={onSubmit} autoFocus>Submit test</button>
        </div>
      </div>
    </div>
  )
}
