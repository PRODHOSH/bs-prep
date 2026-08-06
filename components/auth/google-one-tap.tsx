"use client"

import { useRef } from "react"
import Script from "next/script"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function GoogleOneTap() {
  const router = useRouter()
  // Read synchronously — Next.js inlines this at build time so it's always available on client
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Generate and store a nonce to prevent replay attacks (required by Supabase)
  const nonceRef = useRef<string>("")

  const handleCredentialResponse = async (response: any) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
        nonce: nonceRef.current, // Pass the exact same nonce to Supabase
      })

      if (error) throw error

      if (data?.session) {
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error("Google One Tap error:", err)
    }
  }

  // Track if we've already initialized to prevent Strict Mode double-firing
  const hasInitialized = useRef<boolean>(false)

  const initializeGoogleOneTap = async () => {
    if (!clientId) {
      console.error("Google One Tap: No client ID found")
      return
    }
    
    if (hasInitialized.current) return
    hasInitialized.current = true

    if (typeof window !== "undefined" && window.google) {
      // 1. Generate a raw nonce
      const rawNonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
      nonceRef.current = rawNonce

      // 2. Hash it using SHA-256
      const encoder = new TextEncoder()
      const encodedNonce = encoder.encode(rawNonce)
      const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      // 3. Initialize Google with the HASHED nonce
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        itp_support: true,
        cancel_on_tap_outside: false,
        nonce: hashedNonce, // Google gets the hashed nonce
      })
      
      // The prompt function takes a callback that tells us exactly what Google decided to do
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log("Google One Tap not displayed. Reason:", notification.getNotDisplayedReason())
        } else if (notification.isSkippedMoment()) {
          console.log("Google One Tap skipped. Reason:", notification.getSkippedReason())
        } else if (notification.isDismissedMoment()) {
          console.log("Google One Tap dismissed. Reason:", notification.getDismissedReason())
        }
      })

      // Also render the personalized button if a container exists
      const btnContainer = document.getElementById("google-personalized-button")
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: "250",
        })
      }
    }
  }

  if (!clientId) return null

  return (
    <Script 
      src="https://accounts.google.com/gsi/client" 
      strategy="afterInteractive" 
      onLoad={initializeGoogleOneTap}
    />
  )
}
