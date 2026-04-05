"use client"

import Link from "next/link"
import { Bell, Loader2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

type NotificationItem = {
  id: string
  type: "resource" | "doubt"
  title: string
  description: string
  href: string
  created_at: string
}

type NotificationPayload = {
  total: number
  counts: {
    pendingResources: number
    openDoubts: number
  }
  items: NotificationItem[]
}

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(false)
  const [payload, setPayload] = useState<NotificationPayload>({
    total: 0,
    counts: { pendingResources: 0, openDoubts: 0 },
    items: [],
  })

  const hasItems = payload.total > 0

  async function loadNotifications() {
    if (loadingRef.current) {
      return
    }

    loadingRef.current = true
    setLoading(true)
    try {
      const response = await fetch("/api/admin/notifications", { cache: "no-store" })
      if (response.status === 429) {
        return
      }

      const data = await response.json()
      if (response.ok) {
        setPayload({
          total: data.total ?? 0,
          counts: {
            pendingResources: data?.counts?.pendingResources ?? 0,
            openDoubts: data?.counts?.openDoubts ?? 0,
          },
          items: Array.isArray(data.items) ? data.items : [],
        })
      }
    } catch {
      // Keep last known payload when fetch fails.
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  async function markNotificationsSeen() {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    } catch {
      // Ignore failures and keep current client state.
    }
  }

  useEffect(() => {
    void loadNotifications()
    const interval = setInterval(() => {
      void loadNotifications()
    }, 45000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    void (async () => {
      await markNotificationsSeen()
      await loadNotifications()
    })()
  }, [open])

  const badgeText = useMemo(() => {
    if (payload.total > 99) return "99+"
    return String(payload.total)
  }, [payload.total])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-9 items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-500/20"
        aria-label="Admin notifications"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">Alerts</span>
        {hasItems ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
            {badgeText}
          </span>
        ) : (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-200">
            0
          </span>
        )}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-white/10 bg-[#0b1220] p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Admin Alerts</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-500 transition hover:text-slate-300"
            >
              Close
            </button>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
            <Link href="/admin/resources" className="rounded-lg border border-white/10 bg-[#101a2d] px-2 py-2 text-slate-200 hover:border-white/20">
              Pending resources: {payload.counts.pendingResources}
            </Link>
            <Link href="/admin/doubts" className="rounded-lg border border-white/10 bg-[#101a2d] px-2 py-2 text-slate-200 hover:border-white/20">
              Open doubts: {payload.counts.openDoubts}
            </Link>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {payload.items.length === 0 ? (
              <p className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400">No new alerts right now.</p>
            ) : (
              payload.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-lg border border-white/10 bg-[#101a2d] px-3 py-2 transition hover:border-white/20"
                  onClick={() => setOpen(false)}
                >
                  <p className="text-xs font-semibold text-slate-100">{item.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{item.description}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
