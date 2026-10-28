"use client"

import { createClient } from "@/lib/supabase/client"
import { getUserCached } from "@/lib/supabase/cached-user"
import { SkRows } from "@/components/dashboard/skeleton"
import { Card, EmptyState, PageHeader, Stat, Tag } from "@/components/dashboard/ui"
import { PenTool } from "lucide-react"
import { useEffect, useState } from "react"

interface QuizAttempt {
  id: string
  quiz_id: string
  score: number
  passed: boolean
  attempted_at: string
  quiz_title: string
}

export default function QuizzesPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [stats, setStats] = useState({ totalAttempts: 0, passed: 0, avgScore: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchQuizAttempts = async () => {
      try {
        const {
          data: { user },
        } = await getUserCached()
        if (!user) return

        const { data } = await supabase
          .from("quiz_attempts")
          .select(`
            id,
            quiz_id,
            score,
            passed,
            attempted_at,
            quizzes (
              title
            )
          `)
          .eq("student_id", user.id)
          .order("attempted_at", { ascending: false })

        if (data) {
          const formattedData = data.map((attempt) => ({
            id: attempt.id,
            quiz_id: attempt.quiz_id,
            score: attempt.score,
            passed: attempt.passed,
            attempted_at: attempt.attempted_at,
            quiz_title: attempt.quizzes.title,
          }))
          setAttempts(formattedData)

          const passed = formattedData.filter((a) => a.passed).length
          const avgScore =
            formattedData.length > 0
              ? Math.round(formattedData.reduce((sum, a) => sum + a.score, 0) / formattedData.length)
              : 0

          setStats({
            totalAttempts: formattedData.length,
            passed,
            avgScore,
          })
        }
      } catch (error) {
        console.error("Error fetching quiz attempts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizAttempts()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Quiz results" description="Track your quiz performance." />

      <div className="grid gap-5 md:grid-cols-3">
        <Stat label="Total attempts" value={stats.totalAttempts} />
        <Stat label="Passed" value={stats.passed} />
        <Stat label="Average score" value={`${stats.avgScore}%`} />
      </div>

      <Card title="Recent attempts">
        {isLoading ? (
          <SkRows rows={4} />
        ) : attempts.length === 0 ? (
          <EmptyState icon={PenTool} title="No quiz attempts yet" hint="Your results will show up here once you take a quiz." />
        ) : (
          <ul className="divide-y">
            {attempts.map((attempt) => (
              <li key={attempt.id} className="flex items-center justify-between gap-4 py-3 first:pt-1 last:pb-1">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold">{attempt.quiz_title}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(attempt.attempted_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Tag tone={attempt.passed ? "green" : "red"}>{attempt.passed ? "Passed" : "Failed"}</Tag>
                  <span className="w-12 text-right text-lg font-extrabold">{attempt.score}%</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
