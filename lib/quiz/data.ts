// Server only. Reads the past-paper JSON in data/pyqs/raw and turns it into questions the app can serve.
// The raw files are large (76 MB), so a small catalog is cached on disk and each subject is loaded on demand.

import { promises as fs } from "node:fs"
import path from "node:path"
import { isBlank, safeHtml, safeImageUrl } from "./html"
import type { Answer, ExamKind, Level, PaperInfo, QType, QuizOption, QuizQuestion, SubjectInfo } from "./types"

const DATA_DIR = path.join(process.cwd(), "data", "pyqs")
const RAW_DIR = path.join(DATA_DIR, "raw")
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json")
const CATALOG_VERSION = 2

interface RawOption { id: number; text?: string | null; image?: string | null; is_correct?: boolean }
interface RawQuestion {
  id: number
  type: string
  context?: string | null
  question?: string | null
  images?: string[]
  options?: RawOption[]
  answer?: { value_start?: string | null; value_end?: string | null; answer_type?: string | null }
  marks?: string | number
}
interface RawPaper { id: string; title: string; exam_type: string; questions: RawQuestion[] }
interface RawSubject { subject_id: string; subject_name: string; papers: RawPaper[] }

export interface LoadedPaper extends PaperInfo { questionIds: number[] }
export interface LoadedSubject {
  info: SubjectInfo
  papers: LoadedPaper[]
  questions: Map<number, QuizQuestion>
  answers: Map<number, Answer>
  meta: Map<number, { source: string; dateLabel: string; kind: ExamKind }>
}

const LEVELS: Record<string, Level> = {
  maths1: "Foundation", maths2: "Foundation", stats1: "Foundation", stats2: "Foundation", ct: "Foundation",
  english1: "Foundation", english2: "Foundation", python: "Foundation",
  sw_engg: "Degree", sw_testing: "Degree",
}
export const levelOf = (id: string): Level => LEVELS[id] ?? "Diploma"

// ── Paper titles ────────────────────────────────────────────────────────────

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MON = "(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*"
const monthNo = (s: string) => MONTHS.indexOf(s.slice(0, 3).toLowerCase()) + 1

/** Titles come in several shapes: "16 Oct 2022", "2024 July07", "2022 Oct", "26 Oct". */
export function parseTitleDate(title: string): { date: string | null; label: string; year: number | null } {
  const t = title.replace(/\s+/g, " ").trim()

  let m = new RegExp(`\\b(\\d{1,2})\\s+${MON}\\.?\\s+(\\d{4})\\b`, "i").exec(t)
  if (m) {
    const [day, mon, year] = [Number(m[1]), monthNo(m[2]), Number(m[3])]
    return { date: iso(year, mon, day), label: `${day} ${MONTH_NAMES[mon - 1]} ${year}`, year }
  }
  m = new RegExp(`^(\\d{4})\\s+${MON}\\s*(\\d{1,2})?\\b`, "i").exec(t)
  if (m) {
    const [year, mon] = [Number(m[1]), monthNo(m[2])]
    const day = m[3] ? Number(m[3]) : null
    return day
      ? { date: iso(year, mon, day), label: `${day} ${MONTH_NAMES[mon - 1]} ${year}`, year }
      : { date: null, label: `${MONTH_NAMES[mon - 1]} ${year}`, year }
  }
  m = new RegExp(`\\b(\\d{1,2})\\s+${MON}\\b`, "i").exec(t)
  if (m) return { date: null, label: `${Number(m[1])} ${MONTH_NAMES[monthNo(m[2]) - 1]}`, year: null }
  return { date: null, label: "Date not listed", year: null }
}

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`

const kindOf = (examType: string): ExamKind => (/quiz\s*1/i.test(examType) ? "quiz1" : /quiz\s*2/i.test(examType) ? "quiz2" : "endterm")

function paperMeta(title: string, examType: string) {
  const { date, label, year } = parseTitleDate(title)
  const set = /\b(Q[A-Z]{2,3}\d|AD[A-Z]\d)\b/.exec(title)?.[1] ?? null
  const session = (/\b(FN|AN)\b/.exec(title)?.[1] as "FN" | "AN" | undefined) ?? null
  const variant = /improvement/i.test(title) ? "Improvement" : /re-?attempt/i.test(title) ? "Reattempt" : null
  return { kind: kindOf(examType), date, dateLabel: label, year, set, session, variant } as const
}

// ── Questions ───────────────────────────────────────────────────────────────

const num = (v: unknown) => {
  if (v === null || v === undefined || v === "") return NaN
  const s = String(v).trim()
  const frac = /^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(s)
  return frac ? Number(frac[1]) / Number(frac[2]) : Number(s)
}

function parseAnswer(q: RawQuestion, type: QType, options: QuizOption[]): Answer | null {
  if (type === "NUM") {
    const a = q.answer ?? {}
    const kind = (a.answer_type ?? "").toLowerCase()
    if (kind === "range") {
      const [lo, hi] = [num(a.value_start), num(a.value_end)]
      return Number.isFinite(lo) && Number.isFinite(hi) ? { type: "NUM", kind: "range", min: Math.min(lo, hi), max: Math.max(lo, hi) } : null
    }
    if (kind === "set") {
      const values = String(a.value_start ?? "").split(/[,;|]/).map(num).filter(Number.isFinite)
      return values.length ? { type: "NUM", kind: "set", values } : null
    }
    const value = num(a.value_start)
    return Number.isFinite(value) ? { type: "NUM", kind: "equal", value } : null
  }
  const correct = (q.options ?? []).filter((o) => o.is_correct).map((o) => o.id)
  if (options.length < 2 || correct.length === 0) return null
  return { type, correct }
}

function buildQuestion(q: RawQuestion, subjectId: string): { question: QuizQuestion; answer: Answer } | null {
  const rawType = q.type === "SA" ? "NUM" : q.type
  if (rawType !== "MCQ" && rawType !== "MSQ" && rawType !== "NUM") return null // comprehension headers are passages, not questions
  const marks = Number(q.marks)
  if (!Number.isFinite(marks) || marks <= 0) return null // 0-mark items are exam instructions

  const html = safeHtml(q.question)
  const images = (q.images ?? []).map(safeImageUrl).filter((u): u is string => !!u)
  const passageHtml = safeHtml(q.context)
  if (isBlank(html) && images.length === 0 && isBlank(passageHtml)) return null

  const options: QuizOption[] = (q.options ?? []).map((o) => ({ id: o.id, html: safeHtml(o.text), image: safeImageUrl(o.image) }))
  const answer = parseAnswer(q, rawType, options)
  if (!answer) return null

  return {
    answer,
    question: {
      id: q.id,
      subjectId,
      type: rawType,
      marks,
      html,
      images,
      passage: isBlank(passageHtml) ? null : { html: passageHtml },
      options: rawType === "NUM" ? [] : options,
    },
  }
}

export const fingerprint = (q: QuizQuestion) => [q.type, q.html, q.images.join(), q.passage?.html ?? "", q.options.map((o) => o.html + o.image).join("|")].join("\u0001")

function normalizeSubject(raw: RawSubject, id: string): LoadedSubject {
  const questions = new Map<number, QuizQuestion>()
  const answers = new Map<number, Answer>()
  const meta: LoadedSubject["meta"] = new Map()
  const papers: LoadedPaper[] = []
  const seenPaperIds = new Set<string>()
  const seenContent = new Set<string>()

  for (const p of raw.papers ?? []) {
    const info = paperMeta(p.title, p.exam_type)
    const ids: number[] = []
    let marks = 0
    for (const rq of p.questions ?? []) {
      const built = buildQuestion(rq, id)
      if (!built) continue
      if (!questions.has(rq.id)) {
        questions.set(rq.id, built.question)
        answers.set(rq.id, built.answer)
        meta.set(rq.id, { source: p.title.replace(/\s+/g, " ").trim(), dateLabel: info.dateLabel, kind: info.kind })
      }
      ids.push(rq.id)
      marks += built.question.marks
    }
    if (ids.length === 0) continue
    let paperId = `${id}:${p.id}`
    for (let n = 2; seenPaperIds.has(paperId); n++) paperId = `${id}:${p.id}#${n}`
    seenPaperIds.add(paperId)
    papers.push({ id: paperId, subjectId: id, title: p.title.replace(/\s+/g, " ").trim(), ...info, questions: ids.length, marks, questionIds: ids })
  }

  // Newest first; papers without a full date go after dated ones.
  papers.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title))

  // "questions" for the catalog counts distinct questions, ignoring exact repeats across sets.
  for (const q of questions.values()) seenContent.add(fingerprint(q))
  const info: SubjectInfo = { id, name: raw.subject_name, level: levelOf(id), papers: papers.length, questions: seenContent.size }
  return { info, papers, questions, answers, meta }
}

// ── Loading and caching ─────────────────────────────────────────────────────

async function readRaw(id: string): Promise<RawSubject> {
  if (!/^[a-z0-9_]+$/.test(id)) throw new Error("Unknown subject")
  return JSON.parse(await fs.readFile(path.join(RAW_DIR, `${id}.json`), "utf8")) as RawSubject
}

const subjectCache = new Map<string, Promise<LoadedSubject>>()
const CACHE_LIMIT = 5

export function getSubject(id: string): Promise<LoadedSubject> {
  const hit = subjectCache.get(id)
  if (hit) {
    subjectCache.delete(id)
    subjectCache.set(id, hit) // most recently used goes last
    return hit
  }
  const loading = readRaw(id).then((raw) => normalizeSubject(raw, id))
  loading.catch(() => subjectCache.delete(id))
  subjectCache.set(id, loading)
  while (subjectCache.size > CACHE_LIMIT) subjectCache.delete(subjectCache.keys().next().value as string)
  return loading
}

export interface Catalog {
  v: number
  builtAt: string
  subjects: SubjectInfo[]
  papers: PaperInfo[]
}

let catalogPromise: Promise<Catalog | null> | null = null

export const dataAvailable = async () => fs.access(path.join(RAW_DIR, "subjects_index.json")).then(() => true, () => false)

async function newestRawMtime() {
  const names = await fs.readdir(RAW_DIR)
  const stats = await Promise.all(names.filter((n) => n.endsWith(".json")).map((n) => fs.stat(path.join(RAW_DIR, n))))
  return Math.max(0, ...stats.map((s) => s.mtimeMs))
}

async function buildCatalog(): Promise<Catalog> {
  const index = JSON.parse(await fs.readFile(path.join(RAW_DIR, "subjects_index.json"), "utf8")) as { id: string }[]
  const subjects: SubjectInfo[] = []
  const papers: PaperInfo[] = []
  for (const { id } of index) {
    try {
      const s = normalizeSubject(await readRaw(id), id) // not cached: only the summary is kept
      subjects.push(s.info)
      for (const { questionIds: _ids, ...p } of s.papers) papers.push(p)
    } catch {
      // a missing or broken subject file should not take the whole catalog down
    }
  }
  const order = { Foundation: 0, Diploma: 1, Degree: 2 } as const
  subjects.sort((a, b) => order[a.level] - order[b.level] || a.name.localeCompare(b.name))
  return { v: CATALOG_VERSION, builtAt: new Date().toISOString(), subjects, papers }
}

export function getCatalog(): Promise<Catalog | null> {
  catalogPromise ??= (async () => {
    if (!(await dataAvailable())) return null
    try {
      const [file, newest] = await Promise.all([fs.readFile(CATALOG_FILE, "utf8"), newestRawMtime()])
      const cached = JSON.parse(file) as Catalog
      if (cached.v === CATALOG_VERSION && Date.parse(cached.builtAt) > newest) return cached
    } catch {
      // no usable cache yet
    }
    const catalog = await buildCatalog()
    await fs.writeFile(CATALOG_FILE, JSON.stringify(catalog)).catch(() => {}) // read-only hosts just rebuild in memory
    return catalog
  })()
  catalogPromise.catch(() => (catalogPromise = null))
  return catalogPromise
}
