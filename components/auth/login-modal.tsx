"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignUp: () => void
  onSwitchToForgotPassword: () => void
}

export function LoginModal({ open, onOpenChange, onSwitchToSignUp, onSwitchToForgotPassword }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)

    try {

      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      onOpenChange(false)
      setTimeout(() => { window.location.href = "/dashboard" }, 100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    const redirectUrl = `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[#e5e7eb] max-w-md p-0 overflow-hidden rounded-2xl">
        <div className="p-8">
          <DialogHeader className="text-center mb-7">
            <DialogTitle className="text-3xl font-semibold text-[#111111] tracking-[-1px] mb-1.5">Welcome back</DialogTitle>
            <DialogDescription className="text-[#6b7280] text-sm">Enter your credentials to continue</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-sm font-medium text-[#111111]">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-sm font-medium text-[#111111]">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-[50px] bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                suppressHydrationWarning
              />
            </div>



            {error && (
              <div className="p-3 bg-[#fef2f2] border border-[#ef4444]/30 rounded-lg text-sm text-[#ef4444]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold bg-[#111111] hover:bg-[#242424] text-white rounded-lg disabled:opacity-50"
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e5e7eb]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-[#6b7280] tracking-wider">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-10 text-sm font-semibold bg-white hover:bg-[#f5f5f5] text-[#111111] border border-[#e5e7eb] rounded-lg"
            >
              <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm text-[#6b7280] hover:text-[#111111] transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-[#e5e7eb]">
            <p className="text-sm text-[#6b7280]">
              Need an account?{" "}
              <button
                onClick={onSwitchToSignUp}
                className="text-[#111111] font-semibold hover:text-[#242424] transition-colors"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
