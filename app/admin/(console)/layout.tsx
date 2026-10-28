import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { AdminShell } from "@/components/dashboard/shells"

type AdminLayoutProps = {
  children: React.ReactNode
}

export default async function AdminConsoleLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/signin")
  }

  // Single query: fetch email, avatar AND role — was 3 separate queries before
  const service = createServiceRoleClient()
  const { data: profile } = await service
    .from("profiles")
    .select("email, avatar_url, role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role?.toLowerCase() !== "admin") {
    await supabase.auth.signOut()
    redirect("/admin/signin?error=access_denied")
  }

  const avatarUrl =
    profile?.avatar_url ||
    (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ||
    (typeof user.user_metadata?.picture === "string" ? user.user_metadata.picture : null)

  const theme = (await cookies()).get("dashboard-theme")?.value === "dark" ? "dark" : "light"

  return (
    <AdminShell initialTheme={theme} user={{ email: profile?.email || user.email || "Admin", name: `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || undefined, avatarUrl }}>
      {children}
    </AdminShell>
  )
}
