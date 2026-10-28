"use client"

import { Calendar, Clock, Video, Youtube } from "lucide-react"
import { Tag } from "@/components/dashboard/ui"
import { btnGhost, btnPrimary } from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

export const COURSE_NAMES: Record<string, string> = {
  ct: "Computational Thinking",
  "math-1": "Mathematics for Data Science I",
  "stats-1": "Statistics I",
  python: "Programming in Python",
  "qualifier-python": "Programming in Python",
  "qualifier-java": "Programming in Java",
  "math-2": "Mathematics for Data Science II",
  "stats-2": "Statistics II",
  "english-1": "English I",
  "english-2": "English II",
  doubts: "Doubt session",
}

export type ClassStatus = "live" | "upcoming" | "completed"

export function classStatus(date: string, time: string): ClassStatus {
  const d = new Date(date)
  const [h, m] = time.split(":").map(Number)
  d.setHours(h, m, 0, 0)
  const diff = Math.floor((d.getTime() - Date.now()) / 60000)
  if (diff < -60) return "completed"
  if (diff <= 15) return "live"
  return "upcoming"
}

const time12 = (t: string) => {
  const [h, m = "00"] = t.split(":")
  const hour = parseInt(h, 10)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`
}

export function LiveClassTile({
  course,
  topic,
  meetingLink,
  time,
  date,
  youtubeLink,
}: {
  course: string
  topic: string
  meetingLink: string
  time: string
  date: string
  youtubeLink?: string
}) {
  const status = classStatus(date, time)
  const day = new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

  return (
    <article className="flex h-full flex-col rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between">
        {status === "live" ? (
          <Tag tone="red">
            <span className="size-1.5 animate-pulse rounded-full bg-current" /> Live
          </Tag>
        ) : status === "upcoming" ? (
          <Tag tone="primary">Upcoming</Tag>
        ) : (
          <Tag>Completed</Tag>
        )}
        <Calendar className="size-4 text-muted-foreground" />
      </div>

      <p className="mt-4 text-xs font-semibold text-muted-foreground">{COURSE_NAMES[course.toLowerCase()] ?? course}</p>
      <h3 className="mt-1 flex-1 text-[15px] font-bold leading-snug">{topic}</h3>

      <p className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />{day}</span>
        <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{time12(time)}</span>
      </p>

      <div className="mt-4">
        {status === "completed" ? (
          youtubeLink ? (
            <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className={cn(btnGhost, "h-9 w-full text-sm")}>
              <Youtube className="size-4" /> Watch recording
            </a>
          ) : (
            <button disabled className={cn(btnGhost, "h-9 w-full text-sm")}>
              <Video className="size-4" /> No recording
            </button>
          )
        ) : (
          <a
            href={meetingLink || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!meetingLink}
            className={cn(status === "live" ? btnPrimary : btnGhost, "h-9 w-full text-sm", !meetingLink && "pointer-events-none opacity-50")}
          >
            <Video className="size-4" /> {status === "live" ? "Join now" : "Join meeting"}
          </a>
        )}
      </div>
    </article>
  )
}
