"use client"

import { useEffect, type ReactNode } from "react"
import { btnGhost, btnPrimary } from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

interface Action {
  label: string
  onClick: () => void
}

/** A small centred confirmation: title, one line of context, one clear primary action. */
export function ConfirmDialog({
  open,
  title,
  body,
  primary,
  secondary,
  danger,
  onClose,
}: {
  open: boolean
  title: string
  body: ReactNode
  primary: Action
  secondary: Action
  danger?: Action
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])
  if (!open) return null

  return (
    // No "lms" class on the scrim: it paints an opaque page background that would hide the dimmed screen.
    // The dialog sits inside an lms screen, so it still gets the theme from there.
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl border bg-card p-6 text-center text-card-foreground shadow-2xl">
        <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
        <div className={cn("mt-2 text-sm text-muted-foreground", typeof body !== "string" && "mt-4")}>{body}</div>
        <div className="mt-6 grid gap-2">
          <button className={cn(btnPrimary, "w-full")} onClick={primary.onClick} autoFocus>
            {primary.label}
          </button>
          <button className={cn(btnGhost, "w-full")} onClick={secondary.onClick}>
            {secondary.label}
          </button>
          {danger && (
            <button className="mt-1 h-9 text-sm font-semibold text-destructive hover:underline" onClick={danger.onClick}>
              {danger.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
