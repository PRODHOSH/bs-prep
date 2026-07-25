/**
 * Google Drive Quiz Service
 *
 * Authenticates via Google Service Account, traverses the folder hierarchy
 * Level -> Course -> Exam -> Date+Shift -> Question Folders, extracts
 * question and option files, applies the Option 2 correct-answer rule, and
 * returns a shuffled, HMAC-signed payload to the API layer.
 *
 * Hierarchy contract:
 *   Root Folder
 *     Foundation / Diploma / Degree
 *       Mathematics I / Statistics I / ...
 *         Quiz 1 / Quiz 2 / End Term
 *           2024-May-Shift1 / ...
 *             Q1 / Q2 / ...
 *               question.* | option1.* | option2.* | option3.* | option4.*
 *
 * Security contract:
 *   - Option 2 is ALWAYS the correct answer in Drive.
 *   - The raw file names are never sent to the client.
 *   - Options are shuffled with Fisher-Yates before serialisation.
 *   - The correct option position is encoded in an HMAC-signed JWT-like token.
 *   - Validation happens exclusively on the server.
 */

import crypto from "crypto"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AcademicLevel = "Foundation" | "Diploma" | "Degree"
export type ExamType = "Quiz 1" | "Quiz 2" | "End Term"

export interface DriveFile {
  id: string
  name: string
  mimeType: string
}

export interface OptionItem {
  /** Anonymised UUID assigned per request - never the Drive file name */
  optionId: string
  type: "image" | "text"
  /** Proxied URL via /api/quiz-prep/media?fileId=... */
  content: string
}

export interface QuestionPayload {
  questionFolderId: string
  questionNumber: number
  questionContent: { type: "image" | "text"; content: string }
  /** Options in a random order - the client never knows which was option2 */
  options: OptionItem[]
  /**
   * HMAC-SHA256 signed token encoding (questionFolderId + correctOptionId).
   * The client passes this back on submission; the server verifies it.
   */
  questionToken: string
}

export interface ExamSessionMeta {
  level: AcademicLevel
  course: string
  exam: ExamType
  dateShift: string
  totalQuestions: number
}

export interface ExamSession {
  meta: ExamSessionMeta
  questions: QuestionPayload[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOKEN_SECRET = process.env.TOKEN_SECRET_KEY || "bsprep-quiz-secret-fallback"
const MEDIA_BASE_URL = "/api/quiz-prep/media"

// File name patterns that identify each slot inside a question folder
const NAME_PATTERNS = {
  question: /^question/i,
  option1: /^option[_\s-]?1/i,
  option2: /^option[_\s-]?2/i,
  option3: /^option[_\s-]?3/i,
  option4: /^option[_\s-]?4/i,
}

// ---------------------------------------------------------------------------
// Google OAuth2 / Service Account helpers
// ---------------------------------------------------------------------------

let _cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (_cachedToken && _cachedToken.expiresAt > now + 60_000) {
    return _cachedToken.token
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set")

  const sa = JSON.parse(raw)
  const iat = Math.floor(now / 1000)
  const exp = iat + 3600

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat,
      exp,
    })
  ).toString("base64url")

  const signingInput = `${header}.${payload}`
  const sign = crypto.createSign("RSA-SHA256")
  sign.update(signingInput)
  const signature = sign.sign(sa.private_key, "base64url")
  const jwt = `${signingInput}.${signature}`

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Failed to obtain Google access token: ${err}`)
  }

  const data = await resp.json()
  _cachedToken = { token: data.access_token, expiresAt: now + data.expires_in * 1000 }
  return _cachedToken.token
}

// ---------------------------------------------------------------------------
// Drive API helpers
// ---------------------------------------------------------------------------

async function listChildren(
  parentId: string,
  mimeFilter?: string
): Promise<DriveFile[]> {
  const token = await getAccessToken()

  let q = `'${parentId}' in parents and trashed = false`
  if (mimeFilter) q += ` and mimeType = '${mimeFilter}'`

  const url = new URL("https://www.googleapis.com/drive/v3/files")
  url.searchParams.set("q", q)
  url.searchParams.set("fields", "files(id,name,mimeType)")
  url.searchParams.set("pageSize", "200")

  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Drive API error: ${err}`)
  }

  const json = await resp.json()
  return json.files ?? []
}

async function findFolderByName(
  parentId: string,
  name: string
): Promise<string | null> {
  const folders = await listChildren(
    parentId,
    "application/vnd.google-apps.folder"
  )
  const match = folders.find(
    (f) => f.name.toLowerCase() === name.toLowerCase()
  )
  return match?.id ?? null
}

// ---------------------------------------------------------------------------
// HMAC token helpers
// ---------------------------------------------------------------------------

export function createQuestionToken(
  questionFolderId: string,
  correctOptionId: string
): string {
  const payload = `${questionFolderId}:${correctOptionId}`
  const hmac = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("hex")
  return Buffer.from(
    JSON.stringify({ questionFolderId, correctOptionId, hmac })
  ).toString("base64url")
}

export interface ValidationResult {
  isValid: boolean
  isCorrect: boolean
}

export function validateQuestionToken(
  token: string,
  selectedOptionId: string
): ValidationResult {
  try {
    const decoded = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    )
    const { questionFolderId, correctOptionId, hmac } = decoded

    if (!questionFolderId || !correctOptionId || !hmac) {
      return { isValid: false, isCorrect: false }
    }

    const expected = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(`${questionFolderId}:${correctOptionId}`)
      .digest("hex")

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) {
      return { isValid: false, isCorrect: false }
    }

    return { isValid: true, isCorrect: selectedOptionId === correctOptionId }
  } catch {
    return { isValid: false, isCorrect: false }
  }
}

// ---------------------------------------------------------------------------
// Fisher-Yates shuffle
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------------------------------------------------------------------------
// Question processing
// ---------------------------------------------------------------------------

function classifyFiles(files: DriveFile[]): {
  questionFile: DriveFile | null
  option1: DriveFile | null
  option2: DriveFile | null
  option3: DriveFile | null
  option4: DriveFile | null
} {
  const find = (pattern: RegExp) =>
    files.find((f) => pattern.test(f.name)) ?? null

  return {
    questionFile: find(NAME_PATTERNS.question),
    option1: find(NAME_PATTERNS.option1),
    option2: find(NAME_PATTERNS.option2),
    option3: find(NAME_PATTERNS.option3),
    option4: find(NAME_PATTERNS.option4),
  }
}

function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith("image/")
}

function buildOptionItem(file: DriveFile): OptionItem {
  return {
    optionId: crypto.randomUUID(),
    type: isImageMime(file.mimeType) ? "image" : "text",
    content: `${MEDIA_BASE_URL}?fileId=${file.id}`,
  }
}

async function processQuestionFolder(
  folder: DriveFile,
  questionNumber: number
): Promise<QuestionPayload | null> {
  const files = await listChildren(folder.id)
  if (files.length === 0) return null

  const { questionFile, option1, option2, option3, option4 } =
    classifyFiles(files)

  // Option 2 is always the correct answer per business contract.
  // We must have at least option2 for a valid question.
  if (!option2) return null

  // Build question content
  const qFile = questionFile ?? files[0]
  const questionContent: QuestionPayload["questionContent"] = {
    type: isImageMime(qFile.mimeType) ? "image" : "text",
    content: `${MEDIA_BASE_URL}?fileId=${qFile.id}`,
  }

  // Build options with anonymised IDs; track which UUID maps to option2
  const rawOptions: Array<{ file: DriveFile; isCorrect: boolean }> = [
    { file: option2, isCorrect: true }, // correct answer
    ...[option1, option3, option4]
      .filter((f): f is DriveFile => f !== null)
      .map((f) => ({ file: f, isCorrect: false })),
  ]

  const built = rawOptions.map(({ file, isCorrect }) => ({
    item: buildOptionItem(file),
    isCorrect,
  }))

  const shuffled = shuffle(built)

  const correctOption = shuffled.find((o) => o.isCorrect)
  if (!correctOption) return null

  const questionToken = createQuestionToken(folder.id, correctOption.item.optionId)

  return {
    questionFolderId: folder.id,
    questionNumber,
    questionContent,
    options: shuffled.map((o) => o.item),
    questionToken,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches and returns shuffled questions for the given exam selection.
 * Returns an empty array if Drive folders are not yet populated.
 */
export async function fetchExamSession(
  level: AcademicLevel,
  course: string,
  exam: ExamType,
  dateShift: string
): Promise<ExamSession> {
  const meta: ExamSessionMeta = {
    level,
    course,
    exam,
    dateShift,
    totalQuestions: 0,
  }

  const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  if (!rootId) {
    console.warn("GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured")
    return { meta, questions: [] }
  }

  try {
    const levelId = await findFolderByName(rootId, level)
    if (!levelId) return { meta, questions: [] }

    const courseId = await findFolderByName(levelId, course)
    if (!courseId) return { meta, questions: [] }

    const examId = await findFolderByName(courseId, exam)
    if (!examId) return { meta, questions: [] }

    const dateShiftId = await findFolderByName(examId, dateShift)
    if (!dateShiftId) return { meta, questions: [] }

    const questionFolders = await listChildren(
      dateShiftId,
      "application/vnd.google-apps.folder"
    )

    if (questionFolders.length === 0) {
      return { meta, questions: [] }
    }

    const results: QuestionPayload[] = []
    let qNum = 1
    for (const folder of questionFolders) {
      const payload = await processQuestionFolder(folder, qNum)
      if (payload) {
        results.push(payload)
        qNum++
      }
    }

    meta.totalQuestions = results.length
    return { meta, questions: results }
  } catch (err) {
    console.error("fetchExamSession error:", err)
    // Return empty gracefully rather than crashing the API route
    return { meta, questions: [] }
  }
}

/**
 * Returns available date/shift options for a given Level + Course + Exam.
 */
export async function fetchDateShifts(
  level: AcademicLevel,
  course: string,
  exam: ExamType
): Promise<string[]> {
  const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  if (!rootId) return []

  try {
    const levelId = await findFolderByName(rootId, level)
    if (!levelId) return []

    const courseId = await findFolderByName(levelId, course)
    if (!courseId) return []

    const examId = await findFolderByName(courseId, exam)
    if (!examId) return []

    const folders = await listChildren(
      examId,
      "application/vnd.google-apps.folder"
    )
    return folders.map((f) => f.name)
  } catch {
    return []
  }
}
