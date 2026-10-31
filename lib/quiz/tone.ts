// Colour language for quiz prep, built on the dashboard chart palette. Class names are written out in full so Tailwind keeps them.

import { BarChart3, Binary, Bot, Braces, BrainCircuit, BookOpen, BookText, Bug, Boxes, Briefcase, Coffee, Database, Globe, LineChart, Network, Sigma, Smartphone, Sparkles, Terminal, TerminalSquare } from "lucide-react"
import type { Tone } from "@/components/dashboard/ui"

export const TINT: Record<Tone, { card: string; text: string; solid: string }> = {
  primary: { card: "bg-card hover:border-foreground/30", text: "text-chart-1", solid: "bg-muted text-foreground" },
  amber: { card: "bg-card hover:border-foreground/30", text: "text-chart-2", solid: "bg-muted text-foreground" },
  pink: { card: "bg-card hover:border-foreground/30", text: "text-chart-3", solid: "bg-muted text-foreground" },
  green: { card: "bg-card hover:border-foreground/30", text: "text-chart-4", solid: "bg-muted text-foreground" },
  cyan: { card: "bg-card hover:border-foreground/30", text: "text-chart-5", solid: "bg-muted text-foreground" },
}

const ORDER: Tone[] = ["primary", "amber", "pink", "green", "cyan"]

/** A stable colour for a course, so it looks the same everywhere. */
export function toneFor(key: string): Tone {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return ORDER[h % ORDER.length]
}

export const KIND_TONE = { practice: "primary", quiz1: "amber", quiz2: "pink", endterm: "green", oppe: "cyan" } as const satisfies Record<string, Tone>

export const initials = (name: string) =>
  name
    .replace(/[()]/g, "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !["to", "and", "of", "in", "for", "the"].includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")

const ICONS: Record<string, React.ElementType> = {
  maths1: Sigma,
  maths2: Sigma,
  stats1: BarChart3,
  stats2: BarChart3,
  ct: BrainCircuit,
  english1: BookText,
  english2: BookText,
  python: Terminal,
  pdsa: Network,
  java: Coffee,
  dbms: Database,
  sql: Database,
  appdev1: Globe,
  appdev2: Smartphone,
  sw_engg: Boxes,
  sw_testing: Bug,
  system_commands: TerminalSquare,
  mlf: Sparkles,
  mlt: Bot,
  mlp: Bot,
  bdm: Briefcase,
  business_analytics: LineChart,
  tds: Braces,
}

/** One recognisable icon per course. */
export const iconFor = (id: string): React.ElementType => ICONS[id] ?? (id.includes("bin") ? Binary : BookOpen)
