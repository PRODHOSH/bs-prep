// Server only. Reads data/oppe/*.json. Solutions in the source data are never sent to the browser.

import { promises as fs } from "node:fs"
import path from "node:path"
import { randomInt } from "node:crypto"
import { COURSE_NAMES, type Difficulty, type OppeCourse, type OppeProblem, type OppeSummary } from "./types"

const DIR = path.join(process.cwd(), "data", "oppe")

interface Raw {
  id: string
  title: string
  difficulty?: string
  examType?: string
  description?: string
  starterCode?: string
  testCases?: { input?: string; output?: string }[]
  language?: string
  tags?: string
  setupCode?: string
  functionName?: string
  hint?: string
}

const cache = new Map<string, OppeProblem[]>()

function normalise(r: Raw): OppeProblem | null {
  if (!r.id || !r.title) return null
  const difficulty: Difficulty = r.difficulty === "Hard" ? "Hard" : r.difficulty === "Medium" ? "Medium" : "Easy"
  return {
    id: r.id,
    title: r.title,
    difficulty,
    exam: r.examType === "OPPE 2" ? 2 : 1,
    tags: (r.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    description: r.description ?? "",
    hint: r.hint ?? "",
    starterCode: r.starterCode ?? "",
    setupCode: r.setupCode ?? "",
    functionName: r.functionName ?? "",
    language: r.language ?? "python",
    tests: (r.testCases ?? []).map((t) => ({ input: t.input ?? "", output: t.output ?? "" })),
  }
}

export async function loadCourse(id: string): Promise<OppeProblem[] | null> {
  if (!/^[a-z0-9_]+$/.test(id) || !COURSE_NAMES[id]) return null
  const hit = cache.get(id)
  if (hit) return hit
  try {
    const raw = JSON.parse(await fs.readFile(path.join(DIR, `${id}.json`), "utf8")) as Raw[]
    const list = raw.map(normalise).filter((p): p is OppeProblem => !!p)
    cache.set(id, list)
    return list
  } catch {
    return null
  }
}

export async function courses(): Promise<OppeCourse[]> {
  const out: OppeCourse[] = []
  for (const id of Object.keys(COURSE_NAMES)) {
    const list = await loadCourse(id)
    if (!list?.length) continue
    out.push({ id, name: COURSE_NAMES[id], language: list[0].language, oppe1: list.filter((p) => p.exam === 1).length, oppe2: list.filter((p) => p.exam === 2).length })
  }
  return out
}

export const summary = (p: OppeProblem): OppeSummary => ({ id: p.id, title: p.title, difficulty: p.difficulty, exam: p.exam, tags: p.tags })

/** A mock OPPE: a spread of difficulties, drawn at random from one exam. */
export function pickSet(problems: OppeProblem[], exam: 1 | 2, count: number): OppeProblem[] {
  const pool = problems.filter((p) => p.exam === exam)
  const take = (list: OppeProblem[]) => (list.length ? list.splice(randomInt(list.length), 1)[0] : null)
  const by = (d: string) => pool.filter((p) => p.difficulty === d)
  const buckets = [by("Easy"), by("Medium"), by("Hard")]
  const out: OppeProblem[] = []
  for (let i = 0; out.length < count && i < count * 3; i++) {
    const hit = take(buckets[i % 3]) ?? take(buckets.find((b) => b.length) ?? [])
    if (hit) out.push(hit)
  }
  return out
}
