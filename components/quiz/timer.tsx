"use client"

import { cn } from "@/lib/utils"

const clock = (sec: number) => {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, "0")
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`
}

/** A small caption over large numbers. Turns amber in the last ten minutes and red in the last two. */
export function TimerPill({ remainingSec, elapsedSec, totalSec }: { remainingSec: number | null; elapsedSec: number; totalSec: number | null }) {
  const timed = remainingSec !== null && !!totalSec
  const left = timed ? Math.max(0, remainingSec) : 0
  const state = !timed ? "plain" : left <= 120 ? "critical" : left <= 600 ? "low" : "ok"

  return (
    <div role="timer" aria-label={timed ? "Time remaining" : "Time elapsed"} className="flex flex-col items-center leading-none">
      <span className="text-[11px] font-semibold text-muted-foreground">{timed ? "Time left" : "Time taken"}</span>
      <span
        className={cn(
          "mt-1 font-mono text-[28px] font-extrabold tabular-nums tracking-tight",
          state === "critical" && "animate-pulse text-destructive",
          state === "low" && "text-chart-2",
        )}
      >
        {timed ? clock(left) : clock(elapsedSec)}
      </span>
    </div>
  )
}
