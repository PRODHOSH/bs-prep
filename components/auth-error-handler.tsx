"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function AuthErrorHandler() {
  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        fetch("/api/auth/signout", { method: "POST" }).catch(() => {})
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
