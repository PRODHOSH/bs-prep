"use client"

import { useState } from "react"
import { TurnstileWidget } from "@/components/turnstile-widget"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"


interface SignUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin: () => void
}

export function SignUpModal({ open, onOpenChange, onSwitchToLogin }: SignUpModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!turnstileToken) {
      setError("Please complete the security check first.")
      return
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        setError(verifyData.error || "Security check failed. Please try again.")
        setTurnstileToken(null)
        setIsLoading(false)
        return
      }

      const supabase = createClient()
      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { first_name: firstName, last_name: lastName, role: "student" },
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setTurnstileToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    const supabase = createClient()
    const redirectUrl = `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    })
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white border-[#e5e7eb] max-w-md rounded-2xl">
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-[#111111] tracking-[-0.5px]">Check your email!</h3>
            <p className="text-[#374151] text-sm">
              We've sent a confirmation email to{" "}
              <span className="text-[#111111] font-semibold">{email}</span>
            </p>
            <p className="text-[#6b7280] text-sm">
              Click the link in the email to verify your account and complete registration.
            </p>
            <Button
              onClick={() => { onOpenChange(false); setSuccess(false) }}
              className="mt-4 bg-[#111111] hover:bg-[#242424] text-white rounded-lg h-10 text-sm font-semibold"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[#e5e7eb] max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto rounded-2xl">
        <div className="p-8">
          <DialogHeader className="text-center mb-7">
            <DialogTitle className="text-3xl font-semibold text-[#111111] tracking-[-1px] mb-1.5">Create account</DialogTitle>
            <DialogDescription className="text-[#6b7280] text-sm">Join the BSPrep community</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="signup-firstName" className="text-sm font-medium text-[#111111]">First Name</Label>
                <Input
                  id="signup-firstName"
                  placeholder="John"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-10 text-sm bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-lastName" className="text-sm font-medium text-[#111111]">Last Name</Label>
                <Input
                  id="signup-lastName"
                  placeholder="Doe"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10 text-sm bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-email" className="text-sm font-medium text-[#111111]">Email Address</Label>
              <Input
                id="signup-email"
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
              <Label htmlFor="signup-password" className="text-sm font-medium text-[#111111]">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="At least 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-[25px] bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-repeat-password" className="text-sm font-medium text-[#111111]">Confirm Password</Label>
              <Input
                id="signup-repeat-password"
                type="password"
                placeholder="••••••••"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="h-10 text-[25px] bg-white border-[#e5e7eb] focus:border-[#111111] text-[#111111] placeholder:text-[#6b7280] rounded-lg"
                suppressHydrationWarning
              />
            </div>

            <div className="flex items-start space-x-3 p-3 bg-[#f8f9fa] rounded-lg border border-[#e5e7eb]">
              <Checkbox
                id="signup-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="signup-terms" className="text-sm text-[#374151] cursor-pointer flex-1 leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-[#111111] hover:text-[#242424] underline font-medium">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-[#111111] hover:text-[#242424] underline font-medium">Privacy Policy</Link>
              </label>
            </div>

            <TurnstileWidget
              open={open}
              onSuccess={(token) => { setTurnstileToken(token); setError(null) }}
              onExpire={() => setTurnstileToken(null)}
              onError={() => { setTurnstileToken(null); setError("Security check failed. Please refresh and try again.") }}
            />

            {error && (
              <div className="p-3 bg-[#fef2f2] border border-[#ef4444]/30 rounded-lg text-sm text-[#ef4444]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold bg-[#111111] hover:bg-[#242424] text-white rounded-lg disabled:opacity-50"
              disabled={isLoading || !agreedToTerms || !turnstileToken}
              suppressHydrationWarning
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e5e7eb]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-[#6b7280] tracking-wider">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full h-10 text-sm font-semibold bg-white hover:bg-[#f5f5f5] text-[#111111] border border-[#e5e7eb] rounded-lg"
            >
              <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </Button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-[#e5e7eb]">
            <p className="text-sm text-[#6b7280]">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-[#111111] font-semibold hover:text-[#242424] transition-colors"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
