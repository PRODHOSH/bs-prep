import { redirect } from "next/navigation"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { AdminShell } from "@/components/admin/admin-shell"

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
    .select("email, avatar_url, role")
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

  return (
    <AdminShell email={profile?.email || user.email || "Admin"} avatarUrl={avatarUrl}>
      {children}
    </AdminShell>
  )
}
