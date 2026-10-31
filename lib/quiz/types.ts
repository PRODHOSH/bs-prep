// Shared by the quiz API routes and the quiz UI. Nothing in here touches the filesystem.

export type QType = "MCQ" | "MSQ" | "NUM"
export type ExamKind = "quiz1" | "quiz2" | "endterm"
export type Level = "Foundation" | "Diploma" | "Degree"
export type Mode = "mock" | "quick" | "custom" | "retry"

export const KIND_LABEL: Record<ExamKind, string> = { quiz1: "Quiz 1", quiz2: "Quiz 2", endterm: "End term" }
export const TYPE_LABEL: Record<QType, string> = { MCQ: "Single choice", MSQ: "Multiple choice", NUM: "Numeric" }
/** Suggested durations for a full mock. The student can change them before starting. */
export const KIND_MINUTES: Record<ExamKind, number> = { quiz1: 90, quiz2: 90, endterm: 120 }

export interface SubjectInfo {
  id: string
  name: string
  level: Level
  papers: number
  questions: number
}

export interface PaperInfo {
  id: string
  subjectId: string
  title: string
  kind: ExamKind
  /** ISO date when the paper title carries a full date, otherwise null. */
  date: string | null
  /** "16 Oct 2022", "Oct 2022", "26 Oct" or "Date not listed". */
  dateLabel: string
  year: number | null
  set: string | null
  session: "FN" | "AN" | null
  variant: "Improvement" | "Reattempt" | null
  questions: number
  marks: number
}

export interface QuizOption {
  id: number
  html: string
  image: string | null
}

export interface QuizPassage {
  html: string
}

/** What the browser receives while a test is running. Never contains the answer. */
export interface QuizQuestion {
  id: number
  subjectId: string
  type: QType
  marks: number
  html: string
  images: string[]
  passage: QuizPassage | null
  options: QuizOption[]
}

export type Answer =
  | { type: "MCQ" | "MSQ"; correct: number[] }
  | { type: "NUM"; kind: "equal"; value: number }
  | { type: "NUM"; kind: "range"; min: number; max: number }
  | { type: "NUM"; kind: "set"; values: number[] }

/** A student's answer: an option id, a list of option ids, or the text typed into a numeric box. */
export type Response = number | number[] | string | null

export interface CatalogResponse {
  available: boolean
  subjects: SubjectInfo[]
}

export type StartRequest =
  | { mode: "mock"; paperId: string; minutes: number | null }
  | { mode: "quick"; subjectId: string; count: number; kinds: ExamKind[] }
  | {
      mode: "custom"
      subjectId: string
      count: number
      kinds: ExamKind[]
      types: QType[]
      minutes: number | null
    }
  | { mode: "retry"; items: { subjectId: string; id: number }[]; minutes: number | null }

export interface StartResponse {
  title: string
  subtitle: string
  mode: Mode
  minutes: number | null
  questions: QuizQuestion[]
  totalMarks: number
}

export interface GradeRequest {
  items: { subjectId: string; id: number; response: Response }[]
}

export type GradeStatus = "correct" | "partial" | "wrong" | "skipped"

export interface GradedItem {
  id: number
  subjectId: string
  status: GradeStatus
  earned: number
  marks: number
  correctOptionIds: number[]
  expected: string | null
  source: string
  dateLabel: string
}

export interface GradeResponse {
  items: GradedItem[]
}
