"use client"

import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export function Loading() {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")
  const isMentorRoute = pathname?.startsWith("/mentor")
  const isDarkRoute = isAdminRoute || isMentorRoute

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkRoute ? "bg-[#0a192f]" : "bg-white"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className={`w-8 h-8 animate-spin ${isDarkRoute ? "text-white" : "text-black"}`} />
        <h3 className={`text-sm font-black uppercase tracking-widest ${isDarkRoute ? "text-white/60" : "text-black/60"}`}>
          LOADING...
        </h3>
      </div>
    </div>
  )
}
