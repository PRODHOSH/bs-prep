"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cookie, X } from "lucide-react"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if user hasn't already made a choice
    const consent = localStorage.getItem("bsprep_cookie_consent")
    if (!consent) {
      // Small delay so it doesn't flash on initial render
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem("bsprep_cookie_consent", "accepted")
    setVisible(false)
  }

  const dismiss = () => {
    localStorage.setItem("bsprep_cookie_consent", "dismissed")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9999] transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4 text-white" />
            </div>
            <p className="font-bold text-sm text-black">We use cookies</p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss cookie banner"
            className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5 text-black/60" />
          </button>
        </div>

        {/* Body */}
        <p className="text-xs text-black/60 leading-relaxed">
          BSPrep uses essential cookies to keep you logged in and analytics cookies (Google Analytics) to improve the
          platform. We never use advertising cookies.{" "}
          <Link href="/cookies" className="underline text-black/80 hover:text-black transition-colors">
            Cookie Policy
          </Link>
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={accept}
            id="cookie-accept-btn"
            className="flex-1 h-9 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={dismiss}
            id="cookie-dismiss-btn"
            className="flex-1 h-9 bg-black/5 text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black/10 transition-colors"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  )
}
