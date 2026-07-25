"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ChevronLeft, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react"

interface Option {
  optionId: string
  type: "image" | "text"
  content: string
}

interface Question {
  questionFolderId: string
  questionNumber: number
  questionContent: { type: "image" | "text"; content: string }
  options: Option[]
  questionToken: string
}

interface SessionMeta {
  level: string
  course: string
  exam: string
  dateShift: string
  totalQuestions: number
}

interface AnswerState {
  selectedId: string | null
  submitted: boolean
  isCorrect: boolean | null
  xpGained: number
}

interface ExamSolverProps {
  meta: SessionMeta
  questions: Question[]
  onExit: () => void
  onXpGained: (xp: number) => void
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export function ExamSolver({ meta, questions, onExit, onXpGained }: ExamSolverProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({})
  const [elapsed, setElapsed] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  const current = questions[currentIndex]
  const answer = answers[currentIndex] ?? { selectedId: null, submitted: false, isCorrect: null, xpGained: 0 }
  const totalCorrect = Object.values(answers).filter((a) => a.isCorrect).length
  const totalXp = Object.values(answers).reduce((acc, a) => acc + a.xpGained, 0)

  useEffect(() => {
    if (sessionComplete) return
    const id = setInterval(() => setElapsed((p) => p + 1), 1000)
    return () => clearInterval(id)
  }, [sessionComplete])

  const selectOption = useCallback(
    (optionId: string) => {
      if (answer.submitted) return
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: { selectedId: optionId, submitted: false, isCorrect: null, xpGained: 0 },
      }))
    },
    [answer.submitted, currentIndex]
  )

  const submitAnswer = useCallback(async () => {
    if (!answer.selectedId || answer.submitted || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/quiz-prep/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionToken: current.questionToken,
          selectedOptionId: answer.selectedId,
          timeTakenSeconds: elapsed,
        }),
      })
      const data = await res.json()
      const xpGained = data.xpGained ?? 0
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: {
          selectedId: answer.selectedId!,
          submitted: true,
          isCorrect: data.isCorrect,
          xpGained,
        },
      }))
      if (xpGained > 0) onXpGained(xpGained)
    } finally {
      setSubmitting(false)
    }
  }, [answer, current, currentIndex, elapsed, onXpGained, submitting])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (answer.submitted) {
        if (e.key === "ArrowRight" || e.key === "Enter") {
          if (currentIndex < questions.length - 1) setCurrentIndex((p) => p + 1)
          else setSessionComplete(true)
        }
        return
      }
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 }
      const idx = map[e.key.toLowerCase()]
      if (idx !== undefined && current.options[idx]) {
        selectOption(current.options[idx].optionId)
      }
      if (e.key === "Enter") submitAnswer()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [answer.submitted, current, currentIndex, questions.length, selectOption, submitAnswer])

  if (sessionComplete) {
    const accuracy = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Session Complete</p>
            <h1 className="text-3xl font-bold tracking-tight text-black">{meta.exam}</h1>
            <p className="text-sm text-neutral-500">{meta.course} &middot; {meta.level}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Correct", value: `${totalCorrect} / ${questions.length}` },
              { label: "Accuracy", value: `${accuracy}%` },
              { label: "XP Earned", value: `+${totalXp}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-neutral-200 bg-white p-4">
                <p className="text-lg font-bold text-black">{value}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-black hover:border-black hover:shadow-sm transition-all"
          >
            Return to Course Selection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-black transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Exit
          </button>
          <span className="h-4 w-px bg-neutral-200" />
          <span className="text-xs font-semibold text-black">{meta.course}</span>
          <span className="text-xs text-neutral-400">&middot;</span>
          <span className="text-xs text-neutral-500">{meta.exam}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-neutral-500">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(elapsed)}
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-black">
            {totalCorrect} correct
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-neutral-100 shrink-0">
        <div
          className="h-full bg-black transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Split view */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Question */}
        <section className="flex w-1/2 flex-col overflow-y-auto border-r border-neutral-100 bg-white">
          <div className="border-b border-neutral-100 px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Question {currentIndex + 1}
            </span>
          </div>
          <div className="flex-1 p-6">
            {current.questionContent.type === "image" ? (
              <img
                src={current.questionContent.content}
                alt={`Question ${currentIndex + 1}`}
                className="max-h-[480px] w-full rounded-lg border border-neutral-100 object-contain"
              />
            ) : (
              <p className="text-base leading-relaxed text-black">{current.questionContent.content}</p>
            )}
          </div>
        </section>

        {/* Right: Options */}
        <section className="flex w-1/2 flex-col overflow-y-auto bg-neutral-50">
          <div className="border-b border-neutral-100 bg-white px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Select an Answer
            </span>
          </div>
          <div className="flex-1 space-y-3 p-6">
            {current.options.map((opt, i) => {
              const letter = ["A", "B", "C", "D"][i]
              const isSelected = answer.selectedId === opt.optionId
              const isSubmitted = answer.submitted

              let border = "border-neutral-200 bg-white hover:border-neutral-400"
              if (isSelected && !isSubmitted) border = "border-black bg-white ring-1 ring-black"
              if (isSelected && isSubmitted) {
                border = answer.isCorrect
                  ? "border-green-600 bg-green-50 ring-1 ring-green-500"
                  : "border-red-500 bg-red-50 ring-1 ring-red-500"
              }

              return (
                <button
                  key={opt.optionId}
                  type="button"
                  onClick={() => selectOption(opt.optionId)}
                  disabled={isSubmitted}
                  className={[
                    "group flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-all duration-150",
                    border,
                    isSubmitted ? "cursor-default" : "cursor-pointer",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums",
                      isSelected && !isSubmitted ? "bg-black text-white" : "bg-neutral-100 text-neutral-600",
                      isSelected && isSubmitted && answer.isCorrect ? "bg-green-600 text-white" : "",
                      isSelected && isSubmitted && !answer.isCorrect ? "bg-red-500 text-white" : "",
                    ].join(" ")}
                  >
                    {letter}
                  </span>
                  <div className="flex-1 min-w-0">
                    {opt.type === "image" ? (
                      <img src={opt.content} alt={`Option ${letter}`} className="max-h-20 object-contain rounded" />
                    ) : (
                      <span className="text-sm text-black">{opt.content}</span>
                    )}
                  </div>
                  {isSelected && isSubmitted && (
                    <div className="shrink-0">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </button>
              )
            })}

            {answer.submitted && (
              <div
                className={[
                  "rounded-lg border p-4 text-sm",
                  answer.isCorrect
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800",
                ].join(" ")}
              >
                <p className="font-semibold">
                  {answer.isCorrect ? "Correct" : "Incorrect"}
                  {answer.isCorrect && answer.xpGained > 0 && ` +${answer.xpGained} XP`}
                </p>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="shrink-0 border-t border-neutral-100 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Use A B C D keys to select, Enter to submit
              </p>
              <div className="flex items-center gap-3">
                {!answer.submitted ? (
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.selectedId || submitting}
                    className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? "Checking..." : "Submit"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (currentIndex < questions.length - 1) {
                        setCurrentIndex((p) => p + 1)
                      } else {
                        setSessionComplete(true)
                      }
                    }}
                    className="flex items-center gap-2 rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-neutral-800"
                  >
                    {currentIndex < questions.length - 1 ? "Next" : "Finish"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
