"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { oneDark } from "@codemirror/theme-one-dark"
import { ArrowLeft, ArrowUpRight, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, Maximize2, Minimize2, Moon, Play, Sun, X } from "lucide-react"
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
/** What the console shows for a problem: the sample tests, and a run on the student's own input. */
type Shown = { samples?: Res; own?: Res }

function Runner({ initial, onDone, onLeave, onDiscard }: { initial: Session; onDone: (f: Finished) => void; onLeave: () => void; onDiscard: () => void }) {
  const [session, setSession] = useState(initial)
  const [now, setNow] = useState(() => Date.now())
  const [dark, setDark] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [confirm, setConfirm] = useState<"submit" | "exit" | null>(null)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [outputs, setOutputs] = useState<Record<string, Shown>>({})
  const [sel, setSel] = useState<number | "custom">(0)
  const [ownText, setOwnText] = useState<Record<string, string>>({})
  const [consoleOpen, setConsoleOpen] = useState(true)
  const [split, setSplit] = useState(42)
  const sent = useRef(false)
  const runRef = useRef<() => void>(() => {})

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
      setDark(v === "1" || (v === null && document.documentElement.classList.contains("dark")))
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

  useEffect(() => setSel(0), [problem.id])

  // A problem counts as viewed the first time it is opened.
  useEffect(() => {
    if (!(session.seen ?? []).includes(problem.id)) update((s) => ({ ...s, seen: [...(s.seen ?? []), problem.id] }))
  }, [problem.id, session.seen, update])

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

  async function run() {
    if (!runnable || running) return
    const mine = sel === "custom"
    if (mine && own.trim() === "") return
    setRunning(true)
    let res: Res
    try {
      res = await runPython(code, problem.setupCode, problem.functionName, mine ? [{ input: own.trim(), output: "" }] : problem.tests)
    } catch (e) {
      res = { error: e instanceof Error ? e.message : "Could not run" }
    }
    setOutputs((o) => ({ ...o, [problem.id]: { ...o[problem.id], [mine ? "own" : "samples"]: res } }))
    setRunning(false)
  }
  runRef.current = run

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

  return (
    <div className="lms fixed inset-0 z-[60] flex flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3 sm:px-5">
        <button onClick={() => setConfirm("exit")} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Leave test">
          <X className="size-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-bold">{COURSE_NAMES[session.course]} · OPPE {session.exam}</p>
        <TimerPill remainingSec={remainingSec} elapsedSec={elapsedSec} totalSec={limitMs ? limitMs / 1000 : null} />
        <button onClick={toggleTheme} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={dark ? "Light editor" : "Dark editor"} title={dark ? "Light editor" : "Dark editor"}>
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button onClick={toggleFullscreen} className="hidden size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground sm:grid" aria-label="Toggle full screen">
          {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex shrink-0 border-b bg-card/40 lg:w-[104px] lg:flex-col lg:border-b-0 lg:border-r">
          <nav className="flex gap-2 overflow-x-auto p-2 lg:grid lg:grid-cols-2 lg:content-start lg:justify-items-center lg:overflow-visible lg:p-3" aria-label="Questions">
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
                    "relative grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold transition-colors",
                    state === "current" && "bg-primary text-primary-foreground",
                    state === "answered" && "bg-primary/15 text-primary hover:bg-primary/25",
                    state === "skipped" && "bg-muted text-foreground hover:bg-muted/70",
                    state === "new" && "border text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  {i + 1}
                  {marked.includes(p.id) && <Bookmark className="absolute -right-1 -top-1 size-3.5 fill-chart-2 text-chart-2" />}
                </button>
              )
            })}
          </nav>
          <dl className="mt-auto hidden space-y-2 border-t p-3 text-[11px] lg:block">
            {[
              ["Answered", `${answeredCount}/${session.problems.length}`],
              ["Skipped", String(skippedCount)],
              ["Unseen", String(newCount)],
              ["Marked", String(marked.length)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-1">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <main className="grid min-h-0 flex-1 grid-rows-2 overflow-hidden lg:grid-cols-[var(--split)_8px_minmax(0,1fr)] lg:grid-rows-1" style={{ "--split": `${split}%` } as React.CSSProperties}>
          <section className="flex min-h-0 flex-col border-b lg:border-b-0">
            <div className="flex h-12 shrink-0 items-center gap-2 border-b px-5">
              <p className="text-sm font-semibold text-muted-foreground">Question {session.current + 1} of {session.problems.length}</p>
              <Tag tone={TONE[problem.difficulty]}>{problem.difficulty}</Tag>
              <button
                onClick={toggleMark}
                aria-pressed={isMarked}
                className={cn("ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold hover:bg-muted", isMarked ? "text-foreground" : "text-muted-foreground")}
              >
                <Bookmark className={cn("size-4", isMarked && "fill-chart-2 text-chart-2")} /> {isMarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto max-w-2xl px-6 py-6">
                <h2 className="text-2xl font-extrabold tracking-tight">{problem.title}</h2>
                <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">{problem.description || "No description provided."}</p>
                {problem.tests[0] && (
                  <div className="mt-8">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Sample</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Box label="Input" value={problem.tests[0].input || "(none)"} />
                      {problem.tests[0].output.trim() !== "" && <Box label="Output" value={problem.tests[0].output} />}
                    </div>
                  </div>
                )}
                {problem.hint && (
                  <details className="mt-6 text-sm">
                    <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">Hint</summary>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted-foreground">{problem.hint}</p>
                  </details>
                )}
              </div>
            </div>
            <div className="flex h-14 shrink-0 items-center gap-2 border-t px-5">
              <button className={btnGhost} disabled={session.current === 0} onClick={() => go(session.current - 1)}>
                <ChevronLeft className="size-4" /> Previous
              </button>
              <button className={btnGhost} disabled={session.current === session.problems.length - 1} onClick={() => go(session.current + 1)}>
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
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-all group-hover:w-0.5 group-hover:bg-primary" />
          </div>

          <section className="flex min-h-0 flex-col">
            <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold">{problem.language === "java" ? "Solution.java" : problem.language === "python" ? "solution.py" : "answer"}</span>
              <span className="text-xs text-muted-foreground">{problem.language === "java" ? "Java" : problem.language === "python" ? "Python 3" : ""}</span>
              <button className="ml-auto h-8 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => update((s) => ({ ...s, codes: { ...s.codes, [problem.id]: problem.starterCode } }))}>
                Reset
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <div className="absolute inset-0 overflow-auto">
                <CodeMirror
                  key={problem.id}
                  value={code}
                  height="100%"
                  style={{ fontSize: 14 }}
                  theme={dark ? oneDark : "light"}
                  extensions={problem.language === "java" ? [java()] : problem.language === "python" ? [python()] : []}
                  onChange={(v) => update((s) => ({ ...s, codes: { ...s.codes, [problem.id]: v } }))}
                  basicSetup={{ lineNumbers: true, foldGutter: false, tabSize: 4 }}
                />
              </div>
            </div>
            <Console
              problem={problem}
              shown={shown}
              sel={sel}
              onSel={setSel}
              own={own}
              onOwn={(v) => setOwnText((o) => ({ ...o, [problem.id]: v }))}
              open={consoleOpen}
              onToggle={() => setConsoleOpen((o) => !o)}
              runnable={runnable}
              canCustom={canCustom}
            />
            <div className="flex h-14 shrink-0 items-center gap-2 border-t px-4">
              {runnable && <span className="hidden text-xs text-muted-foreground sm:inline">Ctrl + Enter to run</span>}
              <span className="ml-auto" />
              {runnable && (
                <button className={cn(btnGhost, "h-9")} onClick={run} disabled={running || (sel === "custom" && own.trim() === "")}>
                  <Play className="size-3.5" /> {running ? "Running" : sel === "custom" ? "Run my input" : "Run"}
                </button>
              )}
              <button onClick={() => setConfirm("submit")} disabled={submitting} className={cn(btnPrimary, "h-9 px-5")}>
                {submitting ? "Checking" : "Submit test"}
              </button>
            </div>
          </section>
        </main>
      </div>

      <ConfirmDialog
        open={confirm === "submit"}
        title="Submit your test?"
        body={answeredCount < session.problems.length ? `You have answered ${answeredCount} of ${session.problems.length} problems. Every problem will be checked against its tests.` : "Every problem will be checked against its tests."}
        primary={{ label: "Submit", onClick: finish }}
        secondary={{ label: "Keep working", onClick: () => setConfirm(null) }}
        onClose={() => setConfirm(null)}
      />
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

/** Test cases under the editor: pick a case to see its input, the expected output and what the code gave. */
function Console({ problem, shown, sel, onSel, own, onOwn, open, onToggle, runnable, canCustom }: {
  problem: OppeProblem
  shown: Shown
  sel: number | "custom"
  onSel: (s: number | "custom") => void
  own: string
  onOwn: (v: string) => void
  open: boolean
  onToggle: () => void
  runnable: boolean
  canCustom: boolean
}) {
  const samples = shown.samples
  const failed = !!samples && (!("tests" in samples) || !!samples.error)
  const tests = samples && "tests" in samples && !samples.error ? samples.tests : null
  const checked = tests?.filter((t) => t.checked) ?? []
  const passed = checked.filter((t) => t.ok).length
  const mine = shown.own && "tests" in shown.own && !shown.own.error ? shown.own : null

  const chip = (active: boolean) => cn("inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-semibold transition-colors", active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")

  return (
    <div className="shrink-0 border-t">
      <div className="flex h-11 items-center gap-1 overflow-x-auto px-3">
        <button onClick={onToggle} aria-expanded={open} className="mr-1 inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-bold hover:bg-muted">
          <ChevronDown className={cn("size-4 transition-transform", !open && "-rotate-90")} /> Test cases
        </button>
        {problem.tests.map((_, i) => {
          const r = tests?.[i]
          return (
            <button key={i} onClick={() => { onSel(i); if (!open) onToggle() }} className={chip(sel === i)}>
              {r?.checked && (r.ok ? <Check className="size-3.5 text-chart-4" /> : <X className="size-3.5 text-destructive" />)}
              Case {i + 1}
            </button>
          )
        })}
        {canCustom && (
          <button onClick={() => { onSel("custom"); if (!open) onToggle() }} className={chip(sel === "custom")}>
            Your input
          </button>
        )}
        <span className={cn("ml-auto shrink-0 pl-3 text-xs font-semibold", failed ? "text-destructive" : "text-muted-foreground")}>
          {failed ? "Error" : checked.length ? `${passed} of ${checked.length} passed` : runnable ? "Not run yet" : ""}
        </span>
      </div>

      {open && (
        <div className="max-h-56 space-y-3 overflow-y-auto border-t px-4 py-3">
          {sel === "custom" ? (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Arguments for <span className="font-mono">{problem.functionName}( )</span>
                </label>
                <input
                  value={own}
                  onChange={(e) => onOwn(e.target.value)}
                  placeholder={problem.tests[0]?.input || "e.g. 5"}
                  spellCheck={false}
                  className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:border-foreground/40"
                />
              </div>
              {shown.own && !mine && <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-mono text-xs text-destructive">{"error" in shown.own ? shown.own.error : ""}</pre>}
              {mine?.tests[0] && <Box label="Returned" value={mine.tests[0].got} />}
              {mine?.stdout && <Box label="Printed" value={mine.stdout} />}
              {!shown.own && <p className="text-sm text-muted-foreground">Type the arguments and press Run my input.</p>}
            </>
          ) : problem.tests.length === 0 ? (
            <p className="text-sm text-muted-foreground">This problem has no sample tests.</p>
          ) : failed && samples && "error" in samples ? (
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-mono text-xs text-destructive">{samples.error}</pre>
          ) : (
            (() => {
              const t = problem.tests[sel]
              const r = tests?.[sel]
              if (!t) return null
              const expected = r ? r.expected : t.output
              return (
                <>
                  <Box label="Input" value={t.input || "(none)"} />
                  <div className={cn("grid gap-3", expected.trim() !== "" && r && "sm:grid-cols-2")}>
                    {expected.trim() !== "" && <Box label="Expected output" value={expected} />}
                    {r && <Box label={r.checked ? "Your output" : "Returned"} value={r.got} tone={r.checked ? (r.ok ? "good" : "bad") : undefined} />}
                  </div>
                  {!r && <p className="text-sm text-muted-foreground">{runnable ? "Run your code to see what it gives." : "This course is not auto-checked. Your answer is saved and shown in your result."}</p>}
                  {r && expected.trim() === "" && <p className="text-xs text-muted-foreground">No expected output is available for this case, so it is not scored.</p>}
                  {tests && samples && "stdout" in samples && samples.stdout && <Box label="Printed" value={samples.stdout} />}
                </>
              )
            })()
          )}
        </div>
      )}
    </div>
  )
}

function Box({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      <pre className={cn("overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/50 px-3 py-2 font-mono text-xs leading-relaxed", tone === "good" && "border-chart-4/40 bg-chart-4/10", tone === "bad" && "border-destructive/30 bg-destructive/10")}>
        {value === "" ? <span className="text-muted-foreground">(empty)</span> : value}
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
