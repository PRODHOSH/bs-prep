"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { Card, Stat, Tag, btnGhost, btnPrimary } from "@/components/dashboard/ui"
import { Segmented } from "@/components/dashboard/controls"
import { Illustration } from "./illustration"
import { QuestionCard } from "./question-card"
import { passageRanges, summarize, type FinishedTest } from "@/lib/quiz/client"
import type { GradeStatus } from "@/lib/quiz/types"

type Filter = "all" | "wrong" | "skipped" | "correct"

const duration = (sec: number) => {
  const m = Math.floor(sec / 60)
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m ${sec % 60}s`
}

const STATUS: Record<GradeStatus, { label: string; tone: "green" | "amber" | "red" | "muted" }> = {
  correct: { label: "Correct", tone: "green" },
  partial: { label: "Partly correct", tone: "amber" },
  wrong: { label: "Wrong", tone: "red" },
  skipped: { label: "Skipped", tone: "muted" },
}

export function Results({
  finished,
  retrying,
  onRetryMissed,
  onNew,
  onBack,
}: {
  finished: FinishedTest
  retrying: boolean
  onRetryMissed: () => void
  onNew: () => void
  onBack: () => void
}) {
  const [filter, setFilter] = useState<Filter>("all")
  const { session, graded } = finished
  const s = summarize(graded)
  const questions = session.test.questions
  const ranges = useMemo(() => passageRanges(questions), [questions])
  const missed = graded.filter((g) => g.status !== "correct").length

  const rows = questions
    .map((q, i) => ({ q, i, g: graded.find((x) => x.id === q.id && x.subjectId === q.subjectId) }))
    .filter(({ g }) => {
      if (!g) return false
      if (filter === "all") return true
      if (filter === "wrong") return g.status === "wrong" || g.status === "partial"
      return g.status === filter
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Quiz prep
        </button>
        <div className="flex flex-wrap gap-2">
          {missed > 0 && (
            <button onClick={onRetryMissed} disabled={retrying} className={btnPrimary}>
              <RotateCcw className="size-4" /> {retrying ? "Building" : `Retry ${missed} missed`}
            </button>
          )}
          <button onClick={onNew} className={btnGhost}>New test</button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">{session.test.title}</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight">
              {s.earned}
              <span className="text-2xl font-bold text-muted-foreground"> / {s.total}</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{s.pct}% · {session.test.subtitle}</p>
          </div>
          <Illustration name="results" className="ml-auto hidden h-28 sm:block" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Correct" value={String(s.correct)} />
          <Stat label="Wrong" value={String(s.wrong + s.partial)} />
          <Stat label="Skipped" value={String(s.skipped)} />
          <Stat label="Time" value={duration(finished.timeSpentSec)} />
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Review</h2>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All" },
            { id: "wrong", label: "Wrong" },
            { id: "skipped", label: "Skipped" },
            { id: "correct", label: "Correct" },
          ]}
        />
      </div>

      {rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nothing in this view.</p>}

      <div className="space-y-4">
        {rows.map(({ q, i, g }) => {
          const range = ranges.get(i)
          return (
            <Card key={`${q.subjectId}:${q.id}`}>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                <Tag tone={STATUS[g!.status].tone}>{STATUS[g!.status].label}</Tag>
                <span className="font-semibold">{g!.earned} / {g!.marks}</span>
                <span className="text-muted-foreground">From {g!.source}{g!.dateLabel && g!.dateLabel !== "Date not listed" ? `, ${g!.dateLabel}` : ""}</span>
              </div>
              <QuestionCard
                question={q}
                number={i + 1}
                response={session.responses[i]}
                review={g}
                passageNote={range && range[0] !== range[1] ? `Questions ${range[0] + 1} to ${range[1] + 1} use this passage` : undefined}
              />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
