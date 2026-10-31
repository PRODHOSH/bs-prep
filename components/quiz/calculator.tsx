"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { GripHorizontal, X } from "lucide-react"

/**
 * The exam calculator (public/calculator) in a window that can be dragged around the test.
 * It runs in its own frame, so its scripts and styles cannot touch the rest of the page.
 */
export function Calculator({ onClose }: { onClose: () => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [size, setSize] = useState({ w: 465, h: 330 })
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPos({ x: Math.max(12, window.innerWidth - 465 - 24), y: 72 })
  }, [])

  const onMove = useCallback((e: PointerEvent) => {
    if (!drag.current) return
    const w = box.current?.offsetWidth ?? 465
    const h = box.current?.offsetHeight ?? 360
    setPos({
      x: Math.min(Math.max(0, e.clientX - drag.current.dx), Math.max(0, window.innerWidth - w)),
      y: Math.min(Math.max(0, e.clientY - drag.current.dy), Math.max(0, window.innerHeight - h)),
    })
  }, [])
  const stop = useCallback(() => {
    drag.current = null
    window.removeEventListener("pointermove", onMove)
    window.removeEventListener("pointerup", stop)
  }, [onMove])
  useEffect(() => stop, [stop])

  function start(e: React.PointerEvent) {
    if (!pos) return
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", stop)
  }

  // Fit the window to the calculator once it has loaded.
  function fit(frame: HTMLIFrameElement) {
    try {
      const pad = frame.contentDocument?.querySelector<HTMLElement>(".calc_container")
      if (pad) setSize({ w: pad.offsetWidth + 16, h: pad.offsetHeight + 16 })
    } catch {}
  }

  if (!pos) return null
  return (
    <div
      ref={box}
      style={{ left: pos.x, top: pos.y, width: size.w }}
      className="lms fixed z-[65] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border bg-card shadow-2xl"
      role="dialog"
      aria-label="Scientific calculator"
    >
      <div onPointerDown={start} className="flex cursor-grab touch-none items-center justify-between border-b bg-muted/60 px-3 py-1.5 active:cursor-grabbing">
        <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <GripHorizontal className="size-4" /> Calculator
        </span>
        <button onClick={onClose} onPointerDown={(e) => e.stopPropagation()} aria-label="Close calculator" className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
      <iframe src="/calculator/index.html" title="Scientific calculator" onLoad={(e) => fit(e.currentTarget)} style={{ width: size.w, height: size.h }} className="block border-0 bg-white" />
    </div>
  )
}
