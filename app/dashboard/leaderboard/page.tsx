"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        } = await supabase.auth.getUser()

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
          const formattedData = data.map((entry) => {
            const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles

            return {
              id: entry.id,
              rank: entry.rank,
              student_name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Unknown Student",
              total_score: entry.total_score,
              courses_completed: entry.courses_completed,
            }
          })
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against other students</p>
      </div>

      {/* User Rank */}
      {userRank && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm">Your Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">Rank #{userRank.rank}</div>
                <div className="text-2xl font-bold text-primary">{userRank.total_score} points</div>
              </div>
              <div className="text-right">
                <Badge>{userRank.courses_completed} courses completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Students */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Top Students</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center text-muted-foreground">No leaderboard data available</CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <Card key={entry.id} className={index < 3 ? "border-primary/50" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        {entry.rank}
                      </div>
                      <div>
                        <h3 className="font-semibold">{entry.student_name}</h3>
                        <p className="text-sm text-muted-foreground">{entry.courses_completed} courses completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{entry.total_score}</div>
                      <p className="text-xs text-muted-foreground">points</p>
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
