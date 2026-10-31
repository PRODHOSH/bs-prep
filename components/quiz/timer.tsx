"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const clock = (sec: number) => {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, "0")
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`
}

/** Countdown with a thin progress bar. Turns amber in the last ten minutes and red in the last two. */
export function TimerPill({ remainingSec, elapsedSec, totalSec }: { remainingSec: number | null; elapsedSec: number; totalSec: number | null }) {
  const timed = remainingSec !== null && totalSec
  const left = timed ? Math.max(0, remainingSec) : 0
  const pct = timed ? Math.min(100, (left / totalSec) * 100) : 0
  const state = !timed ? "plain" : left <= 120 ? "critical" : left <= 600 ? "low" : "ok"

  return (
    <div
      role="timer"
      aria-label={timed ? "Time remaining" : "Time elapsed"}
      className={cn(
        "relative flex min-w-[8.5rem] items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-2 font-mono text-lg font-extrabold tabular-nums",
        state === "critical" && "animate-pulse border-destructive/50 bg-destructive/10 text-destructive",
        state === "low" && "border-chart-2/50 bg-chart-2/15 text-chart-2",
        (state === "ok" || state === "plain") && "bg-card",
      )}
    >
      <Clock className="size-4 shrink-0 opacity-70" />
      {timed ? clock(left) : clock(elapsedSec)}
      {timed && (
        <span className="absolute inset-x-0 bottom-0 h-1 bg-muted">
          <span
            className={cn("block h-full transition-[width] duration-1000 ease-linear", state === "critical" ? "bg-destructive" : state === "low" ? "bg-chart-2" : "bg-primary")}
            style={{ width: `${pct}%` }}
          />
        </span>
      )}
    </div>
  )
}
