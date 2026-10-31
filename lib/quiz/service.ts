// Server only. Picks the questions for a test and grades the answers. Correct answers never leave this file's
// callers except in a grading response, so a student cannot read them out of a running test.

import { randomInt } from "node:crypto"
import { fingerprint, getCatalog, getSubject, type LoadedSubject } from "./data"
import {
  KIND_LABEL,
  type Answer,
  type ExamKind,
  type GradedItem,
  type GradeRequest,
  type QType,
  type QuizQuestion,
  type StartRequest,
  type StartResponse,
} from "./types"

export class QuizError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)))
const minutesOrNull = (m: number | null) => (m === null ? null : clamp(m, 5, 240))

function shuffle<T>(items: T[]): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function subject(id: string): Promise<LoadedSubject> {
  try {
    return await getSubject(id)
  } catch {
    throw new QuizError(404, "That subject is not available")
  }
}

const sum = (qs: QuizQuestion[]) => Math.round(qs.reduce((t, q) => t + q.marks, 0) * 100) / 100

/** Questions of a subject filtered by exam kind and type, with exact repeats across paper sets removed. */
function pool(s: LoadedSubject, kinds: ExamKind[], types?: QType[]): QuizQuestion[] {
  const seen = new Set<string>()
  const out: QuizQuestion[] = []
  for (const q of s.questions.values()) {
    if (kinds.length && !kinds.includes(s.meta.get(q.id)!.kind)) continue
    if (types?.length && !types.includes(q.type)) continue
    const fp = fingerprint(q)
    if (seen.has(fp)) continue
    seen.add(fp)
    out.push(q)
  }
  return out
}

export async function startTest(req: StartRequest): Promise<StartResponse> {
  if (req.mode === "mock") {
    const subjectId = req.paperId.split(":")[0]
    const s = await subject(subjectId)
    const paper = s.papers.find((p) => p.id === req.paperId)
    if (!paper) throw new QuizError(404, "That paper is not available")
    const questions = paper.questionIds.map((id) => s.questions.get(id)!).filter(Boolean)
    return {
      title: s.info.name,
      subtitle: [KIND_LABEL[paper.kind], paper.dateLabel, paper.set && `Set ${paper.set}`, paper.session, paper.variant].filter(Boolean).join(" · "),
      mode: "mock",
      minutes: minutesOrNull(req.minutes),
      questions,
      totalMarks: sum(questions),
    }
  }

  if (req.mode === "retry") {
    const wanted = req.items.slice(0, 100)
    const subjects = new Map<string, LoadedSubject>()
    const questions: QuizQuestion[] = []
    for (const { subjectId, id } of wanted) {
      if (!subjects.has(subjectId)) subjects.set(subjectId, await subject(subjectId))
      const q = subjects.get(subjectId)!.questions.get(id)
      if (q) questions.push(q)
    }
    if (!questions.length) throw new QuizError(400, "Nothing to retry")
    return { title: "Retry", subtitle: "Questions you missed", mode: "retry", minutes: minutesOrNull(req.minutes), questions, totalMarks: sum(questions) }
  }

  const s = await subject(req.subjectId)
  const count = req.mode === "quick" ? clamp(req.count, 5, 20) : clamp(req.count, 5, 60)
  const candidates = pool(s, req.kinds, req.mode === "custom" ? req.types : undefined)
  if (candidates.length < 5) throw new QuizError(400, "Not enough questions match those filters")
  const questions = shuffle(candidates).slice(0, count)
  const kinds = req.kinds.length ? req.kinds.map((k) => KIND_LABEL[k]).join(", ") : "All exams"
  return {
    title: s.info.name,
    subtitle: `${req.mode === "quick" ? "Quick test" : "Custom test"} · ${questions.length} questions · ${kinds}`,
    mode: req.mode,
    minutes: req.mode === "quick" ? Math.ceil(questions.length * 1.5) : minutesOrNull(req.minutes),
    questions,
    totalMarks: sum(questions),
  }
}

// ── Grading ─────────────────────────────────────────────────────────────────

const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * 1e-9)

function describe(a: Answer): string | null {
  if (a.type !== "NUM") return null
  if (a.kind === "equal") return String(a.value)
  if (a.kind === "range") return `${a.min} to ${a.max}`
  return a.values.join(" or ")
}

function earnedFor(a: Answer, response: unknown, marks: number): { earned: number; answered: boolean } {
  if (a.type === "NUM") {
    const text = typeof response === "string" ? response.trim().replace(/,/g, "") : ""
    if (!text) return { earned: 0, answered: false }
    const x = Number(text)
    if (!Number.isFinite(x)) return { earned: 0, answered: true }
    const ok = a.kind === "equal" ? close(x, a.value) : a.kind === "range" ? x >= a.min && x <= a.max : a.values.some((v) => close(x, v))
    return { earned: ok ? marks : 0, answered: true }
  }
  const picked = (Array.isArray(response) ? response : typeof response === "number" ? [response] : []).filter((n): n is number => typeof n === "number")
  if (!picked.length) return { earned: 0, answered: false }
  const right = picked.filter((id) => a.correct.includes(id)).length
  const wrong = picked.length - right
  if (a.type === "MCQ") return { earned: wrong === 0 && right === a.correct.length ? marks : 0, answered: true }
  // Multiple choice: full marks for the exact set, partial credit when nothing wrong was picked.
  if (wrong > 0) return { earned: 0, answered: true }
  return { earned: Math.round(((marks * right) / a.correct.length) * 100) / 100, answered: true }
}

export async function gradeItems(req: GradeRequest): Promise<GradedItem[]> {
  const items = req.items.slice(0, 200)
  const subjects = new Map<string, LoadedSubject>()
  const graded: GradedItem[] = []
  for (const { subjectId, id, response } of items) {
    if (!subjects.has(subjectId)) subjects.set(subjectId, await subject(subjectId))
    const s = subjects.get(subjectId)!
    const q = s.questions.get(id)
    const a = s.answers.get(id)
    const meta = s.meta.get(id)
    if (!q || !a || !meta) continue
    const { earned, answered } = earnedFor(a, response, q.marks)
    graded.push({
      id,
      subjectId,
      status: !answered ? "skipped" : earned >= q.marks ? "correct" : earned > 0 ? "partial" : "wrong",
      earned,
      marks: q.marks,
      correctOptionIds: a.type === "NUM" ? [] : a.correct,
      expected: describe(a),
      source: meta.source,
      dateLabel: meta.dateLabel,
    })
  }
  return graded
}

export async function catalog() {
  return getCatalog()
}
