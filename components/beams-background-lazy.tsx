"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { isAppRoute } from "@/lib/app-routes"

const BeamsBackground = dynamic(
  () => import("@/components/beams-background").then((m) => m.BeamsBackground),
  { ssr: false, loading: () => <div className="fixed inset-0 bg-white -z-10" /> }
)

export function BeamsBackgroundLazy() {
  // The animated backdrop is public-site only; skipping it keeps the dashboards light.
  if (isAppRoute(usePathname())) return null
  return <BeamsBackground />
}
