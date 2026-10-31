import type { MetadataRoute } from "next"
import { courses } from "@/lib/course-catalog"
import { createClient } from "@supabase/supabase-js"

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bsprep.in").replace(/\/$/, "")

// Real dates, not "now". Google ignores lastmod when every URL claims to change on every request.
// Bump these when the content of a page actually changes.
const SITE_UPDATED = new Date("2026-10-31")
const LEGAL_UPDATED = new Date("2026-10-28")

type Entry = MetadataRoute.Sitemap[number]
const entry = (path: string, priority: number, changeFrequency: Entry["changeFrequency"], lastModified = SITE_UPDATED): Entry => ({
  url: `${BASE_URL}${path}`,
  lastModified,
  changeFrequency,
  priority,
})

// Public, indexable pages only. Redirects (such as /support) and private areas do not belong here.
const staticRoutes: MetadataRoute.Sitemap = [
  entry("", 1, "weekly"),
  entry("/courses", 0.9, "weekly"),
  entry("/tools/gpa-calculator", 0.9, "monthly"),
  entry("/tools/gpa-predictor", 0.9, "monthly"),
  entry("/compiler", 0.8, "monthly"),
  entry("/resources", 0.8, "daily"),
  entry("/quiz-prep", 0.7, "weekly"),
  entry("/doubts", 0.8, "daily"),
  entry("/community", 0.6, "monthly"),
  entry("/careers", 0.5, "weekly"),
  entry("/privacy", 0.2, "yearly", LEGAL_UPDATED),
  entry("/terms", 0.2, "yearly", LEGAL_UPDATED),
  entry("/refund-policy", 0.2, "yearly", LEGAL_UPDATED),
  entry("/cookies", 0.2, "yearly", LEGAL_UPDATED),
  entry("/disclaimer", 0.2, "yearly", LEGAL_UPDATED),
]

const courseRoutes: MetadataRoute.Sitemap = courses
  .filter((c) => c.available !== false)
  .map((c) => entry(`/courses/${c.id}`, 0.8, "monthly"))

async function getPublicDoubtsRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    // A direct client keeps sitemap generation independent of request cookies.
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data } = await supabase.from("doubts").select("slug, created_at").eq("is_public", true).not("slug", "is", null)
    if (!data) return []
    return data.map((doubt: { slug: string; created_at: string }) =>
      entry(`/doubts/${encodeURIComponent(doubt.slug)}`, 0.6, "monthly", new Date(doubt.created_at)),
    )
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [...staticRoutes, ...courseRoutes, ...(await getPublicDoubtsRoutes())]
}
