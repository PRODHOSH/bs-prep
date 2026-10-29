import type { Metadata } from "next"
import { ENROLLMENTS_CLOSED, type Course } from "@/lib/course-catalog"

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bsprep.in").replace(/\/$/, "")
export const SITE_NAME = "BSPrep"
export const OG_IMAGE = "/og-image.jpg"
export const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`

type PageSeo = {
  /** Page title without the site suffix. The root layout template adds " | BSPrep". */
  title: string
  description: string
  /** Path of this page, used for the canonical URL and og:url. */
  path: string
  keywords?: string[]
  image?: string
  imageSize?: { width: number; height: number }
  noindex?: boolean
  type?: "website" | "article"
}

/**
 * One place that builds the metadata every public page needs.
 * The canonical is always set from `path`, so a page can never inherit another page's canonical.
 */
export function pageMetadata({ title, description, path, keywords, image = OG_IMAGE, imageSize = { width: 1200, height: 630 }, noindex, type = "website" }: PageSeo): Metadata {
  const ogTitle = `${title} | ${SITE_NAME}`
  return {
    title: title === SITE_NAME ? SITE_NAME : { absolute: ogTitle },
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type,
      url: abs(path),
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      images: [{ url: image, ...imageSize, alt: ogTitle }],
      locale: "en_IN",
    },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [image] },
  }
}

// ── JSON-LD builders ─────────────────────────────────────────────────────────

export const ORGANIZATION_ID = `${SITE_URL}/#organization`

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: abs(item.path),
  })),
})

export const faqLd = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
})

/** A free browser tool such as the compiler or the GPA calculator. */
export const webAppLd = ({ name, description, path, category }: { name: string; description: string; path: string; category: string }) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name,
  description,
  url: abs(path),
  applicationCategory: category,
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript",
  inLanguage: "en-IN",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  publisher: { "@id": ORGANIZATION_ID },
})

export const courseLd = (course: Course) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course.title,
  description: course.description,
  url: abs(`/courses/${course.id}`),
  image: abs(course.thumbnail),
  inLanguage: "ta",
  educationalLevel: course.level,
  provider: { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL },
  isAccessibleForFree: course.type === "free",
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseWorkload: `P${course.weeks}W`,
  },
  ...(course.price
    ? {
        offers: {
          "@type": "Offer",
          category: "Paid",
          price: course.price,
          priceCurrency: "INR",
          url: abs(`/courses/${course.id}`),
          availability: ENROLLMENTS_CLOSED ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        },
      }
    : {}),
})

export const courseListLd = (items: Course[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: items.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: abs(`/courses/${c.id}`),
    name: c.title,
  })),
})
