"use client"

import type { CatalogResponse, GradeRequest, GradeResponse, GradedItem, Mode, PaperInfo, QuizQuestion, Response, StartRequest, StartResponse } from "./types"

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error || "Something went wrong")
  return body as T
}

const post = (body: unknown): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

export const fetchSubjects = () => call<CatalogResponse>("/api/quiz/catalog")
export const fetchPapers = (subject: string) => call<CatalogResponse & { papers: PaperInfo[] }>(`/api/quiz/catalog?subject=${encodeURIComponent(subject)}`)
export const requestTest = (req: StartRequest) => call<StartResponse>("/api/quiz/start", post(req))
export const requestGrading = (req: GradeRequest) => call<GradeResponse>("/api/quiz/grade", post(req))

// ── Test in progress and its result, kept in this browser ───────────────────

export interface ActiveSession {
  id: string
  /** Epoch ms. The clock runs from here, so a refresh cannot reset the timer. */
  startedAt: number
  test: StartResponse
  responses: Record<number, Response>
  marked: number[]
  current: number
}

export interface FinishedTest {
  session: ActiveSession
  graded: GradedItem[]
  finishedAt: number
  timeSpentSec: number
}

export interface HistoryEntry {
  id: string
  finishedAt: number
  title: string
  subtitle: string
  mode: Mode
  earned: number
  total: number
  correct: number
  wrong: number
  skipped: number
  timeSpentSec: number
  missed: { subjectId: string; id: number }[]
}

const KEYS = { session: "bsprep:quiz:session:v1", result: "bsprep:quiz:result:v1", history: "bsprep:quiz:history:v1" }

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
  } catch {
    // storage full or blocked: the test still works, it just will not survive a refresh
  }
}
const remove = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {}
}

export const loadSession = () => read<ActiveSession>(KEYS.session)
export const saveSession = (s: ActiveSession) => write(KEYS.session, s)
export const clearSession = () => remove(KEYS.session)
export const loadResult = () => read<FinishedTest>(KEYS.result)
export const saveResult = (r: FinishedTest) => write(KEYS.result, r)
export const clearResult = () => remove(KEYS.result)
export const loadHistory = () => read<HistoryEntry[]>(KEYS.history) ?? []

export function newSession(test: StartResponse): ActiveSession {
  return { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, startedAt: Date.now(), test, responses: {}, marked: [], current: 0 }
}

export const isAnswered = (r: Response | undefined) => (Array.isArray(r) ? r.length > 0 : typeof r === "string" ? r.trim() !== "" : r !== null && r !== undefined)

export function summarize(graded: GradedItem[]) {
  const count = (s: GradedItem["status"]) => graded.filter((g) => g.status === s).length
  const earned = Math.round(graded.reduce((t, g) => t + g.earned, 0) * 100) / 100
  const total = Math.round(graded.reduce((t, g) => t + g.marks, 0) * 100) / 100
  return { earned, total, pct: total ? Math.round((earned / total) * 100) : 0, correct: count("correct"), partial: count("partial"), wrong: count("wrong"), skipped: count("skipped") }
}

export function recordHistory(finished: FinishedTest) {
  const s = summarize(finished.graded)
  const entry: HistoryEntry = {
    id: finished.session.id,
    finishedAt: finished.finishedAt,
    title: finished.session.test.title,
    subtitle: finished.session.test.subtitle,
    mode: finished.session.test.mode,
    earned: s.earned,
    total: s.total,
    correct: s.correct,
    wrong: s.wrong + s.partial,
    skipped: s.skipped,
    timeSpentSec: finished.timeSpentSec,
    missed: finished.graded.filter((g) => g.status !== "correct").slice(0, 100).map((g) => ({ subjectId: g.subjectId, id: g.id })),
  }
  write(KEYS.history, [entry, ...loadHistory().filter((h) => h.id !== entry.id)].slice(0, 50))
}

export const clearHistory = () => remove(KEYS.history)

/** The question numbers at which a passage first appears, so we can say "Questions 3 to 5 use this passage". */
export function passageRanges(questions: QuizQuestion[]): Map<number, [number, number]> {
  const ranges = new Map<number, [number, number]>()
  let start = -1
  for (let i = 0; i < questions.length; i++) {
    const html = questions[i].passage?.html
    if (!html) {
      start = -1
      continue
    }
    const same = start >= 0 && questions[start].passage?.html === html
    if (!same) start = i
    ranges.set(i, [start, i])
    const first = ranges.get(start)!
    for (let j = start; j <= i; j++) ranges.set(j, [first[0], i])
  }
  return ranges
}
