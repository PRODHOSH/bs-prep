import type { MetadataRoute } from "next"
import { courses } from "@/lib/course-catalog"
import { createClient } from "@supabase/supabase-js"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bsprep.in"

// Static public routes with SEO priority/frequency hints
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/courses`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/tools/gpa-calculator`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/tools/gpa-predictor`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/quiz-prep`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/resources`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/tools`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/community`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/doubts`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/careers`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    url: `${BASE_URL}/support`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    url: `${BASE_URL}/privacy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.1,
  },
  {
    url: `${BASE_URL}/terms`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.1,
  },
  {
    url: `${BASE_URL}/disclaimer`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.1,
  },
  {
    url: `${BASE_URL}/cookies`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.1,
  },
]

async function getCourseRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    return courses.filter(c => c.available !== false).map((course) => ({
      url: `${BASE_URL}/courses/${course.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch {
    return []
  }
}

async function getPublicDoubtsRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    // We use a direct client so we don't depend on cookies inside the static sitemap generation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data } = await supabase
      .from('doubts')
      .select('slug, created_at')
      .eq('is_public', true)
      .not('slug', 'is', null)

    if (!data) return []

    return data.map((doubt: any) => ({
      url: `${BASE_URL}/doubts/${doubt.slug}`,
      lastModified: new Date(doubt.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courseRoutes = await getCourseRoutes()
  const doubtRoutes = await getPublicDoubtsRoutes()
  return [...staticRoutes, ...courseRoutes, ...doubtRoutes]
}
