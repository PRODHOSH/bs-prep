import type { MetadataRoute } from "next"
import { courses } from "@/lib/course-catalog"

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courseRoutes = await getCourseRoutes()
  return [...staticRoutes, ...courseRoutes]
}
