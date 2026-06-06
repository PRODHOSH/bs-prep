"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const QUALIFIER_DATE = new Date("2026-07-19T00:00:00+05:30")

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; expired: boolean }

function calcTimeLeft(): TimeLeft {
  const diff = QUALIFIER_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  }
}

export function QualifierCountdown() {
  const [time, setTime] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTime(calcTimeLeft())
    const id = setInterval(() => setTime(calcTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time || time.expired) return null

  const units = [
    { value: time.days,    label: "DAYS" },
    { value: time.hours,   label: "HRS" },
    { value: time.minutes, label: "MIN" },
    { value: time.seconds, label: "SEC" },
  ]

  return (
    <section className="py-4 md:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111111] text-white rounded-2xl px-6 md:px-10 py-6 flex flex-col sm:flex-row sm:items-center gap-6">

          {/* Left — label + date */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                Live Countdown
              </span>
            </div>
            <p className="text-lg font-semibold tracking-[-0.3px]">Qualifier Exam</p>
            <p className="text-sm text-white/45 mt-0.5">July 19, 2026 &mdash; {time.days} days remaining</p>
          </div>

          {/* Center — time blocks */}
          <div className="flex items-center gap-2 sm:gap-3">
            {units.map(({ value, label }, i) => (
              <div key={label} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && <span className="text-white/20 text-lg font-light select-none">:</span>}
                <div className="flex flex-col items-center bg-white/10 rounded-xl px-3.5 sm:px-5 py-3 min-w-14 sm:min-w-17">
                  <span className="text-xl sm:text-2xl font-semibold tabular-nums leading-none">
                    {String(value).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-white/35 tracking-widest mt-1.5 font-medium">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right — CTA */}
          <Link
            href="/courses"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-[#111111] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#f5f5f5] transition-colors"
          >
            Enroll Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

        </div>
      </div>
    </section>
  )
}
