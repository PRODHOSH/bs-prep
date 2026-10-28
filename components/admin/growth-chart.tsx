"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type GrowthPoint = { day: string; signups: number; enrollments: number }

const SIGNUPS = "var(--chart-1)"
const ENROLLMENTS = "var(--chart-4)"

export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: -20, right: 4, top: 5 }}>
          <defs>
            {[
              ["signups", SIGNUPS],
              ["enrollments", ENROLLMENTS],
            ].map(([id, color]) => (
              <linearGradient key={id} id={`growth-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "var(--muted-foreground)" }}
            itemStyle={{ color: "var(--foreground)" }}
          />
          <Area type="monotone" dataKey="signups" name="Sign-ups" stroke={SIGNUPS} strokeWidth={2} fill="url(#growth-signups)" />
          <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke={ENROLLMENTS} strokeWidth={2} fill="url(#growth-enrollments)" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: SIGNUPS }} />Sign-ups</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: ENROLLMENTS }} />Enrollments</span>
      </div>
    </div>
  )
}
