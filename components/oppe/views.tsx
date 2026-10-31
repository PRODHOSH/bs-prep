"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { oneDark } from "@codemirror/theme-one-dark"
import { ArrowLeft, ArrowUpRight, BookOpen, Check, Play, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, EmptyState, Notice, PageHeader, Tag, btnGhost, btnPrimary } from "@/components/dashboard/ui"
import { SearchBox, Segmented, Tabs } from "@/components/dashboard/controls"
import { runPython, type RunResult } from "./runner"
import { Banner, Tile } from "@/components/quiz/banner"
import { iconFor } from "@/lib/quiz/tone"
import { COURSE_NAMES, type OppeCourse, type OppeProblem, type OppeSummary } from "@/lib/oppe/types"

const BASE = "/dashboard/quiz-prep/oppe"

async function api<T>(query: string): Promise<T> {
  const res = await fetch(`/api/oppe${query}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error || "Something went wrong")
  return body as T
}

function Back({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> {children}
    </Link>
  )
}

const TONE = { Easy: "green", Medium: "amber", Hard: "red" } as const

/** Step 2 of OPPE: choose the course. */
export function OppeCourses() {
  const [courses, setCourses] = useState<OppeCourse[] | null>(null)
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<{ available: boolean; courses: OppeCourse[] }>("")
      .then((r) => {
        setCourses(r.courses)
        setAvailable(r.available)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load OPPE"))
  }, [])

  return (
    <div className="space-y-6">
      <Back href="/dashboard/quiz-prep">Quiz prep</Back>
      <Banner title="OPPE" description="Choose a course to practise coding problems." art="oppe" />
      {error ? (
        <Notice tone="error">{error}</Notice>
      ) : !courses ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border bg-muted/50" />
          ))}
        </div>
      ) : !available ? (
        <EmptyState icon={BookOpen} title="OPPE problems are being set up" hint="They are not available on this server yet. Check back soon." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.id} href={`${BASE}/${c.id}`} className="group flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors hover:border-foreground/30">
              <Tile icon={iconFor(c.id)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{c.name}</span>
                <span className="block text-xs text-muted-foreground">{c.oppe1 + c.oppe2} problems</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/** Step 3 of OPPE: OPPE 1 or OPPE 2, then the problem list. */
export function OppeProblems({ course }: { course: string }) {
  const [problems, setProblems] = useState<OppeSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exam, setExam] = useState<"1" | "2">("1")
  const [level, setLevel] = useState<"All" | "Easy" | "Medium" | "Hard">("All")
  const [query, setQuery] = useState("")

  useEffect(() => {
    api<{ problems: OppeSummary[] }>(`?course=${encodeURIComponent(course)}`)
      .then((r) => setProblems(r.problems))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load problems"))
  }, [course])

  const counts = useMemo(() => ({ 1: problems?.filter((p) => p.exam === 1).length ?? 0, 2: problems?.filter((p) => p.exam === 2).length ?? 0 }), [problems])
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (problems ?? []).filter((p) => String(p.exam) === exam && (level === "All" || p.difficulty === level) && (!q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))))
  }, [problems, exam, level, query])

  return (
    <div className="space-y-6">
      <Back href={`${BASE}/${course}`}>OPPE exams</Back>
      <PageHeader title={COURSE_NAMES[course] ?? "Course"} description="All problems." />
      {error ? (
        <Notice tone="error">{error}</Notice>
      ) : !problems ? (
        <div className="h-64 animate-pulse rounded-2xl border bg-muted/50" />
      ) : (
        <>
          <Tabs
            value={exam}
            onChange={setExam}
            tabs={[
              { id: "1", label: "OPPE 1", count: counts[1] },
              { id: "2", label: "OPPE 2", count: counts[2] },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Segmented value={level} onChange={setLevel} options={(["All", "Easy", "Medium", "Hard"] as const).map((l) => ({ id: l, label: l }))} />
            <SearchBox value={query} onChange={setQuery} placeholder="Search problems" className="w-full sm:w-64" />
          </div>
          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No problems match.</p>
          ) : (
            <ul className="divide-y rounded-2xl border bg-card">
              {list.map((p) => (
                <li key={p.id}>
                  <Link href={`${BASE}/${course}/${encodeURIComponent(p.id)}`} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.title}</span>
                    {p.tags[0] && <span className="hidden text-xs text-muted-foreground sm:block">{p.tags[0]}</span>}
                    <Tag tone={TONE[p.difficulty]}>{p.difficulty}</Tag>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

/** One problem: statement on the left, editor and results on the right. */
export function OppeWorkspace({ course, id }: { course: string; id: string }) {
  const [problem, setProblem] = useState<OppeProblem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
    api<{ problem: OppeProblem }>(`?course=${encodeURIComponent(course)}&id=${encodeURIComponent(id)}`)
      .then((r) => {
        setProblem(r.problem)
        let saved: string | null = null
        try {
          saved = localStorage.getItem(`bsprep:oppe:${r.problem.id}`)
        } catch {}
        setCode(saved ?? r.problem.starterCode)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the problem"))
  }, [course, id])

  function edit(value: string) {
    setCode(value)
    try {
      localStorage.setItem(`bsprep:oppe:${id}`, value)
    } catch {}
  }

  const canRun = problem?.language === "python"

  async function run() {
    if (!problem) return
    setRunning(true)
    setRunError(null)
    setResult(null)
    try {
      setResult(await runPython(code, problem.setupCode, problem.functionName, problem.tests))
    } catch (e) {
      setRunError(e instanceof Error ? e.message : "Could not run the code")
    } finally {
      setRunning(false)
    }
  }

  const passed = result?.tests.filter((t) => t.ok).length ?? 0

  return (
    <div className="space-y-4">
      <Back href={`${BASE}/${course}/all`}>Problems</Back>
      {error ? (
        <Notice tone="error">{error}</Notice>
      ) : !problem ? (
        <div className="h-96 animate-pulse rounded-2xl border bg-muted/50" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">{problem.title}</h1>
              <Tag tone={TONE[problem.difficulty]}>{problem.difficulty}</Tag>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{problem.description || "No description provided."}</p>
            {problem.tests.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Example</p>
                {problem.tests.slice(0, 2).map((t, i) => (
                  <div key={i} className="rounded-xl bg-muted p-3 font-mono text-xs">
                    <p><span className="text-muted-foreground">Input </span>{t.input || "(none)"}</p>
                    <p><span className="text-muted-foreground">Output </span>{t.output}</p>
                  </div>
                ))}
              </div>
            )}
            {problem.hint && <p className="mt-4 text-sm text-muted-foreground">Hint: {problem.hint}</p>}
          </Card>

          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border">
              <CodeMirror
                value={code}
                height="360px"
                theme={dark ? oneDark : "light"}
                extensions={problem.language === "java" ? [java()] : problem.language === "python" ? [python()] : []}
                onChange={edit}
                basicSetup={{ lineNumbers: true, foldGutter: false, tabSize: 4 }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canRun ? (
                <button className={btnPrimary} onClick={run} disabled={running}>
                  <Play className="size-4" /> {running ? "Running" : "Run"}
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">Running is available for Python courses. For this course you can write and review your answer here.</p>
              )}
              <button className={btnGhost} onClick={() => edit(problem.starterCode)}>Reset code</button>
            </div>

            {runError && <Notice tone="error">{runError}</Notice>}
            {result && (
              <div className="space-y-2">
                {result.error ? (
                  <pre className="overflow-x-auto rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{result.error}</pre>
                ) : (
                  <>
                    {result.tests.length > 0 && <p className="text-sm font-bold">{passed} of {result.tests.length} tests passed</p>}
                    {result.tests.map((t, i) => (
                      <div key={i} className={cn("rounded-xl border p-3 font-mono text-xs", t.ok ? "border-chart-4/40 bg-chart-4/10" : "border-destructive/30 bg-destructive/10")}>
                        <p className="mb-1 flex items-center gap-1.5 font-sans text-sm font-semibold">{t.ok ? <Check className="size-4" /> : <X className="size-4" />} Test {i + 1}</p>
                        <p><span className="text-muted-foreground">Input </span>{t.input}</p>
                        <p><span className="text-muted-foreground">Expected </span>{t.expected}</p>
                        <p><span className="text-muted-foreground">Got </span>{t.got}</p>
                      </div>
                    ))}
                    {result.stdout && <pre className="overflow-x-auto rounded-xl border bg-muted p-3 text-xs">{result.stdout}</pre>}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
