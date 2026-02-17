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
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      window.location.href = "/dashboard"
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://bs-prep.vercel.app/dashboard',
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-slate-800 max-w-md p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-4xl font-bold text-white mb-2">Welcome Back</DialogTitle>
            <DialogDescription className="text-slate-400 text-base">Enter your coordinates.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Username
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. Euler"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-base bg-transparent border border-slate-700 rounded-md text-white placeholder:text-slate-600 focus:border-slate-600 focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 text-base bg-transparent border border-slate-700 rounded-md text-white placeholder:text-slate-600 focus:border-slate-600 focus:ring-0"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold bg-[#E8E889] hover:bg-[#E8E889]/90 text-black transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-4 text-slate-500 tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-14 text-base font-semibold bg-transparent hover:bg-slate-900 text-white border border-slate-700 rounded-md transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors underline"
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-slate-400">
              Need an account?{" "}
              <button
                onClick={onSwitchToSignUp}
                className="text-slate-300 font-semibold hover:text-white transition-colors underline"
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
