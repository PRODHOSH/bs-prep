"use client"

import { usePathname } from "next/navigation"
import { Loading } from "@/components/loading"
import { isAppRoute } from "@/lib/app-routes"

/** Suspense fallback for the root layout: the public site keeps its splash, dashboards show their own skeletons. */
export function RouteFallback() {
  return isAppRoute(usePathname()) ? null : <Loading />
}
