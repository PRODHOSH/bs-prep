"use client"

import { createClient } from "@/lib/supabase/client"
import { getUserCached } from "@/lib/supabase/cached-user"
import { SkRows } from "@/components/dashboard/skeleton"
import { Avatar, Card, PageHeader, Tag } from "@/components/dashboard/ui"
import { useEffect, useState } from "react"

interface LeaderboardEntry {
  id: string
  rank: number
  student_name: string
  total_score: number
  courses_completed: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const {
          data: { user },
        } = await getUserCached()

        const { data } = await supabase
          .from("leaderboard")
          .select(`
            id,
            rank,
            total_score,
            courses_completed,
            profiles (
              first_name,
              last_name
            )
          `)
          .order("rank", { ascending: true })

        if (data) {
          const formattedData = data.map((entry) => ({
            id: entry.id,
            rank: entry.rank,
            student_name: `${entry.profiles.first_name} ${entry.profiles.last_name}`.trim(),
            total_score: entry.total_score,
            courses_completed: entry.courses_completed,
          }))
          setLeaderboard(formattedData)

          if (user) {
            const userEntry = formattedData.find((entry) => entry.id === user.id)
            if (userEntry) {
              setUserRank(userEntry)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" description="See how you rank against other students." />

      {userRank && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-gradient-to-br from-chart-1/15 via-card to-card p-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Your rank</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">#{userRank.rank}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-primary">{userRank.total_score} <span className="text-sm font-medium text-muted-foreground">points</span></p>
            <Tag className="mt-1">{userRank.courses_completed} courses completed</Tag>
          </div>
        </div>
      )}

      <Card title="Top students" aside="Top 10">
        {isLoading ? (
          <SkRows rows={4} />
        ) : leaderboard.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No leaderboard data available.</p>
        ) : (
          <ol className="divide-y">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <li key={entry.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                <span className="w-6 text-xs font-bold text-muted-foreground">#{entry.rank}</span>
                <Avatar name={entry.student_name} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{entry.student_name}</span>
                  <span className="block text-xs text-muted-foreground">{entry.courses_completed} courses completed</span>
                </span>
                <span className="flex items-center gap-1.5 text-sm font-bold">
                  <span className={index === 0 ? "size-2.5 rounded-full bg-chart-2" : index === 1 ? "size-2.5 rounded-full bg-muted-foreground/50" : index === 2 ? "size-2.5 rounded-full bg-chart-3" : "hidden"} />
                  {entry.total_score}
                  <span className="text-xs font-medium text-muted-foreground">pts</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}
