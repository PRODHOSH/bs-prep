"use client"

import dynamic from "next/dynamic"

const BeamsBackground = dynamic(
  () => import("@/components/beams-background").then((m) => m.BeamsBackground),
  { ssr: false, loading: () => <div className="fixed inset-0 bg-white -z-10" /> }
)

export function BeamsBackgroundLazy() {
  return <BeamsBackground />
}
