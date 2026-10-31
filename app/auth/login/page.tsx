import { AuthScreen } from "@/components/auth/auth-screen"

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return <AuthScreen initial="login" next={next} />
}
