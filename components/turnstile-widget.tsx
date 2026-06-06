"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: {
        sitekey: string
        callback: (token: string) => void
        "expired-callback": () => void
        "error-callback": () => void
        theme?: "light" | "dark" | "auto"
        size?: "normal" | "compact"
      }) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""

interface TurnstileWidgetProps {
  open: boolean
  onSuccess: (token: string) => void
  onExpire: () => void
  onError: () => void
}

export function TurnstileWidget({ open, onSuccess, onExpire, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onSuccessRef = useRef(onSuccess)
  const onExpireRef = useRef(onExpire)
  const onErrorRef = useRef(onError)

  // Keep refs current so the render callback always calls latest handlers
  onSuccessRef.current = onSuccess
  onExpireRef.current = onExpire
  onErrorRef.current = onError

  useEffect(() => {
    if (!open) return

    const doRender = () => {
      if (!containerRef.current || typeof window.turnstile === "undefined") return false

      // Clean up any previous widget in this container
      if (widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
        widgetIdRef.current = null
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onSuccessRef.current(token),
        "expired-callback": () => onExpireRef.current(),
        "error-callback": () => onErrorRef.current(),
        theme: "light",
        size: "normal",
      })
      return true
    }

    // Turnstile script is loaded via layout.tsx afterInteractive.
    // On first dialog open it may not be ready yet — retry after 600ms.
    if (!doRender()) {
      const t = setTimeout(doRender, 600)
      return () => clearTimeout(t)
    }

    return () => {
      if (widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
        widgetIdRef.current = null
      }
    }
  }, [open])

  return <div ref={containerRef} />
}
