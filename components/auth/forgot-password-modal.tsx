"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

/** The sign-in popup is gone: asking to open it now takes the visitor to the full page and back. */
export function ForgotPasswordModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; onSwitchToSignUp?: () => void; onSwitchToLogin?: () => void; onSwitchToForgotPassword?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    onOpenChange(false)
    router.push(`/auth/forgot?next=${encodeURIComponent(pathname || "/dashboard")}`)
  }, [open, onOpenChange, pathname, router])

  return null
}
