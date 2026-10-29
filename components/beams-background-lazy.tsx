"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { isChromeFree } from "@/lib/app-routes"

// The animated dot grid pulls in GSAP, so it only loads for a mouse user who is actually moving around.
const BeamsBackground = dynamic(() => import("@/components/beams-background").then((m) => m.BeamsBackground), { ssr: false })

export function BeamsBackgroundLazy() {
  const pathname = usePathname()
  const [interactive, setInteractive] = useState(false)

  useEffect(() => {
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!mouse || calm) return
    const start = () => setInteractive(true)
    window.addEventListener("pointermove", start, { once: true, passive: true })
    return () => window.removeEventListener("pointermove", start)
  }, [])

  // The animated backdrop is public-site only; skipping it keeps the dashboards light.
  if (isChromeFree(pathname)) return null

  return (
    <>
      {/* The same dot pattern in plain CSS, so the page looks finished before any script runs. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-white"
        style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1.5px, transparent 1.6px)", backgroundSize: "16px 16px" }}
      />
      {interactive && <BeamsBackground />}
    </>
  )
}
