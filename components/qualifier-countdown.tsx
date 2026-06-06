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

  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white">

          {/* Top rule with label */}
          <div className="flex items-center justify-between border-b border-gray-100 px-8 md:px-12 py-3.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                Live Countdown
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/30">
              July 19, 2026
            </span>
          </div>

          {/* Main content */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-0 px-8 md:px-12 py-8 md:py-10">

            {/* LEFT — headline */}
            <div className="md:flex-1">

              {/* QUALIFIER — solid black */}
              <div
                className="font-black text-black leading-none tracking-tight"
                style={{ fontSize: "clamp(40px, 7vw, 84px)" }}
              >
                QUALIFIER
              </div>

              {/* EXAM — outline */}
              <div
                className="font-black leading-none tracking-tight"
                style={{
                  fontSize: "clamp(40px, 7vw, 84px)",
                  WebkitTextStroke: "2px rgba(0,0,0,0.2)",
                  color: "transparent",
                }}
              >
                EXAM
              </div>

              <p className="mt-4 text-sm text-black/40 font-medium">
                {time.days} days left to crack the qualifier
              </p>
            </div>

            {/* DIVIDER */}
            <div className="hidden md:block h-20 w-px bg-gray-200 mx-8 shrink-0" />

            {/* RIGHT — days hero + hms */}
            <div className="md:flex-1">

              {/* Days — big */}
              <div className="flex items-end gap-3 mb-5">
                <span
                  className="font-black text-black tabular-nums leading-none"
                  style={{ fontSize: "clamp(64px, 11vw, 128px)" }}
                >
                  {String(time.days).padStart(2, "0")}
                </span>
                <span
                  className="font-black leading-none mb-2"
                  style={{
                    fontSize: "clamp(20px, 3vw, 32px)",
                    WebkitTextStroke: "1.5px rgba(0,0,0,0.2)",
                    color: "transparent",
                  }}
                >
                  DAYS
                </span>
              </div>

              {/* H : M : S */}
              <div className="flex items-end gap-4 pt-4 border-t border-gray-100">
                {[
                  { value: time.hours,   label: "hrs" },
                  { value: time.minutes, label: "min" },
                  { value: time.seconds, label: "sec" },
                ].map(({ value, label }, i) => (
                  <div key={label} className="flex items-end gap-4">
                    {i > 0 && <span className="text-xl font-light text-black/15 mb-1">:</span>}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-black text-black/50 tabular-nums leading-none">
                        {String(value).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/25 mb-0.5">
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="md:ml-8 shrink-0">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-black text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-black/80 transition-colors"
              >
                Enroll Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
