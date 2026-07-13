"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function ReferralTrackerContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      // Save it to a cookie valid for 30 days
      const expires = new Date()
      expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000)
      document.cookie = `bsprep_ref=${ref};expires=${expires.toUTCString()};path=/`
    }
  }, [searchParams])

  return null
}

export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerContent />
    </Suspense>
  )
}
