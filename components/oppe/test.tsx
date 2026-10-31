"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { oneDark } from "@codemirror/theme-one-dark"
import { ArrowLeft, ArrowUpRight, Bookmark, Check, ChevronLeft, ChevronRight, Maximize2, Minimize2, Moon, Play, Sun, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, Notice, PageHeader, Stat, Tag, btnGhost, btnPrimary } from "@/components/dashboard/ui"
import { TimerPill } from "@/components/quiz/timer"
import { ConfirmDialog } from "@/components/quiz/confirm"
import { runPython, type RunResult } from "./runner"
import { COURSE_NAMES, type OppeProblem } from "@/lib/oppe/types"

const BASE = "/dashboard/quiz-prep/oppe"
const TEST = `${BASE}/test`
const MINUTES = 60
const KEYS = { session: "bsprep:oppe:session:v1", result: "bsprep:oppe:result:v1", theme: "bsprep:oppe:dark", split: "bsprep:oppe:split" }
const TONE = { Easy: "green", Medium: "amber", Hard: "red" } as const

interface Session {
  id: string
  course: string
  exam: 1 | 2
  startedAt: number
  minutes: number | null
  problems: OppeProblem[]
  codes: Record<string, string>
  current: number
  /** Problem ids the student bookmarked or has opened. Missing in older saved sessions. */
  marked?: string[]
  seen?: string[]
}
interface Finished {
  session: Session
  results: Record<string, RunResult | { error: string }>
  finishedAt: number
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}
const drop = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {}
}

function Back({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> {children}
    </Link>
  )
}

/** After choosing a course: OPPE 1 or OPPE 2, or browse every problem. */
export function OppeExams({ course, counts }: { course: string; counts: { 1: number; 2: number } | null }) {
  return (
    <div className="space-y-6">
      <Back href={BASE}>OPPE</Back>
      <PageHeader title={COURSE_NAMES[course] ?? "Course"} description="Choose an exam." />
      <div className="grid gap-4 sm:grid-cols-2">
        {([1, 2] as const).map((n) => (
          <Link key={n} href={`${BASE}/${course}/start/${n}`} className="group rounded-2xl border bg-card p-6 transition-colors hover:border-foreground/30">
            <div className="flex items-start justify-between">
              <p className="text-2xl font-extrabold tracking-tight">OPPE {n}</p>
              <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">A timed set of 3 problems{counts ? ` from ${counts[n]}` : ""}.</p>
          </Link>
        ))}
      </div>
      <Link href={`${BASE}/${course}/all`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Or browse every problem <ArrowUpRight className="size-4" />
      </Link>
    </div>
  )
}

const RULES = [
  "You get 3 problems of mixed difficulty. Move between them from the sidebar.",
  "Write your solution in the editor. Run checks it against the sample tests.",
  "Your code is saved on this device. When time is up, or you submit, every problem is checked once more.",
  "Running code is available for Python courses. Other courses are marked as not auto-checked.",
]

/** Exam instructions, then begin. */
export function OppeSetup({ course, exam }: { course: string; exam: 1 | 2 }) {
  const router = useRouter()
  const [timed, setTimed] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function begin() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/oppe?course=${encodeURIComponent(course)}&exam=${exam}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error || "Could not start the test")
      const session: Session = {
        id: Date.now().toString(36),
        course,
        exam,
        startedAt: Date.now(),
        minutes: timed ? MINUTES : null,
        problems: body.problems,
        codes: {},
        current: 0,
      }
      drop(KEYS.result)
      write(KEYS.session, session)
      router.push(TEST)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the test")
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <Back href={`${BASE}/${course}`}>{COURSE_NAMES[course] ?? "Back"}</Back>
      <PageHeader title="Exam instructions" description={`${COURSE_NAMES[course] ?? course} · OPPE ${exam}`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card title="Read before you begin">
          <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-muted-foreground">
            {RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </Card>
        <Card className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-muted p-3"><p className="text-2xl font-extrabold">3</p><p className="text-[11px] font-semibold text-muted-foreground">Problems</p></div>
            <div className="rounded-xl bg-muted p-3"><p className="text-2xl font-extrabold">{timed ? MINUTES : "∞"}</p><p className="text-[11px] font-semibold text-muted-foreground">Minutes</p></div>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold">
            Timer
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="size-4 accent-primary" />
          </label>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
            <span>I have read the instructions.</span>
          </label>
          {error && <Notice tone="error">{error}</Notice>}
          <button className={cn(btnPrimary, "w-full")} disabled={!agreed || busy} onClick={begin}>
            <Play className="size-4" /> {busy ? "Preparing" : "Begin test"}
          </button>
        </Card>
      </div>
    </div>
  )
}

/** The full-screen OPPE test, and its result once submitted. */
export function OppeTest() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [finished, setFinished] = useState<Finished | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const s = read<Session>(KEYS.session)
    if (s) setSession(s)
    else {
      const f = read<Finished>(KEYS.result)
      if (f) setFinished(f)
      else router.replace(BASE)
    }
    setReady(true)
  }, [router])

  if (!ready) return null
  if (session)
    return (
      <Runner
        initial={session}
        onDone={(f) => {
          write(KEYS.result, f)
          drop(KEYS.session)
          setSession(null)
          setFinished(f)
        }}
        onLeave={() => router.push(BASE)}
        onDiscard={() => {
          drop(KEYS.session)
          router.replace(BASE)
        }}
      />
    )
  if (finished) return <OppeResults finished={finished} onBack={() => router.push(`${BASE}/${finished.session.course}`)} />
  return null
}

type Res = RunResult | { error: string }
/** What the test cases show for a problem: the sample tests, and a run on the student's own input. */
type Shown = { samples?: Res; own?: Res }

/** Makes the editor sit on the same surface as the rest of the screen, in light and dark. */
const surface = EditorView.theme({
  "&": { backgroundColor: "var(--card)", height: "100%" },
  ".cm-gutters": { backgroundColor: "var(--card)", color: "var(--muted-foreground)", border: "none" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)" },
})

interface Status {
  label: string
  tone: "green" | "amber" | "red" | "muted"
  detail?: string
}

/** One line on how a problem is going, for the submit review. */
function statusOf(p: OppeProblem, answered: boolean, s?: Res): Status {
  if (!answered) return { label: "Not started", tone: "red" }
  if (p.language !== "python") return { label: "Not auto-checked", tone: "muted" }
  if (!s) return { label: "Not run", tone: "amber" }
  if (!("tests" in s) || s.error) return { label: "Error", tone: "red", detail: (s.error ?? "").split("\n").filter(Boolean).pop() }
  const scored = s.tests.filter((t) => t.checked)
  if (!scored.length) return { label: "Ran", tone: "muted" }
  const pass = scored.filter((t) => t.ok).length
  if (pass === scored.length) return { label: `Passed ${pass}/${scored.length}`, tone: "green" }
  const bad = scored.find((t) => !t.ok)!
  return { label: `Failed ${pass}/${scored.length}`, tone: "red", detail: `Input ${bad.input}  ·  expected ${bad.expected}  ·  got ${bad.got}` }
}

function Runner({ initial, onDone, onLeave, onDiscard }: { initial: Session; onDone: (f: Finished) => void; onLeave: () => void; onDiscard: () => void }) {
  const [session, setSession] = useState(initial)
  const [now, setNow] = useState(() => Date.now())
  const [dark, setDark] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [confirm, setConfirm] = useState<"submit" | "exit" | null>(null)
  const [running, setRunning] = useState(false)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [outputs, setOutputs] = useState<Record<string, Shown>>({})
  const [ownText, setOwnText] = useState<Record<string, string>>({})
  const [split, setSplit] = useState(42)
  const sent = useRef(false)
  const runRef = useRef<() => void>(() => {})
  const scroller = useRef<HTMLDivElement>(null)
  const results = useRef<HTMLDivElement>(null)

  const problem = session.problems[session.current]
  const code = session.codes[problem.id] ?? problem.starterCode
  const limitMs = session.minutes ? session.minutes * 60_000 : null
  const remainingSec = limitMs ? Math.ceil((session.startedAt + limitMs - now) / 1000) : null
  const elapsedSec = Math.floor((now - session.startedAt) / 1000)
  const runnable = problem.language === "python"
  const marked = session.marked ?? []
  const seen = session.seen ?? []
  const isMarked = marked.includes(problem.id)
  const isAnswered = (p: OppeProblem) => (session.codes[p.id] ?? p.starterCode) !== p.starterCode
  const canCustom = runnable && problem.functionName !== ""
  const own = ownText[problem.id] ?? ""
  const shown = outputs[problem.id] ?? {}
  const answeredCount = session.problems.filter(isAnswered).length
  const skippedCount = session.problems.filter((p) => seen.includes(p.id) && !isAnswered(p)).length
  const newCount = session.problems.filter((p) => !seen.includes(p.id)).length

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEYS.theme)
      setDark(v === "1" || (v === null && (document.documentElement.classList.contains("dark") || !!document.querySelector(".lms-dark"))))
      const s = Number(localStorage.getItem(KEYS.split))
      if (s >= 25 && s <= 65) setSplit(s)
    } catch {}
    const t = setInterval(() => setNow(Date.now()), 1000)
    const fs = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", fs)
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    const keys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        runRef.current()
      }
    }
    window.addEventListener("keydown", keys)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      clearInterval(t)
      document.removeEventListener("fullscreenchange", fs)
      window.removeEventListener("beforeunload", warn)
      window.removeEventListener("keydown", keys)
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.split, String(Math.round(split)))
    } catch {}
  }, [split])

  const update = useCallback((fn: (s: Session) => Session) => {
    setSession((prev) => {
      const next = fn(prev)
      write(KEYS.session, next)
      return next
    })
  }, [])

  // A problem counts as viewed the first time it is opened, and each one opens at the top.
  useEffect(() => {
    if (!(session.seen ?? []).includes(problem.id)) update((s) => ({ ...s, seen: [...(s.seen ?? []), problem.id] }))
  }, [problem.id, session.seen, update])
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [problem.id])

  const finish = useCallback(async () => {
    if (sent.current) return
    sent.current = true
    setConfirm(null)
    setSubmitting(true)
    const results: Finished["results"] = {}
    for (const p of session.problems) {
      if (p.language !== "python") continue
      try {
        results[p.id] = await runPython(session.codes[p.id] ?? p.starterCode, p.setupCode, p.functionName, p.tests)
      } catch (e) {
        results[p.id] = { error: e instanceof Error ? e.message : "Could not run" }
      }
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    onDone({ session, results, finishedAt: Date.now() })
  }, [session, onDone])

  useEffect(() => {
    if (remainingSec !== null && remainingSec <= 0) void finish()
  }, [remainingSec, finish])

  async function exec(p: OppeProblem, tests: { input: string; output: string }[]): Promise<Res> {
    try {
      return await runPython(session.codes[p.id] ?? p.starterCode, p.setupCode, p.functionName, tests)
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Could not run" }
    }
  }

  async function run() {
    if (!runnable || running || checking) return
    setRunning(true)
    const samples = await exec(problem, problem.tests)
    setOutputs((o) => ({ ...o, [problem.id]: { ...o[problem.id], samples } }))
    setRunning(false)
    // Bring the results into view under the editor.
    requestAnimationFrame(() => {
      if (scroller.current && results.current) scroller.current.scrollTo({ top: results.current.offsetTop - 8, behavior: "smooth" })
    })
  }
  runRef.current = run

  async function runOwn() {
    if (!canCustom || running || own.trim() === "") return
    setRunning(true)
    const res = await exec(problem, [{ input: own.trim(), output: "" }])
    setOutputs((o) => ({ ...o, [problem.id]: { ...o[problem.id], own: res } }))
    setRunning(false)
  }

  /** Runs every problem that has code, so the review shows where things stand. */
  async function checkAll() {
    setChecking(true)
    for (const p of session.problems) {
      if (p.language !== "python" || !isAnswered(p)) continue
      const samples = await exec(p, p.tests)
      setOutputs((o) => ({ ...o, [p.id]: { ...o[p.id], samples } }))
    }
    setChecking(false)
  }

  function toggleTheme() {
    setDark((d) => {
      try {
        localStorage.setItem(KEYS.theme, d ? "0" : "1")
      } catch {}
      return !d
    })
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {}
  }
  const go = (i: number) => update((s) => ({ ...s, current: Math.min(Math.max(i, 0), s.problems.length - 1) }))
  const toggleMark = () => update((s) => ({ ...s, marked: (s.marked ?? []).includes(problem.id) ? (s.marked ?? []).filter((id) => id !== problem.id) : [...(s.marked ?? []), problem.id] }))

  function dragMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    const r = e.currentTarget.parentElement!.getBoundingClientRect()
    setSplit(Math.min(65, Math.max(25, ((e.clientX - r.left) / r.width) * 100)))
  }

  const samples = shown.samples
  const sampleTests = samples && "tests" in samples && !samples.error ? samples.tests : null
  const scored = sampleTests?.filter((t) => t.checked) ?? []
  const passed = scored.filter((t) => t.ok).length
  const ownRes = shown.own && "tests" in shown.own && !shown.own.error ? shown.own : null
  const iconBtn = "grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"

  return (
    <div className={cn("lms fixed inset-0 z-[60] flex flex-col bg-background text-foreground", dark && "lms-dark")}>
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button onClick={() => setConfirm("exit")} className={iconBtn} aria-label="Leave test">
            <X className="size-5" />
          </button>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold">{COURSE_NAMES[session.course]}</p>
            <p className="truncate text-xs text-muted-foreground">OPPE {session.exam} · {session.problems.length} problems</p>
          </div>
        </div>
        <TimerPill remainingSec={remainingSec} elapsedSec={elapsedSec} totalSec={limitMs ? limitMs / 1000 : null} />
        <div className="flex items-center justify-end gap-1">
          <button onClick={toggleFullscreen} className={cn(iconBtn, "hidden sm:grid")} aria-label="Toggle full screen" title="Full screen">
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 bg-muted/60 p-2 lg:flex-row">
        <aside className="flex shrink-0 overflow-hidden rounded-xl border bg-card lg:w-[152px] lg:flex-col">
          <div className="hidden items-center justify-between px-3 pb-1 pt-3 lg:flex">
            <p className="text-xs font-bold">Problems</p>
            <p className="text-xs text-muted-foreground tabular-nums">{session.current + 1} / {session.problems.length}</p>
          </div>
          <nav className="flex gap-1.5 overflow-x-auto p-2 lg:grid lg:grid-cols-3 lg:content-start lg:justify-items-center lg:overflow-visible lg:px-3 lg:pb-3 lg:pt-1" aria-label="Questions">
            {session.problems.map((p, i) => {
              const state = i === session.current ? "current" : isAnswered(p) ? "answered" : seen.includes(p.id) ? "skipped" : "new"
              return (
                <button
                  key={p.id}
                  onClick={() => go(i)}
                  title={p.title}
                  aria-label={`Question ${i + 1}: ${p.title}`}
                  aria-current={i === session.current}
                  className={cn(
                    "relative grid size-9 shrink-0 place-items-center rounded-lg border text-sm font-bold transition-colors",
                    state === "current" && "border-primary bg-primary text-primary-foreground",
                    state === "answered" && "border-primary/30 bg-primary/15 text-primary hover:bg-primary/25",
                    state === "skipped" && "border-transparent bg-muted text-foreground hover:bg-muted/70",
                    state === "new" && "bg-card text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  {i + 1}
                  {marked.includes(p.id) && <Bookmark className="absolute -right-1 -top-1 size-3.5 fill-chart-2 text-chart-2" />}
                </button>
              )
            })}
          </nav>
          <dl className="mt-auto hidden space-y-0.5 border-t p-2 text-xs lg:block">
            {[
              ["Answered", `${answeredCount}/${session.problems.length}`, "size-3.5 rounded border border-primary/30 bg-primary/15"],
              ["Skipped", String(skippedCount), "size-3.5 rounded bg-muted"],
              ["Not viewed", String(newCount), "size-3.5 rounded border bg-card"],
            ].map(([k, v, swatch]) => (
              <div key={k} className="flex items-center gap-2 rounded-md px-1.5 py-1.5">
                <span className={swatch} />
                <dt className="flex-1 font-medium text-muted-foreground">{k}</dt>
                <dd className="font-bold tabular-nums">{v}</dd>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-md px-1.5 py-1.5">
              <Bookmark className="size-3.5 fill-chart-2 text-chart-2" />
              <dt className="flex-1 font-medium text-muted-foreground">Bookmarked</dt>
              <dd className="font-bold tabular-nums">{marked.length}</dd>
            </div>
          </dl>
        </aside>

        <main className="grid min-h-0 flex-1 grid-rows-2 gap-2 lg:grid-cols-[var(--split)_8px_minmax(0,1fr)] lg:grid-rows-1 lg:gap-0" style={{ "--split": `${split}%` } as React.CSSProperties}>
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
            <div className="flex h-11 shrink-0 items-center gap-2 border-b bg-muted/40 px-4">
              <p className="text-sm font-bold">Question {session.current + 1} <span className="font-medium text-muted-foreground">/ {session.problems.length}</span></p>
              <Tag tone={TONE[problem.difficulty]}>{problem.difficulty}</Tag>
              <button
                onClick={toggleMark}
                aria-pressed={isMarked}
                aria-label={isMarked ? "Remove bookmark" : "Bookmark this question"}
                title={isMarked ? "Remove bookmark" : "Bookmark"}
                className={cn("ml-auto grid size-8 place-items-center rounded-lg border bg-card hover:bg-muted", isMarked ? "text-chart-2" : "text-muted-foreground")}
              >
                <Bookmark className={cn("size-4", isMarked && "fill-chart-2")} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <h2 className="text-xl font-extrabold tracking-tight">{problem.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{problem.description || "No description provided."}</p>
              {problem.tests[0] && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-bold">Sample</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Box label="Input" value={problem.tests[0].input || "(none)"} />
                    {problem.tests[0].output.trim() !== "" && <Box label="Output" value={problem.tests[0].output} />}
                  </div>
                </div>
              )}
              {problem.hint && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">Hint</summary>
                  <p className="mt-1.5 whitespace-pre-wrap leading-relaxed text-muted-foreground">{problem.hint}</p>
                </details>
              )}
            </div>
            <div className="flex h-12 shrink-0 items-center gap-2 border-t bg-muted/40 px-3">
              <button className={cn(btnGhost, "h-8 px-3")} disabled={session.current === 0} onClick={() => go(session.current - 1)}>
                <ChevronLeft className="size-4" /> Previous
              </button>
              <button className={cn(btnGhost, "h-8 px-3")} disabled={session.current === session.problems.length - 1} onClick={() => go(session.current + 1)}>
                Next <ChevronRight className="size-4" />
              </button>
            </div>
          </section>

          <div
            role="separator"
            aria-orientation="vertical"
            title="Drag to resize"
            onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
            onPointerMove={dragMove}
            onDoubleClick={() => setSplit(42)}
            className="group relative hidden cursor-col-resize touch-none lg:block"
          >
            <span className="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border transition-colors group-hover:bg-primary/60" />
          </div>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
            <div className="flex h-11 shrink-0 items-center gap-2 border-b bg-muted/40 px-3">
              <span className="rounded-md border bg-card px-2 py-1 font-mono text-xs font-semibold">{problem.language === "java" ? "Solution.java" : problem.language === "python" ? "solution.py" : "answer"}</span>
              <span className="text-xs text-muted-foreground">{problem.language === "java" ? "Java" : problem.language === "python" ? "Python 3" : ""}</span>
              <button className="ml-auto h-8 rounded-lg px-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => update((s) => ({ ...s, codes: { ...s.codes, [problem.id]: problem.starterCode } }))}>
                Reset
              </button>
              <button onClick={toggleTheme} className={cn(iconBtn, "size-8")} aria-label={dark ? "Light mode" : "Dark mode"} title={dark ? "Light mode" : "Dark mode"}>
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
            </div>

            <div ref={scroller} className="relative min-h-0 flex-1 overflow-y-auto">
              <div className="relative h-[clamp(200px,38vh,400px)] border-b">
                <div className="absolute inset-0 overflow-auto">
                  <CodeMirror
                    key={problem.id}
                    value={code}
                    height="100%"
                    style={{ fontSize: 14 }}
                    theme={dark ? oneDark : "light"}
                    extensions={[surface, ...(problem.language === "java" ? [java()] : problem.language === "python" ? [python()] : [])]}
                    onChange={(v) => update((s) => ({ ...s, codes: { ...s.codes, [problem.id]: v } }))}
                    basicSetup={{ lineNumbers: true, foldGutter: false, tabSize: 4 }}
                  />
                </div>
              </div>

              <div ref={results} className="space-y-2.5 p-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold">Test cases</h3>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {sampleTests ? (scored.length ? `${passed} of ${scored.length} passed` : "No expected output to compare") : runnable ? "Not run yet" : "Not auto-checked"}
                  </p>
                </div>

                {samples && !sampleTests && (
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-mono text-xs leading-relaxed text-destructive">{samples.error}</pre>
                )}

                {problem.tests.length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">This problem has no sample tests.</p>
                ) : (
                  problem.tests.map((t, i) => {
                    const r = sampleTests?.[i]
                    const expected = r ? r.expected : t.output
                    return (
                      <div key={i} className="overflow-hidden rounded-lg border">
                        <div className="flex items-center justify-between bg-muted/40 px-3 py-1.5">
                          <p className="text-xs font-bold">Case {i + 1}</p>
                          {r?.checked ? <Tag tone={r.ok ? "green" : "red"}>{r.ok ? "Passed" : "Failed"}</Tag> : r ? <Tag>Returned</Tag> : <Tag>Not run</Tag>}
                        </div>
                        <div className="grid gap-2 p-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
                          <Box label="Input" value={t.input || "(none)"} />
                          {expected.trim() !== "" && <Box label="Expected" value={expected} />}
                          <Box label={r?.checked ? "Your output" : "Returned"} value={r ? r.got : "Run to see"} tone={r?.checked ? (r.ok ? "good" : "bad") : undefined} muted={!r} />
                        </div>
                      </div>
                    )
                  })
                )}
                {sampleTests && samples && "stdout" in samples && samples.stdout && <Box label="Printed" value={samples.stdout} />}

                {canCustom && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-bold">
                      Try your own input <span className="ml-1 font-mono font-medium text-muted-foreground">{problem.functionName}( )</span>
                    </p>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={own}
                        onChange={(e) => setOwnText((o) => ({ ...o, [problem.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && !e.ctrlKey && !e.metaKey && runOwn()}
                        placeholder={problem.tests[0]?.input || "e.g. 5"}
                        spellCheck={false}
                        className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:border-foreground/40"
                      />
                      <button className={cn(btnGhost, "h-9")} onClick={runOwn} disabled={running || own.trim() === ""}>
                        Run
                      </button>
                    </div>
                    {shown.own && !ownRes && <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-mono text-xs text-destructive">{shown.own.error}</pre>}
                    {ownRes?.tests[0] && (
                      <div className="mt-2 space-y-2">
                        <Box label="Returned" value={ownRes.tests[0].got} />
                        {ownRes.stdout && <Box label="Printed" value={ownRes.stdout} />}
                      </div>
                    )}
                  </div>
                )}
                {!runnable && <p className="px-1 text-sm text-muted-foreground">This course is not auto-checked. Your answer is saved and shown in your result.</p>}
              </div>
            </div>

            <div className="flex h-12 shrink-0 items-center gap-2 border-t bg-muted/40 px-3">
              <span className="hidden text-xs text-muted-foreground md:inline">{runnable ? "Ctrl + Enter to run" : ""}</span>
              <span className="ml-auto" />
              {runnable && (
                <button className={cn(btnGhost, "h-8 px-4")} onClick={run} disabled={running || checking}>
                  <Play className="size-3.5" /> {running ? "Running" : "Run"}
                </button>
              )}
              <button onClick={() => setConfirm("submit")} disabled={submitting} className={cn(btnPrimary, "h-8 px-5")}>
                {submitting ? "Checking" : "Submit test"}
              </button>
            </div>
          </section>
        </main>
      </div>

      {confirm === "submit" && (
        <SubmitSummary
          rows={session.problems.map((p) => ({ p, answered: isAnswered(p), st: statusOf(p, isAnswered(p), outputs[p.id]?.samples) }))}
          checking={checking}
          submitting={submitting}
          onJump={(i) => {
            go(i)
            setConfirm(null)
          }}
          onCheckAll={checkAll}
          onSubmit={finish}
          onClose={() => setConfirm(null)}
        />
      )}
      <ConfirmDialog
        open={confirm === "exit"}
        title="Leave the test?"
        body="Your code is saved here and the clock keeps running, so you can pick it up again from Quiz prep."
        primary={{ label: "Save and leave", onClick: () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); onLeave() } }}
        secondary={{ label: "Keep going", onClick: () => setConfirm(null) }}
        danger={{ label: "Discard this test", onClick: onDiscard }}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}

/** A popup over the dimmed test: every problem, what was written, and how it checked out. */
function SubmitSummary({ rows, checking, submitting, onJump, onCheckAll, onSubmit, onClose }: {
  rows: { p: OppeProblem; answered: boolean; st: Status }[]
  checking: boolean
  submitting: boolean
  onJump: (i: number) => void
  onCheckAll: () => void
  onSubmit: () => void
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const started = rows.filter((r) => r.answered).length
  const passing = rows.filter((r) => r.st.tone === "green").length
  const failing = rows.filter((r) => r.st.label.startsWith("Failed") || r.st.label === "Error").length
  const notRun = rows.filter((r) => r.st.label === "Not run").length
  const canCheck = rows.some((r) => r.answered && r.p.language === "python")

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Review your answers" onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-extrabold tracking-tight">Review before you submit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {started} of {rows.length} started
            {passing > 0 && ` · ${passing} passing`}
            {failing > 0 && ` · ${failing} to fix`}
            {notRun > 0 && ` · ${notRun} not run`}
          </p>
        </div>
        <ul className="min-h-0 flex-1 divide-y overflow-y-auto">
          {rows.map(({ p, st }, i) => (
            <li key={p.id}>
              <button onClick={() => onJump(i)} className="flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/50">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{p.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{p.difficulty}</span>
                  {st.detail && <span className="mt-2 block break-words rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs leading-relaxed">{st.detail}</span>}
                </span>
                <Tag tone={st.tone}>{st.label}</Tag>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-2 border-t px-6 py-4">
          <button className={btnGhost} onClick={onClose}>
            Keep working
          </button>
          <span className="ml-auto" />
          {canCheck && (
            <button className={btnGhost} onClick={onCheckAll} disabled={checking || submitting}>
              {checking ? "Checking" : "Check all"}
            </button>
          )}
          <button className={cn(btnPrimary, "px-6")} onClick={onSubmit} disabled={checking || submitting} autoFocus>
            {submitting ? "Submitting" : "Submit test"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Box({ label, value, tone, muted }: { label: string; value: string; tone?: "good" | "bad"; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-semibold text-muted-foreground">{label}</p>
      <pre className={cn("overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/50 px-2.5 py-1.5 font-mono text-xs leading-relaxed", tone === "good" && "border-chart-4/40 bg-chart-4/10", tone === "bad" && "border-destructive/30 bg-destructive/10")}>
        {value === "" ? <span className="text-muted-foreground">(empty)</span> : muted ? <span className="text-muted-foreground">{value}</span> : value}
      </pre>
    </div>
  )
}

function Output({ out, custom }: { out: RunResult | { error: string }; custom?: boolean }) {
  if (!("tests" in out) || out.error) {
    return <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-mono text-xs text-destructive">{out.error}</pre>
  }
  const checked = out.tests.filter((t) => t.checked)
  const passed = checked.filter((t) => t.ok).length
  return (
    <div className="space-y-3">
      {custom ? (
        <p className="text-sm font-bold">Output for your input</p>
      ) : checked.length > 0 ? (
        <p className="flex items-center gap-1.5 text-sm font-bold">
          {passed === checked.length ? <Check className="size-4 text-chart-4" /> : <X className="size-4 text-destructive" />}
          {passed} of {checked.length} {checked.length === 1 ? "test" : "tests"} passed
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">This problem has no expected output to compare with. Here is what your code returned.</p>
      )}
      {out.tests.map((t, i) => (
        <div key={i} className="space-y-2 rounded-xl border p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{custom ? "Your input" : `Test ${i + 1}`}</p>
            {t.checked && <Tag tone={t.ok ? "green" : "red"}>{t.ok ? "Passed" : "Failed"}</Tag>}
          </div>
          <Box label="Input" value={t.input} />
          <div className={cn("grid gap-2", t.checked && "sm:grid-cols-2")}>
            {t.checked && <Box label="Expected" value={t.expected} />}
            <Box label={t.checked ? "Your output" : "Returned"} value={t.got} tone={t.checked ? (t.ok ? "good" : "bad") : undefined} />
          </div>
        </div>
      ))}
      {out.stdout && <Box label="Printed" value={out.stdout} />}
    </div>
  )
}

function OppeResults({ finished, onBack }: { finished: Finished; onBack: () => void }) {
  const { session, results } = finished
  const rows = useMemo(
    () =>
      session.problems.map((p) => {
        const r = results[p.id]
        const checked = !!r && "tests" in r && !r.error && r.tests.some((t) => t.checked)
        const ct = checked ? (r as RunResult).tests.filter((t) => t.checked) : []
        const passed = ct.filter((t) => t.ok).length
        const total = ct.length
        return { p, r, checked, passed, total }
      }),
    [session.problems, results],
  )
  const checkedRows = rows.filter((r) => r.checked)
  const score = checkedRows.length ? Math.round((checkedRows.reduce((t, r) => t + (r.total ? r.passed / r.total : 0), 0) / checkedRows.length) * 100) : null

  return (
    <div className="space-y-6">
      <Back href={`${BASE}/${session.course}`}>{COURSE_NAMES[session.course]}</Back>
      <PageHeader title="Your result" description={`${COURSE_NAMES[session.course]} · OPPE ${session.exam}`} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Score" value={score === null ? "Not checked" : `${score}%`} />
        <Stat label="Problems solved" value={`${rows.filter((r) => r.checked && r.total > 0 && r.passed === r.total).length} of ${rows.length}`} />
        <Stat label="Time" value={`${Math.max(1, Math.round((finished.finishedAt - session.startedAt) / 60000))} min`} />
      </div>
      <div className="space-y-4">
        {rows.map(({ p, r, checked, passed, total }, i) => (
          <Card key={p.id}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">Problem {i + 1}</span>
              <span className="text-sm text-muted-foreground">{p.title}</span>
              <Tag tone={TONE[p.difficulty]}>{p.difficulty}</Tag>
              {checked ? <Tag tone={passed === total ? "green" : "red"}>{passed} of {total} tests</Tag> : <Tag>Not auto-checked</Tag>}
            </div>
            {r && <Output out={r} />}
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-semibold text-muted-foreground">Your code</summary>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-muted p-3 text-xs">{session.codes[p.id] ?? p.starterCode}</pre>
            </details>
          </Card>
        ))}
      </div>
      <button className={btnGhost} onClick={onBack}>Back to course</button>
    </div>
  )
}
