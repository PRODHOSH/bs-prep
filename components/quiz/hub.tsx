"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, BookOpen, Code2, FileText, GraduationCap, History, ListChecks, Play, Shuffle, SlidersHorizontal, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, EmptyState, Field, Notice, PageHeader, btnGhost, btnPrimary, field } from "@/components/dashboard/ui"
import { Banner, Tile } from "./banner"
import { Illustration } from "./illustration"
import { iconFor } from "@/lib/quiz/tone"
import { Modal, SearchBox, Segmented, Tabs } from "@/components/dashboard/controls"
import {
  clearHistory,
  clearResult,
  clearSession,
  fetchPapers,
  fetchSubjects,
  loadHistory,
  loadSession,
  newSession,
  requestTest,
  saveSession,
  type ActiveSession,
  type HistoryEntry,
} from "@/lib/quiz/client"
import { KIND_LABEL, KIND_MINUTES, TYPE_LABEL, type ExamKind, type Level, type PaperInfo, type QType, type StartRequest, type SubjectInfo } from "@/lib/quiz/types"

const TEST_PATH = "/dashboard/quiz-prep/test"
const KINDS: ExamKind[] = ["quiz1", "quiz2", "endterm"]
const TYPES: QType[] = ["MCQ", "MSQ", "NUM"]

function useLauncher() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const launch = useCallback(
    async (req: StartRequest) => {
      setBusy(true)
      setError(null)
      try {
        const test = await requestTest(req)
        clearResult()
        saveSession(newSession(test))
        router.push(TEST_PATH)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not start the test")
        setBusy(false)
      }
    },
    [router],
  )
  return { launch, busy, error }
}

function timeLeft(s: ActiveSession) {
  if (!s.test.minutes) return null
  return s.startedAt + s.test.minutes * 60_000 - Date.now()
}

const dayLabel = (ts: number) => new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })

const BASE = "/dashboard/quiz-prep"

const KIND_HINT: Record<ExamKind, string> = {
  quiz1: "Past papers from the first quiz",
  quiz2: "Past papers from the second quiz",
  endterm: "Full end term papers",
}

function Back({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> {children}
    </Link>
  )
}

const HOME_CARDS: { href: string; title: string; hint: string; icon: React.ElementType }[] = [
  { href: "practice", title: "Practice", hint: "Quick and custom tests from past questions", icon: Zap },
  { href: "quiz1", title: "Quiz 1", hint: KIND_HINT.quiz1, icon: FileText },
  { href: "quiz2", title: "Quiz 2", hint: KIND_HINT.quiz2, icon: ListChecks },
  { href: "endterm", title: "End term", hint: KIND_HINT.endterm, icon: GraduationCap },
  { href: "oppe", title: "OPPE", hint: "Coding problems by course", icon: Code2 },
]

/** Step 1: choose the exam. Also holds the resume banner and history. */
export function QuizHome() {
  const [tab, setTab] = useState<"practice" | "history">("practice")
  const [resume, setResume] = useState<ActiveSession | null>(null)
  const [oppeResume, setOppeResume] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const launcher = useLauncher()

  useEffect(() => {
    try {
      setOppeResume(!!localStorage.getItem("bsprep:oppe:session:v1"))
    } catch {}
    const s = loadSession()
    if (s) {
      const left = timeLeft(s)
      if (left !== null && left <= 0) clearSession()
      else setResume(s)
    }
    setHistory(loadHistory())
  }, [])

  return (
    <div className="space-y-6">
      <Banner title="Quiz prep" description="Real IITM past papers in an exam-style window. Pick what you want to practise." art="quiz-home" />

      {resume && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-primary/40 bg-primary/5">
          <div className="min-w-0">
            <p className="text-sm font-bold">Test in progress</p>
            <p className="truncate text-sm text-muted-foreground">{resume.test.title} · {resume.test.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <button
              className={btnGhost}
              onClick={() => {
                clearSession()
                setResume(null)
              }}
            >
              Discard
            </button>
            <a href={TEST_PATH} className={btnPrimary}>
              <Play className="size-4" /> Resume
            </a>
          </div>
        </Card>
      )}

      {oppeResume && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-primary/40 bg-primary/5">
          <p className="text-sm font-bold">OPPE test in progress</p>
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => { try { localStorage.removeItem("bsprep:oppe:session:v1") } catch {} setOppeResume(false) }}>Discard</button>
            <a href={`${BASE}/oppe/test`} className={btnPrimary}><Play className="size-4" /> Resume</a>
          </div>
        </Card>
      )}

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "practice", label: "Practice" },
          { id: "history", label: "History", count: history.length || undefined },
        ]}
      />

      {tab === "history" ? (
        <HistoryList entries={history} onRetry={(e) => launcher.launch({ mode: "retry", items: e.missed, minutes: null })} onClear={() => { clearHistory(); setHistory([]) }} busy={launcher.busy} error={launcher.error} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_CARDS.map((c) => (
            <Link key={c.href} href={`${BASE}/${c.href}`} className="group rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/30">
              <div className="flex items-start justify-between">
                <Tile icon={c.icon} />
                <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-5 text-xl font-extrabold tracking-tight">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.hint}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function useSubjects() {
  const [subjects, setSubjects] = useState<SubjectInfo[] | null>(null)
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetchSubjects()
      .then((c) => {
        setSubjects(c.subjects)
        setAvailable(c.available)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load quiz prep"))
  }, [])
  return { subjects, available, error }
}

/** Step 2: choose the course. */
export function CoursePicker({ kind }: { kind: ExamKind | "practice" }) {
  const { subjects, available, error } = useSubjects()
  const [query, setQuery] = useState("")

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const hits = (subjects ?? []).filter((s) => !q || s.name.toLowerCase().includes(q))
    return (["Foundation", "Diploma", "Degree"] as Level[]).map((level) => ({ level, items: hits.filter((s) => s.level === level) })).filter((g) => g.items.length)
  }, [subjects, query])

  return (
    <div className="space-y-6">
      <Back href={BASE}>Quiz prep</Back>
      <Banner
        title={kind === "practice" ? "Practice" : KIND_LABEL[kind]}
        description="Choose a course."
        art={kind === "practice" ? "practice" : "quiz-home"}
      />

      {error ? (
        <Notice tone="error">{error}</Notice>
      ) : !subjects ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-[4.5rem] animate-pulse rounded-2xl border bg-muted/50" />
          ))}
        </div>
      ) : !available ? (
        <EmptyState icon={BookOpen} title="Question papers are being set up" hint="The past paper library is not available on this server yet. Check back soon." />
      ) : (
        <>
          <SearchBox value={query} onChange={setQuery} placeholder="Search courses" className="w-full sm:max-w-sm" />
          {groups.map((g) => (
            <section key={g.level} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{g.level}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((s) => (
                  <Link key={s.id} href={`${BASE}/${kind}/${s.id}`} className="group flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors hover:border-foreground/30">
                    <Tile icon={iconFor(s.id)} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{s.name}</span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
          {groups.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No course matches that search.</p>}
        </>
      )}
    </div>
  )
}

/** Step 3: choose a paper (or build a quick or custom test) for the course. */
export function PaperPicker({ kind, subjectId }: { kind: ExamKind | "practice"; subjectId: string }) {
  const { subjects, available, error } = useSubjects()
  const subject = subjects?.find((s) => s.id === subjectId) ?? null
  const here = `${BASE}/${kind}/${subjectId}/instructions`

  return (
    <div className="space-y-6">
      <Back href={`${BASE}/${kind}`}>{kind === "practice" ? "Practice" : KIND_LABEL[kind]}</Back>
      <Banner
        art={kind === "practice" ? "practice" : "quiz-home"}
        title={subject?.name ?? "Course"}
        description={kind === "practice" ? "Choose a test." : `${KIND_LABEL[kind]} papers, newest first.`}
        actions={
          subject && kind !== "practice" && (
            <>
              <Link href={`${here}?mode=quick`} className={btnGhost}><Shuffle className="size-4" /> Quick test</Link>
              <Link href={`${here}?mode=custom`} className={btnGhost}><SlidersHorizontal className="size-4" /> Custom test</Link>
            </>
          )
        }
      />
      {error ? (
        <Notice tone="error">{error}</Notice>
      ) : !subjects ? (
        <div className="h-40 animate-pulse rounded-2xl border bg-muted/50" />
      ) : !available || !subject ? (
        <EmptyState icon={BookOpen} title="Course not found" hint="Go back and pick a course from the list." />
      ) : (
        <>
          {kind === "practice" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { mode: "quick", icon: Shuffle, title: "Quick test", hint: "5 to 20 random past questions. Done in minutes." },
                { mode: "custom", icon: SlidersHorizontal, title: "Custom test", hint: "Pick how many questions and which type." },
              ].map((c) => (
                <Link key={c.mode} href={`${here}?mode=${c.mode}`} className="group rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/30">
                  <div className="flex items-start justify-between">
                    <Tile icon={c.icon} />
                    <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-5 text-xl font-extrabold tracking-tight">{c.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.hint}</p>
                </Link>
              ))}
            </div>
          ) : (
            <MockList subject={subject} kind={kind} />
          )}
        </>
      )}
    </div>
  )
}

function MockList({ subject, kind }: { subject: SubjectInfo; kind: ExamKind }) {
  const [papers, setPapers] = useState<PaperInfo[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPapers(subject.id)
      .then((r) => setPapers(r.papers))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load papers"))
  }, [subject.id])

  const list = useMemo(() => (papers ?? []).filter((p) => p.kind === kind), [papers, kind])
  // The set code is only shown when two papers share a date, so students can tell them apart.
  const crowded = useMemo(() => {
    const seen = new Map<string, number>()
    for (const p of list) seen.set(p.dateLabel, (seen.get(p.dateLabel) ?? 0) + 1)
    return seen
  }, [list])

  if (error) return <Notice tone="error">{error}</Notice>
  if (!papers) return <div className="h-32 animate-pulse rounded-2xl bg-muted/50" />
  if (list.length === 0) return <EmptyState icon={BookOpen} title={`No ${KIND_LABEL[kind]} papers for this course yet`} hint="Go back and try another exam, or take a quick test drawn from every paper." />

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => {
        const extra = [(crowded.get(p.dateLabel) ?? 0) > 1 && p.set ? `Set ${p.set}` : null, p.variant].filter(Boolean).join(" · ")
        return (
          <Link
            key={p.id}
            href={`${BASE}/${kind}/${subject.id}/instructions?paper=${encodeURIComponent(p.id)}`}
            className="group rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/30"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{KIND_LABEL[kind]}{extra ? ` · ${extra}` : ""}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{p.dateLabel}</p>
            <div className="mt-3 flex gap-2 text-xs font-semibold">
              <span className="rounded-lg bg-muted px-2.5 py-1">{p.questions} questions</span>
              <span className="rounded-lg bg-muted px-2.5 py-1">{p.marks} marks</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

const RULES = [
  "The test opens full screen and the timer starts when you begin.",
  "Jump between questions from the question menu, and mark any question to review it later.",
  "Multiple choice questions can have more than one right option. A wrong option cancels partial credit.",
  "Your answers are saved on this device. When time is up the test submits itself.",
  "A calculator is available in the top bar.",
]

/** Step 4: exam instructions and set up, then begin. Used for mock papers, quick tests and custom tests. */
export function Instructions({ kind, subjectId, paperId, mode }: { kind: ExamKind | "practice"; subjectId: string; paperId: string | null; mode: "mock" | "quick" | "custom" }) {
  const { subjects, available, error } = useSubjects()
  const [paper, setPaper] = useState<PaperInfo | null>(null)
  const [paperError, setPaperError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [minutes, setMinutes] = useState<number | null>(kind === "practice" ? null : KIND_MINUTES[kind])
  const launcher = useLauncher()
  const subject = subjects?.find((s) => s.id === subjectId) ?? null

  useEffect(() => {
    if (mode !== "mock" || !paperId) return
    fetchPapers(subjectId)
      .then((r) => {
        const p = r.papers.find((x) => x.id === paperId)
        if (p) {
          setPaper(p)
          setMinutes(KIND_MINUTES[p.kind])
        } else setPaperError("That paper was not found.")
      })
      .catch((e) => setPaperError(e instanceof Error ? e.message : "Could not load the paper"))
  }, [mode, paperId, subjectId])

  const back = `${BASE}/${kind}/${subjectId}`
  const loading = !subjects || (mode === "mock" && !paper && !paperError)
  const heading = mode === "mock" ? "Exam instructions" : mode === "quick" ? "Quick test" : "Custom test"

  return (
    <div className="space-y-6">
      <Back href={back}>{subject?.name ?? "Back"}</Back>
      <PageHeader title={heading} description={subject ? `${subject.name} · ${kind === "practice" ? "Practice" : KIND_LABEL[kind]}` : undefined} />

      {error || paperError ? (
        <Notice tone="error">{error ?? paperError}</Notice>
      ) : loading ? (
        <div className="h-64 animate-pulse rounded-2xl border bg-muted/50" />
      ) : !available || !subject || (mode === "mock" && !paper) ? (
        <EmptyState icon={BookOpen} title="Test not found" hint="Go back and choose again." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <Card title="Read before you begin">
            <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              {RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card>
              {paper && (
                <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-muted p-3"><p className="text-2xl font-extrabold">{paper.questions}</p><p className="text-[11px] font-semibold text-muted-foreground">Questions</p></div>
                  <div className="rounded-xl bg-muted p-3"><p className="text-2xl font-extrabold">{paper.marks}</p><p className="text-[11px] font-semibold text-muted-foreground">Marks</p></div>
                  <div className="rounded-xl bg-muted p-3"><p className="text-2xl font-extrabold">{minutes ?? "∞"}</p><p className="text-[11px] font-semibold text-muted-foreground">Minutes</p></div>
                </div>
              )}
              {mode === "mock" && kind !== "practice" && <DurationPicker suggested={KIND_MINUTES[kind]} value={minutes} onChange={setMinutes} />}
              {mode === "quick" && <QuickForm subject={subject} launcher={launcher} disabled={!agreed} />}
              {mode === "custom" && <CustomForm subject={subject} launcher={launcher} disabled={!agreed} />}

              <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
                <span>I have read the instructions.</span>
              </label>
              {launcher.error && <Notice tone="error" className="mt-4">{launcher.error}</Notice>}
              {mode === "mock" && paper && (
                <button className={cn(btnPrimary, "mt-4 w-full")} disabled={!agreed || launcher.busy} onClick={() => launcher.launch({ mode: "mock", paperId: paper.id, minutes })}>
                  <Play className="size-4" /> {launcher.busy ? "Preparing" : "Begin test"}
                </button>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  )
}

function DurationPicker({ suggested, value, onChange }: { suggested: number; value: number | null; onChange: (m: number | null) => void }) {
  return (
    <Field label="Timer">
      <Segmented
        value={value === null ? "off" : "on"}
        onChange={(v) => onChange(v === "on" ? suggested : null)}
        options={[{ id: "on", label: `${suggested} min` }, { id: "off", label: "No timer" }]}
      />
    </Field>
  )
}

function QuickForm({ subject, launcher, disabled }: { subject: SubjectInfo; launcher: ReturnType<typeof useLauncher>; disabled?: boolean }) {
  const [count, setCount] = useState(10)
  return (
    <div className="space-y-4">
      <Field label="Questions" hint={`Random questions from all past papers, about ${Math.ceil(count * 1.5)} minutes.`}>
        <Segmented value={String(count)} onChange={(v) => setCount(Number(v))} options={["5", "10", "20"].map((n) => ({ id: n, label: n }))} />
      </Field>
      <button className={cn(btnPrimary, "w-full")} disabled={disabled || launcher.busy} onClick={() => launcher.launch({ mode: "quick", subjectId: subject.id, count, kinds: [] })}>
        <Play className="size-4" /> {launcher.busy ? "Preparing" : "Begin test"}
      </button>
    </div>
  )
}

function CustomForm({ subject, launcher, disabled }: { subject: SubjectInfo; launcher: ReturnType<typeof useLauncher>; disabled?: boolean }) {
  const [count, setCount] = useState(20)
  const [types, setTypes] = useState<QType[]>([])
  const [timed, setTimed] = useState(true)
  return (
    <div className="space-y-4">
      <Field label="Questions">
        <Segmented value={String(count)} onChange={(v) => setCount(Number(v))} options={["10", "20", "30", "40"].map((n) => ({ id: n, label: n }))} />
      </Field>
      <Field label="Question type">
        <Segmented
          value={types[0] ?? "all"}
          onChange={(v) => setTypes(v === "all" ? [] : [v as QType])}
          options={[{ id: "all", label: "All" }, ...TYPES.map((t) => ({ id: t, label: TYPE_LABEL[t] }))]}
        />
      </Field>
      <DurationPicker suggested={Math.ceil(count * 1.5)} value={timed ? 1 : null} onChange={(m) => setTimed(m !== null)} />
      <button
        className={cn(btnPrimary, "w-full")}
        disabled={disabled || launcher.busy}
        onClick={() => launcher.launch({ mode: "custom", subjectId: subject.id, count, kinds: [], types, minutes: timed ? Math.max(5, Math.ceil(count * 1.5)) : null })}
      >
        <Play className="size-4" /> {launcher.busy ? "Preparing" : "Begin test"}
      </button>
    </div>
  )
}

function HistoryList({ entries, onRetry, onClear, busy, error }: { entries: HistoryEntry[]; onRetry: (e: HistoryEntry) => void; onClear: () => void; busy: boolean; error: string | null }) {
  if (entries.length === 0) return <EmptyState icon={History} title="No tests yet" hint="Finished tests show up here with your score, so you can see progress and redo what you missed." />
  return (
    <div className="space-y-3">
      {error && <Notice tone="error">{error}</Notice>}
      <ul className="divide-y rounded-2xl border bg-card">
        {entries.map((e) => {
          const pct = e.total ? Math.round((e.earned / e.total) * 100) : 0
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{e.title}</p>
                <p className="truncate text-xs text-muted-foreground">{e.subtitle} · {dayLabel(e.finishedAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums">{e.earned} / {e.total}</p>
                <p className="text-xs text-muted-foreground">{pct}% · {e.correct} right</p>
              </div>
              {e.missed.length > 0 && (
                <button className={btnGhost} disabled={busy} onClick={() => onRetry(e)}>Retry {e.missed.length} missed</button>
              )}
            </li>
          )
        })}
      </ul>
      <button onClick={onClear} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Clear history</button>
    </div>
  )
}
