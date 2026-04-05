"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        } = await supabase.auth.getUser()
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
          const formattedData = data.map((attempt) => {
            const quiz = Array.isArray(attempt.quizzes) ? attempt.quizzes[0] : attempt.quizzes

            return {
              id: attempt.id,
              quiz_id: attempt.quiz_id,
              score: attempt.score,
              passed: attempt.passed,
              attempted_at: attempt.attempted_at,
              quiz_title: quiz?.title || "Untitled Quiz",
            }
          })
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Quiz Results</h1>
        <p className="text-muted-foreground">Track your quiz performance</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAttempts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.passed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Attempts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Attempts</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading quiz results...</div>
        ) : attempts.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground">No quiz attempts yet. Start taking quizzes!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{attempt.quiz_title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(attempt.attempted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{attempt.score}%</div>
                      <Badge variant={attempt.passed ? "default" : "destructive"}>
                        {attempt.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
