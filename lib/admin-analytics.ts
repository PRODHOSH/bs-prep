import { google } from "googleapis"

// ---------- types ----------
export type Row = Record<string, string | number>
export type Section<T> = { data: T | null; error: string | null }
type Compared = { current: Row; previous: Row }

export type Highlight = {
  tone: "good" | "warn" | "info"
  source: "site" | "search"
  title: string
  detail: string
}

export type AnalyticsPayload = {
  range: number
  generatedAt: string
  sitePeriod: { start: string; end: string }
  searchPeriod: { start: string; end: string }
  site: {
    totals: Section<Compared>
    live: Section<{ total: number; topPage: string }>
    daily: Section<Row[]>
    pages: Section<Row[]>
    channels: Section<Row[]>
    countries: Section<Row[]>
    devices: Section<Row[]>
  }
  search: {
    totals: Section<Compared>
    daily: Section<Row[]>
    queries: Section<Row[]>
    pages: Section<Row[]>
    opportunities: Section<Row[]>
  }
  highlights: Highlight[]
}

// ---------- helpers ----------
const iso = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000)
const num = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set")
  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(raw)
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON")
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  })
}

// Each section fails on its own so one broken query never blanks the page.
async function settle<T>(fn: () => Promise<T>): Promise<Section<T>> {
  try {
    return { data: await fn(), error: null }
  } catch (e: unknown) {
    const err = e as { message?: string; errors?: { message?: string }[] }
    return { data: null, error: err?.errors?.[0]?.message || err?.message || "Request failed" }
  }
}

type GaRequest = {
  dimensions?: string[]
  metrics: string[]
  dateRanges?: { startDate: string; endDate: string }[]
  orderBy?: { metric?: string; dimension?: string }
  limit?: number
}

// ---------- main ----------
export async function buildAnalytics(range: number): Promise<AnalyticsPayload> {
  const auth = getAuth()
  const propertyId = process.env.GA4_PROPERTY_ID
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL
  const analytics = google.analyticsdata({ version: "v1beta", auth })
  const searchConsole = google.searchconsole({ version: "v1", auth })

  const today = new Date()
  const siteEnd = iso(today)
  const siteStart = iso(addDays(today, -(range - 1)))
  const sitePrevEnd = iso(addDays(today, -range))
  const sitePrevStart = iso(addDays(today, -(range * 2 - 1)))

  // Search Console data lags about 3 days
  const searchEndDate = addDays(today, -3)
  const searchEnd = iso(searchEndDate)
  const searchStart = iso(addDays(searchEndDate, -(range - 1)))
  const searchPrevEnd = iso(addDays(searchEndDate, -range))
  const searchPrevStart = iso(addDays(searchEndDate, -(range * 2 - 1)))

  async function ga(req: GaRequest): Promise<Row[]> {
    if (!propertyId) throw new Error("GA4_PROPERTY_ID is not set")
    const { orderBy } = req
    const res = await analytics.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: req.dateRanges ?? [{ startDate: siteStart, endDate: siteEnd }],
        dimensions: (req.dimensions ?? []).map((name) => ({ name })),
        metrics: req.metrics.map((name) => ({ name })),
        orderBys: orderBy?.metric
          ? [{ metric: { metricName: orderBy.metric }, desc: true }]
          : orderBy?.dimension
            ? [{ dimension: { dimensionName: orderBy.dimension } }]
            : undefined,
        limit: req.limit ? String(req.limit) : undefined,
        keepEmptyRows: false,
      },
    })
    const dimensionNames = (res.data.dimensionHeaders ?? []).map((h) => h.name!)
    const metricNames = (res.data.metricHeaders ?? []).map((h) => h.name!)
    return (res.data.rows ?? []).map((r) => {
      const row: Row = {}
      dimensionNames.forEach((n, i) => (row[n] = r.dimensionValues?.[i]?.value ?? ""))
      metricNames.forEach((n, i) => (row[n] = num(r.metricValues?.[i]?.value)))
      return row
    })
  }

  async function search(start: string, end: string, dimensions: string[] = [], rowLimit = 25): Promise<Row[]> {
    if (!siteUrl) throw new Error("SEARCH_CONSOLE_SITE_URL is not set")
    const res = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: { startDate: start, endDate: end, dimensions, rowLimit, dataState: "final" },
    })
    return (res.data.rows ?? []).map((r) => {
      const row: Row = {
        clicks: num(r.clicks),
        impressions: num(r.impressions),
        ctr: num(r.ctr),
        position: num(r.position),
      }
      dimensions.forEach((d, i) => (row[d] = r.keys?.[i] ?? ""))
      return row
    })
  }

  const topBy = (dimension: string, metrics: string[], limit: number): GaRequest => ({
    dimensions: [dimension],
    metrics,
    orderBy: { metric: metrics[0] },
    limit,
  })

  const [totals, live, daily, pages, channels, countries, devices] = await Promise.all([
    settle(async () => {
      const rows = await ga({
        dateRanges: [
          { startDate: siteStart, endDate: siteEnd },
          { startDate: sitePrevStart, endDate: sitePrevEnd },
        ],
        metrics: ["activeUsers", "newUsers", "screenPageViews", "averageSessionDuration"],
      })
      // with two date ranges GA adds a dateRange dimension
      return {
        current: rows.find((r) => r.dateRange === "date_range_0") ?? rows[0] ?? {},
        previous: rows.find((r) => r.dateRange === "date_range_1") ?? {},
      }
    }),
    settle(async () => {
      if (!propertyId) throw new Error("GA4_PROPERTY_ID is not set")
      const res = await analytics.properties.runRealtimeReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dimensions: [{ name: "unifiedScreenName" }],
          metrics: [{ name: "activeUsers" }],
          limit: "5",
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        },
      })
      const rows = res.data.rows ?? []
      return {
        total: rows.reduce((sum, r) => sum + num(r.metricValues?.[0]?.value), 0),
        topPage: rows[0]?.dimensionValues?.[0]?.value ?? "",
      }
    }),
    settle(() => ga({ dimensions: ["date"], metrics: ["activeUsers"], orderBy: { dimension: "date" } })),
    settle(() => ga(topBy("pagePath", ["screenPageViews"], 8))),
    settle(() => ga(topBy("sessionDefaultChannelGroup", ["sessions"], 6))),
    settle(() => ga(topBy("country", ["activeUsers"], 6))),
    settle(() => ga(topBy("deviceCategory", ["sessions"], 4))),
  ])

  const [searchCurrent, searchPrevious, searchDaily, queries, searchPages] = await Promise.all([
    settle(() => search(searchStart, searchEnd)),
    settle(() => search(searchPrevStart, searchPrevEnd)),
    settle(() => search(searchStart, searchEnd, ["date"], 500)),
    settle(() => search(searchStart, searchEnd, ["query"], 200)),
    settle(() => search(searchStart, searchEnd, ["page"], 25)),
  ])

  const searchTotals: Section<Compared> = searchCurrent.data
    ? {
        data: { current: searchCurrent.data[0] ?? {}, previous: searchPrevious.data?.[0] ?? {} },
        error: null,
      }
    : { data: null, error: searchCurrent.error }

  // Queries that already show up near the top of page 2 / bottom of page 1 and get seen a lot
  const opportunities: Section<Row[]> = queries.data
    ? {
        data: queries.data
          .filter((r) => num(r.position) > 3.5 && num(r.position) <= 20 && num(r.impressions) >= 20)
          .sort((a, b) => num(b.impressions) - num(a.impressions))
          .slice(0, 6),
        error: null,
      }
    : { data: null, error: queries.error }

  const payload: AnalyticsPayload = {
    range,
    generatedAt: new Date().toISOString(),
    sitePeriod: { start: siteStart, end: siteEnd },
    searchPeriod: { start: searchStart, end: searchEnd },
    site: { totals, live, daily, pages, channels, countries, devices },
    search: {
      totals: searchTotals,
      daily: searchDaily,
      queries: queries.data ? { data: queries.data.slice(0, 8), error: null } : queries,
      pages: searchPages,
      opportunities,
    },
    highlights: [],
  }
  payload.highlights = buildHighlights(payload)
  return payload
}

// ---------- highlights (plain-language summary) ----------
const changePct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null)
const signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(0)}%`

function buildHighlights(p: AnalyticsPayload): Highlight[] {
  const out: Highlight[] = []
  const days = `${p.range} days`

  const site = p.site.totals.data
  if (site) {
    const cur = num(site.current.activeUsers)
    const prev = num(site.previous.activeUsers)
    const change = changePct(cur, prev)
    if (change !== null)
      out.push({
        tone: change >= 0 ? "good" : "warn",
        source: "site",
        title: `Visitors ${change >= 0 ? "grew" : "dropped"} ${signed(change)}`,
        detail: `${cur.toLocaleString()} people visited in the last ${days}, compared with ${prev.toLocaleString()} in the ${days} before.`,
      })
  }

  const channels = p.site.channels.data
  if (channels?.length) {
    const total = channels.reduce((s, r) => s + num(r.sessions), 0)
    const share = total ? (num(channels[0].sessions) / total) * 100 : 0
    out.push({
      tone: "info",
      source: "site",
      title: `Most visitors arrive from ${channels[0].sessionDefaultChannelGroup}`,
      detail: `${share.toFixed(0)}% of all visits start there.`,
    })
  }

  const devices = p.site.devices.data
  const mobile = devices?.find((d) => d.deviceCategory === "mobile")
  if (devices && mobile) {
    const total = devices.reduce((s, r) => s + num(r.sessions), 0)
    out.push({
      tone: "info",
      source: "site",
      title: `${total ? ((num(mobile.sessions) / total) * 100).toFixed(0) : 0}% of visits are on a phone`,
      detail: "Make sure every page looks good on a small screen.",
    })
  }

  const search = p.search.totals.data
  if (search) {
    const cur = num(search.current.clicks)
    const prev = num(search.previous.clicks)
    const change = changePct(cur, prev)
    if (change !== null)
      out.push({
        tone: change >= 0 ? "good" : "warn",
        source: "search",
        title: `Google sent ${change >= 0 ? "more" : "fewer"} visitors (${signed(change)})`,
        detail: `${cur.toLocaleString()} clicks from Google search, compared with ${prev.toLocaleString()} in the ${days} before.`,
      })
  }

  const opportunities = p.search.opportunities.data
  if (opportunities?.length)
    out.push({
      tone: "info",
      source: "search",
      title: `${opportunities.length} searches are close to the first page`,
      detail: `For example "${opportunities[0].query}". Improving those pages is the quickest way to get more visitors.`,
    })

  return out
}
