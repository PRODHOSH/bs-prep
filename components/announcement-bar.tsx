"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"

const DISMISS_KEY = "bsprep_announce_ambassador_unstop_v1"

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="relative z-50 bg-black text-white text-xs sm:text-sm px-4 py-2.5 flex items-center justify-center gap-3">
      <span className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
          Live Now
        </span>
        The BSPrep Student Ambassador Program applications are open!
        <Link 
          href="https://unstop.com/p/student-ambassador-program-bsprep-1720364?lb=usePftiW&utm_medium=Share&utm_source=competitions&utm_campaign=Sozyuihw88836"
          target="_blank"
          className="ml-1 md:ml-3 underline font-bold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
        >
          Apply on Unstop →
        </Link>
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
