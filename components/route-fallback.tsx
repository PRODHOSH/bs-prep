"use client"

import { usePathname } from "next/navigation"
import { Loading } from "@/components/loading"
import { isChromeFree } from "@/lib/app-routes"

/** Suspense fallback for the root layout: the public site keeps its splash, dashboards show their own skeletons. */
export function RouteFallback() {
  return isChromeFree(usePathname()) ? null : <Loading />
}
