"use client"

import { createClient } from "@/lib/supabase/client"
import { getUserCached } from "@/lib/supabase/cached-user"
import { SkRows } from "@/components/dashboard/skeleton"
import { Avatar, PageHeader } from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"
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
          const formattedData = data.map((entry) => {
            const profile = (Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles) as { first_name?: string; last_name?: string } | null
            return {
            id: entry.id,
            rank: entry.rank,
            student_name: `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "Student",
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

  const top = leaderboard.slice(0, 10)
  const outside = userRank && !top.some((e) => e.id === userRank.id) ? userRank : null

  const row = (entry: LeaderboardEntry, mine: boolean) => (
    <li key={entry.id} className={cn("grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_7rem_6rem]", mine && "bg-muted/60")}>
      <span className={cn("text-sm tabular-nums", entry.rank <= 3 ? "font-extrabold" : "font-medium text-muted-foreground")}>{entry.rank}</span>
      <span className="flex min-w-0 items-center gap-3">
        <Avatar name={entry.student_name} size={32} />
        <span className="truncate text-sm font-semibold">
          {entry.student_name}
          {mine && <span className="ml-2 text-xs font-medium text-muted-foreground">You</span>}
        </span>
      </span>
      <span className="hidden text-right text-sm tabular-nums text-muted-foreground sm:block">{entry.courses_completed} {entry.courses_completed === 1 ? "course" : "courses"}</span>
      <span className="text-right text-sm font-bold tabular-nums">{entry.total_score.toLocaleString("en-IN")}</span>
    </li>
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" description="Top students by points. Complete courses to move up." />

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-3 border-b bg-muted/40 px-5 py-2.5 text-xs font-semibold text-muted-foreground sm:grid-cols-[2.5rem_minmax(0,1fr)_7rem_6rem]">
          <span>#</span>
          <span>Student</span>
          <span className="hidden text-right sm:block">Completed</span>
          <span className="text-right">Points</span>
        </div>
        {isLoading ? (
          <div className="p-5"><SkRows rows={5} /></div>
        ) : leaderboard.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">Nobody is on the board yet.</p>
        ) : (
          <ol className="divide-y">
            {top.map((entry) => row(entry, entry.id === userRank?.id))}
            {outside && (
              <>
                <li className="px-5 py-1.5 text-center text-xs text-muted-foreground" aria-hidden>···</li>
                {row(outside, true)}
              </>
            )}
          </ol>
        )}
      </section>
    </div>
  )
}
