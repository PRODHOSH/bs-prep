"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { processReferral } from "@/app/actions/referral"
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
  const [fullName, setFullName] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Read the referral cookie if it exists
    const cookies = document.cookie.split(";")
    const refCookie = cookies.find((c) => c.trim().startsWith("bsprep_ref="))
    if (refCookie) {
      setReferralCode(refCookie.split("=")[1])
    }
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const supabase = createClient()
      const redirectUrl = `${window.location.origin}/auth/callback`
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { first_name: fullName, last_name: "", role: "student" },
        },
      })
      if (error) throw error

      if (data.user && referralCode) {
        await processReferral(data.user.id, referralCode)
      }

      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
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
      <DialogContent className="bg-white border border-black/5 max-w-md p-0 overflow-hidden rounded-3xl shadow-2xl">
        <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="text-center mb-7">
            <DialogTitle className="text-3xl font-black text-black uppercase tracking-tight mb-1.5">CREATE ACCOUNT</DialogTitle>
            <DialogDescription className="text-black/70 text-sm font-medium uppercase tracking-widest">Join BSPrep to start learning</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signup-name" className="text-sm font-bold text-black uppercase tracking-widest">FULL NAME</Label>
              <Input
                id="signup-name"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 text-sm bg-white border border-black/10 focus:border-[#0a192f] focus:ring-1 focus:ring-[#0a192f] text-black placeholder:text-black/40 rounded-xl transition-all shadow-sm"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-email" className="text-sm font-bold text-black uppercase tracking-widest">EMAIL ADDRESS</Label>
              <Input
                id="signup-email"
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
              <Label htmlFor="signup-password" className="text-sm font-bold text-black uppercase tracking-widest">PASSWORD</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-sm bg-white border border-black/10 focus:border-[#0a192f] focus:ring-1 focus:ring-[#0a192f] text-black placeholder:text-black/40 rounded-xl transition-all shadow-sm"
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
                className="h-12 text-sm bg-white border border-black/10 focus:border-[#0a192f] focus:ring-1 focus:ring-[#0a192f] text-black placeholder:text-black/40 rounded-xl transition-all shadow-sm"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-referral" className="text-sm font-medium text-[#111111]">Referral Code (Optional)</Label>
              <Input
                id="signup-referral"
                placeholder="e.g. BSPREP10"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="h-12 text-sm bg-white border border-black/10 focus:border-[#0a192f] focus:ring-1 focus:ring-[#0a192f] text-black placeholder:text-black/40 rounded-xl transition-all shadow-sm uppercase"
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


            {error && (
              <div className="p-3 bg-[#fef2f2] border border-[#ef4444]/30 rounded-lg text-sm text-[#ef4444]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold bg-[#0a192f] hover:bg-[#112a52] text-white rounded-full disabled:opacity-50 tracking-widest uppercase transition-colors shadow-md"
              disabled={isLoading || !agreedToTerms}
              suppressHydrationWarning
            >
              {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </Button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/10" />
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="bg-white px-4 text-black">OR CONTINUE WITH</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full h-12 text-sm font-bold bg-white hover:bg-black/5 text-black border border-black/10 rounded-full uppercase tracking-widest transition-all shadow-sm"
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

          <div className="text-center mt-6 pt-5 border-t border-black/10">
            <p className="text-xs font-bold uppercase tracking-widest text-black/60">
              ALREADY HAVE AN ACCOUNT?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-black font-black hover:text-[#1e3a8a] transition-colors"
              >
                LOGIN
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
