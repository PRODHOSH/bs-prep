"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { RefreshCw } from "lucide-react"

export function AdminRefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
      suppressHydrationWarning
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Refreshing..." : "Refresh"}
    </button>
  )
}
