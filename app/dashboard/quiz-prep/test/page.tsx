"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Notice, btnPrimary } from "@/components/dashboard/ui"
import { Player } from "@/components/quiz/player"
import { Results } from "@/components/quiz/results"
import {
  clearResult,
  clearSession,
  loadResult,
  loadSession,
  newSession,
  recordHistory,
  requestGrading,
  requestTest,
  saveResult,
  saveSession,
  type ActiveSession,
  type FinishedTest,
} from "@/lib/quiz/client"

const HUB = "/dashboard/quiz-prep"

export default function QuizTestPage() {
  const router = useRouter()
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [finished, setFinished] = useState<FinishedTest | null>(null)
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const active = loadSession()
    if (active) {
      // If the clock ran out while the page was closed, the player submits straight away.
      setSession(active)
    } else {
      const result = loadResult()
      if (result) setFinished(result)
      else router.replace(HUB)
    }
    setReady(true)
  }, [router])

  const submit = useCallback(async (s: ActiveSession, timeSpentSec: number) => {
    setSubmitting(true)
    setError(null)
    try {
      const { items } = await requestGrading({
        items: s.test.questions.map((q, i) => ({ subjectId: q.subjectId, id: q.id, response: s.responses[i] ?? null })),
      })
      const result: FinishedTest = { session: s, graded: items, finishedAt: Date.now(), timeSpentSec }
      saveResult(result)
      recordHistory(result)
      clearSession()
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
      setSession(null)
      setFinished(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not grade the test. Your answers are safe, try submitting again.")
      setSubmitting(false)
    }
  }, [])

  async function retryMissed() {
    if (!finished) return
    setRetrying(true)
    try {
      const items = finished.graded.filter((g) => g.status !== "correct").map((g) => ({ subjectId: g.subjectId, id: g.id }))
      const test = await requestTest({ mode: "retry", items, minutes: null })
      clearResult()
      const next = newSession(test)
      saveSession(next)
      setFinished(null)
      setSession(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build the retry test")
    } finally {
      setRetrying(false)
    }
  }

  if (!ready) return null

  if (session) {
    return (
      <Player
        key={session.id}
        initial={session}
        submitting={submitting}
        error={error}
        onSubmit={submit}
        onLeave={() => router.push(HUB)}
        onExit={() => {
          clearSession()
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
          router.replace(HUB)
        }}
      />
    )
  }

  if (finished) {
    return (
      <div className="space-y-4">
        {error && <Notice tone="error">{error}</Notice>}
        <Results
          finished={finished}
          retrying={retrying}
          onRetryMissed={retryMissed}
          onNew={() => {
            clearResult()
            router.push(HUB)
          }}
          onBack={() => router.push(HUB)}
        />
      </div>
    )
  }

  return (
    <a href={HUB} className={btnPrimary}>
      Back to Quiz prep
    </a>
  )
}
