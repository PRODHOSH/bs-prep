"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SelectionCard, StepHeader } from "@/components/quiz-prep/selection-primitives"
import { ExamSolver } from "@/components/quiz-prep/exam-solver"
import { COURSES_BY_LEVEL, EXAM_TYPES, AcademicLevel, ExamType, CourseDefinition } from "@/lib/quiz-catalog"

type Step = "level" | "course" | "exam" | "dateshift" | "solving"

interface Selection {
  level: AcademicLevel | null
  course: string | null
  exam: ExamType | null
  dateShift: string | null
}

interface SessionData {
  meta: {
    level: string
    course: string
    exam: string
    dateShift: string
    totalQuestions: number
  }
  questions: Array<{
    questionFolderId: string
    questionNumber: number
    questionContent: { type: "image" | "text"; content: string }
    options: Array<{ optionId: string; type: "image" | "text"; content: string }>
    questionToken: string
  }>
}

const LEVELS: Array<{ value: AcademicLevel; description: string }> = [
  { value: "Foundation", description: "Term 1 and 2 qualifier courses" },
  { value: "Diploma", description: "Diploma in Programming and Diploma in Data Science" },
  { value: "Degree", description: "Advanced degree programme courses" },
]

const STEP_COUNT = 4

function LoadingSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading options">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-14 w-full animate-pulse rounded-lg border border-neutral-100 bg-neutral-50" />
      ))}
    </div>
  )
}

function EmptyState({ course, exam, dateShift }: Selection) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-8 py-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-400">
        <span className="text-base font-bold">?</span>
      </div>
      <h3 className="text-sm font-semibold text-black">Questions are currently being uploaded</h3>
      <p className="mx-auto mt-1 max-w-xs text-xs text-neutral-500">
        No questions are available yet for {course} &mdash; {exam} ({dateShift}). Please check back soon as our team uploads new past papers.
      </p>
    </div>
  )
}

export default function DashboardQuizPrepPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [step, setStep] = useState<Step>("level")
  const [selection, setSelection] = useState<Selection>({
    level: null,
    course: null,
    exam: null,
    dateShift: null,
  })
  const [session, setSession] = useState<SessionData | null>(null)
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsAuthenticated(false)
        router.push("/quiz-prep")
      } else {
        setIsAuthenticated(true)
      }
    })
  }, [router, supabase])

  async function loadSession(level: AcademicLevel, course: string, exam: ExamType, dateShift: string) {
    setLoadingQuestions(true)
    try {
      const url = `/api/quiz-prep/questions?level=${encodeURIComponent(level)}&course=${encodeURIComponent(course)}&exam=${encodeURIComponent(exam)}&dateShift=${encodeURIComponent(dateShift)}`
      const res = await fetch(url)
      const data = await res.json()
      setSession(data.success ? data : { meta: { level, course, exam, dateShift, totalQuestions: 0 }, questions: [] })
    } catch {
      setSession({ meta: { level, course, exam, dateShift, totalQuestions: 0 }, questions: [] })
    } finally {
      setLoadingQuestions(false)
    }
  }

  function handleLevelSelect(level: AcademicLevel) {
    setSelection((s) => ({ ...s, level }))
    setStep("course")
  }

  function handleCourseSelect(course: string) {
    setSelection((s) => ({ ...s, course }))
    setStep("exam")
  }

  function handleExamSelect(exam: ExamType) {
    setSelection((s) => ({ ...s, exam }))
    setStep("dateshift")
  }

  async function handleDateShiftSelect(dateShift: string) {
    const { level, course, exam } = selection
    if (!level || !course || !exam) return
    setSelection((s) => ({ ...s, dateShift }))
    await loadSession(level, course, exam, dateShift)
    setStep("solving")
  }

  function handleExit() {
    setStep("level")
    setSelection({ level: null, course: null, exam: null, dateShift: null })
    setSession(null)
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    )
  }

  if (step === "solving") {
    if (loadingQuestions) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center bg-white">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <p className="text-sm font-medium text-neutral-500">Fetching questions from Google Drive...</p>
          </div>
        </div>
      )
    }

    if (!session || session.questions.length === 0) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <EmptyState {...selection} />
            <button
              onClick={() => setStep("dateshift")}
              className="mx-auto flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-5 py-2 text-sm font-medium text-black hover:border-black transition-all"
            >
              Go back to shift selection
            </button>
          </div>
        </div>
      )
    }

    return (
      <ExamSolver
        meta={session.meta}
        questions={session.questions}
        onExit={handleExit}
        onXpGained={() => {}}
      />
    )
  }

  return (
    <div className="flex-1 p-6 md:p-12 lg:p-16 flex flex-col items-center justify-start min-h-[80vh]">
      <div className="w-full max-w-lg space-y-8">
        {step === "level" && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              IIT Madras BS Degree
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-black">Quiz Preparation Workspace</h1>
            <p className="text-sm text-neutral-500">
              Practise previous term quiz and end-term exam questions fetched directly from Google Drive.
            </p>
          </div>
        )}

        {step === "level" && (
          <div className="space-y-4">
            <StepHeader
              step={0}
              total={STEP_COUNT}
              title="Select Academic Level"
              subtitle="Choose your current programme level to begin."
            />
            <div className="space-y-2 pt-2">
              {LEVELS.map(({ value, description }) => (
                <SelectionCard key={value} label={value} description={description} onClick={() => handleLevelSelect(value)} />
              ))}
            </div>
          </div>
        )}

        {step === "course" && selection.level && (
          <CourseSelectionStep
            level={selection.level}
            onSelect={handleCourseSelect}
            onBack={() => setStep("level")}
          />
        )}

        {step === "exam" && selection.course && (
          <div className="space-y-4">
            <StepHeader
              step={2}
              total={STEP_COUNT}
              title="Select Exam"
              subtitle={`${selection.course} &mdash; choose exam type.`}
              onBack={() => setStep("course")}
            />
            <div className="space-y-2 pt-2">
              {EXAM_TYPES.map((exam) => (
                <SelectionCard key={exam} label={exam} onClick={() => handleExamSelect(exam)} />
              ))}
            </div>
          </div>
        )}

        {step === "dateshift" && selection.level && selection.course && selection.exam && (
          <DateShiftSelector
            level={selection.level}
            course={selection.course}
            exam={selection.exam}
            onSelect={handleDateShiftSelect}
            onBack={() => setStep("exam")}
          />
        )}
      </div>
    </div>
  )
}

function CourseSelectionStep({
  level,
  onSelect,
  onBack,
}: {
  level: AcademicLevel
  onSelect: (courseName: string) => void
  onBack: () => void
}) {
  const [diplomaTrack, setDiplomaTrack] = useState<"Programming" | "Data Science">("Programming")
  const courses = COURSES_BY_LEVEL[level]

  return (
    <div className="space-y-4">
      <StepHeader
        step={1}
        total={STEP_COUNT}
        title="Select Course"
        subtitle={`${level} level &mdash; select your course.`}
        onBack={onBack}
      />

      {level === "Diploma" && (
        <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-1 border border-neutral-200">
          <button
            type="button"
            onClick={() => setDiplomaTrack("Programming")}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              diplomaTrack === "Programming" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
            }`}
          >
            Diploma in Programming
          </button>
          <button
            type="button"
            onClick={() => setDiplomaTrack("Data Science")}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              diplomaTrack === "Data Science" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
            }`}
          >
            Diploma in Data Science
          </button>
        </div>
      )}

      <div className="space-y-2 pt-2">
        {courses
          .filter((c) => (level === "Diploma" ? c.track === diplomaTrack : true))
          .map(({ id, name, code }) => (
            <SelectionCard key={id} label={name} description={code} onClick={() => onSelect(name)} />
          ))}
      </div>
    </div>
  )
}

function DateShiftSelector({
  level,
  course,
  exam,
  onSelect,
  onBack,
}: {
  level: AcademicLevel
  course: string
  exam: ExamType
  onSelect: (dateShift: string) => void
  onBack: () => void
}) {
  const [dateShifts, setDateShifts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const url = `/api/quiz-prep/date-shifts?level=${encodeURIComponent(level)}&course=${encodeURIComponent(course)}&exam=${encodeURIComponent(exam)}`
        const res = await fetch(url)
        const data = await res.json()
        setDateShifts(Array.isArray(data.dateShifts) ? data.dateShifts : [])
      } catch {
        setDateShifts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [level, course, exam])

  return (
    <div className="space-y-4">
      <StepHeader
        step={3}
        total={STEP_COUNT}
        title="Select Exam Date & Shift"
        subtitle={`${course} &mdash; ${exam}`}
        onBack={onBack}
      />
      <div className="space-y-2 pt-2">
        {loading && <LoadingSkeleton />}
        {!loading && dateShifts.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-8 text-center">
            <p className="text-sm font-medium text-black">No exam dates currently available</p>
            <p className="mt-1 text-xs text-neutral-500">Dates will appear here as soon as papers are added to Google Drive.</p>
          </div>
        )}
        {!loading &&
          dateShifts.map((ds) => (
            <SelectionCard key={ds} label={ds} onClick={() => onSelect(ds)} />
          ))}
      </div>
    </div>
  )
}
