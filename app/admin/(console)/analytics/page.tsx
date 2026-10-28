"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { SkChart, SkStats } from "@/components/dashboard/skeleton"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, Lightbulb, Loader2, RefreshCw } from "lucide-react"
import { Segmented, Tabs } from "@/components/dashboard/controls"
import { PageHeader, btnGhost } from "@/components/dashboard/ui"
import type { AnalyticsPayload, Highlight, Row, Section } from "@/lib/admin-analytics"

// ---------- formatting ----------
const num = (v: unknown) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}
const count = (v: unknown) => {
  const x = num(v)
  return x >= 10_000 ? `${(x / 1000).toFixed(1)}k` : x.toLocaleString()
}
const percent = (v: unknown) => `${(num(v) * 100).toFixed(1)}%`
const duration = (v: unknown) => {
  const s = Math.round(num(v))
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
}
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
// GA4 returns dates as YYYYMMDD
const gaDate = (s: string) => shortDate(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`)
const pathOf = (url: string) => {
  try {
    const p = new URL(url).pathname
    return p === "/" ? "Home page" : p
  } catch {
    return url
  }
}

const RANGES = [7, 28, 90] as const
const ACCENT = "var(--chart-1)"

// ---------- building blocks ----------
function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

// Shows the error or an empty message instead of the content when a section has nothing to show.
function Loaded<T>({ section, children }: { section: Section<T>; children: (data: T) => ReactNode }) {
  if (section.error)
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="break-words">{section.error}</span>
      </div>
    )
  const empty = !section.data || (Array.isArray(section.data) && section.data.length === 0)
  if (empty) return <p className="py-6 text-center text-xs text-muted-foreground">Nothing to show for this period yet.</p>
  return <>{children(section.data as T)}</>
}

function Change({ current, previous, lowerIsBetter = false }: { current: number; previous: number; lowerIsBetter?: boolean }) {
  if (!previous) return <span className="text-xs text-muted-foreground">No earlier data</span>
  const diff = ((current - previous) / previous) * 100
  const good = lowerIsBetter ? diff <= 0 : diff >= 0
  const Icon = diff >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${good ? "text-emerald-700" : "text-rose-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(diff).toFixed(0)}% vs earlier
    </span>
  )
}

type StatSpec = { label: string; hint: string; key: string; format: (v: unknown) => string; lowerIsBetter?: boolean }

function Stats({ section, stats }: { section: Section<{ current: Row; previous: Row }>; stats: StatSpec[] }) {
  return (
    <Loaded section={section}>
      {({ current, previous }) => (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.key} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{s.format(current[s.key])}</p>
              <div className="mt-1">
                <Change current={num(current[s.key])} previous={num(previous[s.key])} lowerIsBetter={s.lowerIsBetter} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{s.hint}</p>
            </div>
          ))}
        </div>
      )}
    </Loaded>
  )
}

function Trend({ rows, dataKey, label, formatDate }: {
  rows: Row[]; dataKey: string; label: string; formatDate: (raw: string) => string
}) {
  const data = rows.map((r) => ({ day: formatDate(String(r.date)), value: num(r[dataKey]) }))
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: -16, right: 4, top: 5 }}>
          <defs>
            <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={32} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "var(--muted-foreground)" }}
            itemStyle={{ color: "var(--foreground)" }}
          />
          <Area type="monotone" dataKey="value" name={label} stroke={ACCENT} strokeWidth={2} fill={`url(#fill-${dataKey})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// A ranked list where each row has a bar sized relative to the biggest value.
function RankedList({ rows, nameKey, valueKey, name, format = count }: {
  rows: Row[]; nameKey: string; valueKey: string; name?: (raw: string) => string; format?: (v: unknown) => string
}) {
  const max = Math.max(1, ...rows.map((r) => num(r[valueKey])))
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => {
        const raw = String(r[nameKey]) || "(not set)"
        return (
          <li key={i}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-foreground" title={raw}>{name ? name(raw) : raw}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{format(r[valueKey])}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${(num(r[valueKey]) / max) * 100}%`, background: ACCENT }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

const TONES = {
  good: { Icon: CheckCircle2, color: "text-emerald-700" },
  warn: { Icon: AlertTriangle, color: "text-amber-700" },
  info: { Icon: Lightbulb, color: "text-sky-600" },
}

function Highlights({ items }: { items: Highlight[] }) {
  if (!items.length) return null
  return (
    <Panel title="What stands out">
      <ul className="space-y-3">
        {items.map((h, i) => {
          const { Icon, color } = TONES[h.tone]
          return (
            <li key={i} className="flex gap-3">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{h.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{h.detail}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

// ---------- tabs ----------
function WebsiteTab({ data }: { data: AnalyticsPayload }) {
  const { site } = data
  const live = site.live.data
  return (
    <div className="space-y-4">
      {live && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <p className="text-sm text-foreground">
            <span className="font-semibold text-emerald-700">{live.total}</span> {live.total === 1 ? "person is" : "people are"} on the site right now
            {live.topPage && <span className="text-muted-foreground"> · most on {live.topPage}</span>}
          </p>
        </div>
      )}

      <Stats
        section={site.totals}
        stats={[
          { label: "Visitors", hint: "People who visited the site", key: "activeUsers", format: count },
          { label: "New visitors", hint: "Visiting for the first time", key: "newUsers", format: count },
          { label: "Page views", hint: "Total pages opened", key: "screenPageViews", format: count },
          { label: "Time on site", hint: "Average length of a visit", key: "averageSessionDuration", format: duration },
        ]}
      />

      <Highlights items={data.highlights.filter((h) => h.source === "site")} />

      <Panel title="Visitors per day">
        <Loaded section={site.daily}>
          {(rows) => <Trend rows={rows} dataKey="activeUsers" label="Visitors" formatDate={gaDate} />}
        </Loaded>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Most visited pages" hint="Page views">
          <Loaded section={site.pages}>{(rows) => <RankedList rows={rows} nameKey="pagePath" valueKey="screenPageViews" />}</Loaded>
        </Panel>
        <Panel title="Where visitors come from" hint="Visits by source">
          <Loaded section={site.channels}>{(rows) => <RankedList rows={rows} nameKey="sessionDefaultChannelGroup" valueKey="sessions" />}</Loaded>
        </Panel>
        <Panel title="Countries" hint="Visitors">
          <Loaded section={site.countries}>{(rows) => <RankedList rows={rows} nameKey="country" valueKey="activeUsers" />}</Loaded>
        </Panel>
        <Panel title="Devices" hint="Visits">
          <Loaded section={site.devices}>{(rows) => <RankedList rows={rows} nameKey="deviceCategory" valueKey="sessions" />}</Loaded>
        </Panel>
      </div>
    </div>
  )
}

function SearchTab({ data }: { data: AnalyticsPayload }) {
  const { search } = data
  return (
    <div className="space-y-4">
      <Stats
        section={search.totals}
        stats={[
          { label: "Clicks", hint: "Times someone clicked through from Google", key: "clicks", format: count },
          { label: "Impressions", hint: "Times the site was shown in results", key: "impressions", format: count },
          { label: "Click rate", hint: "Out of every 100 views, how many clicked", key: "ctr", format: percent },
          { label: "Average position", hint: "Where the site ranks (1 is the top)", key: "position", format: (v) => num(v).toFixed(1), lowerIsBetter: true },
        ]}
      />

      <Highlights items={data.highlights.filter((h) => h.source === "search")} />

      <Panel title="Clicks from Google per day">
        <Loaded section={search.daily}>
          {(rows) => <Trend rows={rows} dataKey="clicks" label="Clicks" formatDate={shortDate} />}
        </Loaded>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="What people searched for" hint="Clicks">
          <Loaded section={search.queries}>{(rows) => <RankedList rows={rows} nameKey="query" valueKey="clicks" />}</Loaded>
        </Panel>
        <Panel title="Pages people found" hint="Clicks">
          <Loaded section={search.pages}>
            {(rows) => <RankedList rows={rows.slice(0, 8)} nameKey="page" valueKey="clicks" name={pathOf} />}
          </Loaded>
        </Panel>
      </div>

      <Panel title="Easy wins" hint="Searches where the site almost reaches page 1 — improving these pages can bring more visitors">
        <Loaded section={search.opportunities}>
          {(rows) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Search</th>
                    <th className="pb-2 pl-3 text-right font-medium">Times shown</th>
                    <th className="pb-2 pl-3 text-right font-medium">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-2 pr-3 text-foreground">{String(r.query)}</td>
                      <td className="py-2 pl-3 text-right tabular-nums text-muted-foreground">{count(r.impressions)}</td>
                      <td className="py-2 pl-3 text-right tabular-nums text-muted-foreground">{num(r.position).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Loaded>
      </Panel>
    </div>
  )
}

// ---------- page ----------
const TABS = [
  { id: "site", label: "Website visitors" },
  { id: "search", label: "Google Search" },
] as const

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<number>(28)
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("site")
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (days: number, fresh = false) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/analytics?range=${days}${fresh ? "&fresh=1" : ""}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load analytics")
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(range) }, [range, load])

  const period = useMemo(() => {
    if (!data) return ""
    const p = tab === "site" ? data.sitePeriod : data.searchPeriod
    return `${shortDate(p.start)} – ${shortDate(p.end)}`
  }, [data, tab])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={<>How people find and use BSPrep.{period && <span> Showing {period}.</span>}</>}
        actions={
          <>
            <Segmented
              options={RANGES.map((r) => ({ id: String(r), label: `Last ${r} days` }))}
              value={String(range)}
              onChange={(v) => setRange(Number(v))}
            />
            <button onClick={() => load(range, true)} disabled={loading} aria-label="Refresh data" className={btnGhost}>
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </>
        }
      />

      <Tabs tabs={TABS.map((t) => ({ id: t.id, label: t.label }))} value={tab} onChange={setTab} />

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-600">{error}</div>}

      {!data && loading && (
        <div className="space-y-4">
          <SkStats count={4} cols="sm:grid-cols-2 xl:grid-cols-4" />
          <SkChart />
        </div>
      )}

      {data && (
        <div className={loading ? "opacity-60 transition" : "transition"}>
          {tab === "site" ? <WebsiteTab data={data} /> : <SearchTab data={data} />}
          <p className="mt-6 text-xs text-muted-foreground">
            Data comes from Google and is saved for 5 minutes. Last updated {new Date(data.generatedAt).toLocaleTimeString()}.
            {tab === "search" && " Google Search figures run about 3 days behind."}
          </p>
        </div>
      )}
    </div>
  )
}
