"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type GrowthPoint = { day: string; signups: number; enrollments: number }

const SIGNUPS = "#60a5fa"
const ENROLLMENTS = "#34d399"

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
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "#94a3b8" }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Area type="monotone" dataKey="signups" name="Sign-ups" stroke={SIGNUPS} strokeWidth={2} fill="url(#growth-signups)" />
          <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke={ENROLLMENTS} strokeWidth={2} fill="url(#growth-enrollments)" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: SIGNUPS }} />Sign-ups</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: ENROLLMENTS }} />Enrollments</span>
      </div>
    </div>
  )
}
