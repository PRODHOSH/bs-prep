import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bsprep.in"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/mentor/",
          "/dashboard/",
          "/api/",
          "/auth/",
          "/signin",
          "/signup",
          "/payment/",
          "/certificate/",
          "/unsubscribe",
          // Week pages belong to enrolled students; the course landing page itself stays crawlable.
          "/courses/*/*",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
