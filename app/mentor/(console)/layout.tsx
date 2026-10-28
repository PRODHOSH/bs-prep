import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { hasMentorRole } from "@/lib/security/mentor-role"
import { MentorShell } from "@/components/dashboard/shells"

type MentorConsoleLayoutProps = {
  children: React.ReactNode
}

export default async function MentorConsoleLayout({ children }: MentorConsoleLayoutProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/mentor/signin")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, avatar_url, first_name, last_name, mentor_subject, mentor_subjects")
    .eq("id", user.id)
    .maybeSingle()

  const isMentor = await hasMentorRole(user.id, user.email)

  if (!isMentor) {
    await supabase.auth.signOut()
    redirect("/mentor/signin?error=access_denied")
  }

  const avatarUrl =
    profile?.avatar_url ||
    (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ||
    (typeof user.user_metadata?.picture === "string" ? user.user_metadata.picture : null)

  const mentorName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
    user.user_metadata?.full_name ||
    "Mentor"

  const theme = (await cookies()).get("dashboard-theme")?.value === "dark" ? "dark" : "light"

  return (
    <MentorShell initialTheme={theme} user={{ email: profile?.email || user.email || "", name: mentorName, avatarUrl }}>{children}</MentorShell>
  )
}
