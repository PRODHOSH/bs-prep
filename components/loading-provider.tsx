"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loading } from "./loading"
import { isAppRoute } from "@/lib/app-routes"

// Brief branded splash between public pages. The dashboards have their own skeletons, so they skip it.
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const inApp = isAppRoute(pathname)

  useEffect(() => {
    if (inApp) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timeout)
  }, [pathname, inApp])

  return (
    <>
      {isLoading && !inApp && <Loading />}
      {children}
    </>
  )
}
