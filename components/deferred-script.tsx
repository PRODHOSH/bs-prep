"use client"

import { useEffect } from "react"

/**
 * Loads a third-party script once the visitor first interacts with the page, or after `fallbackMs`.
 * For heavy widgets such as chat: they still load, just not while the page is busy painting.
 */
export function DeferredScript({ src, fallbackMs = 10000 }: { src: string; fallbackMs?: number }) {
  useEffect(() => {
    let loaded = false
    const events = ["pointerdown", "pointermove", "keydown", "touchstart", "scroll"] as const

    const load = () => {
      if (loaded) return
      loaded = true
      cleanup()
      if (document.querySelector(`script[src="${src}"]`)) return
      const el = document.createElement("script")
      el.src = src
      el.async = true
      document.body.appendChild(el)
    }

    const timer = window.setTimeout(load, fallbackMs)
    function cleanup() {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, load))
    }
    events.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }))
    return cleanup
  }, [src, fallbackMs])

  return null
}
