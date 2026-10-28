"use client"

import { useEffect, type ReactNode } from "react"
import { X, Search } from "lucide-react"
import { cn } from "@/lib/utils"

/** Underline tabs, as in the LMS content and reports pages. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { id: T; label: string; count?: number }[]
  value: T
  onChange: (id: T) => void
  className?: string
}) {
  return (
    <div role="tablist" className={cn("no-scrollbar flex gap-1 overflow-x-auto overflow-y-hidden border-b", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative whitespace-nowrap px-3.5 pb-3 pt-1 text-sm font-semibold transition-colors",
            value === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 rounded-md bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">{t.count}</span>}
          {value === t.id && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-foreground" />}
        </button>
      ))}
    </div>
  )
}

/** Compact segmented switch (grid / list, ranges, filters). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: T; label: ReactNode; title?: string }[]
  value: T
  onChange: (id: T) => void
  className?: string
}) {
  return (
    <div role="group" className={cn("inline-flex rounded-lg bg-muted p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          title={o.title}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors",
            value === o.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search",
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <label className={cn("flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm focus-within:border-primary", className)}>
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        suppressHydrationWarning
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
      />
    </label>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-md",
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="lms fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn("w-full rounded-2xl border bg-card p-6 shadow-2xl", width)}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
