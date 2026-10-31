import { redirect } from "next/navigation"
import { AuthScreen } from "@/components/auth/auth-screen"
import { safeNext } from "@/lib/auth-next"
import { createClient } from "@/lib/supabase/server"

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  // Someone who is already signed in has no reason to see this page.
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (user) redirect(safeNext(next))
  return <AuthScreen initial="register" next={next} />
}
