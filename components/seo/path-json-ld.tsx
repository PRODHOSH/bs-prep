"use client"

import { usePathname } from "next/navigation"

/**
 * Structured data for a single URL. A layout wraps every page beneath it, so data that only
 * describes one page (a course list, a breadcrumb) must not leak onto its children.
 * Client components still render on the server, so this stays in the initial HTML.
 */
export function PathJsonLd({ path, data }: { path: string; data: object | object[] }) {
  const pathname = usePathname()
  if (pathname !== path) return null
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((item, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }} />
      ))}
    </>
  )
}
