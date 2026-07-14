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
      <DialogContent className="bg-white border border-black/5 max-w-md p-0 overflow-hidden rounded-3xl shadow-2xl">
        <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="text-center mb-7">
            <DialogTitle className="text-3xl font-black text-black uppercase tracking-tight mb-1.5">WELCOME BACK</DialogTitle>
            <DialogDescription className="text-black/70 text-sm font-medium uppercase tracking-widest">Enter your credentials to continue</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-sm font-bold text-black uppercase tracking-widest">EMAIL ADDRESS</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-sm bg-white border border-black/10 focus:border-[#0a192f] focus:ring-1 focus:ring-[#0a192f] text-black placeholder:text-black/40 rounded-xl transition-all shadow-sm"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-sm font-bold text-black uppercase tracking-widest">PASSWORD</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-sm bg-white border border-black/10 focus:border-[#0a192f] focus:ring-1 focus:ring-[#0a192f] text-black placeholder:text-black/40 rounded-xl transition-all shadow-sm"
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
              className="w-full h-12 text-sm font-bold bg-[#0a192f] hover:bg-[#112a52] text-white rounded-full disabled:opacity-50 tracking-widest uppercase transition-colors shadow-md"
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? "LOGGING IN..." : "LOGIN"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/10" />
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="bg-white px-4 text-black">OR CONTINUE WITH</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-12 text-sm font-bold bg-white hover:bg-black/5 text-black border border-black/10 rounded-full uppercase tracking-widest transition-all shadow-sm"
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
                className="text-xs font-bold text-black/60 hover:text-black transition-colors uppercase tracking-widest underline underline-offset-4"
              >
                FORGOT PASSWORD?
              </button>
            </div>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-black/10">
            <p className="text-xs font-bold uppercase tracking-widest text-black/60">
              NEED AN ACCOUNT?{" "}
              <button
                onClick={onSwitchToSignUp}
                className="text-black font-black hover:text-[#1e3a8a] transition-colors"
              >
                REGISTER
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
