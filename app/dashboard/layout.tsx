import type React from "react"
import { cookies } from "next/headers"
import { StudentShell } from "@/components/dashboard/shells"

// Server layout: the shell renders immediately (proxy.ts already guards this route), and the theme
// comes from a cookie so there is no flash. The signed-in user is filled in by the shell afterwards.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("dashboard-theme")?.value === "dark" ? "dark" : "light"
  return <StudentShell initialTheme={theme}>{children}</StudentShell>
}
