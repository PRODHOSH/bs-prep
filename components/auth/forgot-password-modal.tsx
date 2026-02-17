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
import { ArrowLeft, CheckCircle } from "lucide-react"

interface ForgotPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin: () => void
}

export function ForgotPasswordModal({ open, onOpenChange, onSwitchToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://bs-prep.vercel.app/auth/update-password',
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-slate-800 max-w-md p-0 overflow-hidden">
        <div className="p-8">
          {!success ? (
            <>
              <button
                onClick={onSwitchToLogin}
                className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </button>

              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-4xl font-bold text-white mb-2">Forgot Password?</DialogTitle>
                <DialogDescription className="text-slate-400 text-base">
                  No worries, we'll send you reset instructions.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. user@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center mt-6">
                <button
                  onClick={onSwitchToLogin}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Remember your password? <span className="text-white font-semibold underline">Login</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">Check your email</h3>
              <p className="text-slate-300">
                We've sent a password reset link to <span className="text-white font-semibold">{email}</span>
              </p>
              <p className="text-slate-400 text-sm">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-slate-300 hover:text-white underline"
                >
                  try again
                </button>
              </p>
              <Button
                onClick={() => {
                  onOpenChange(false)
                  setSuccess(false)
                }}
                className="mt-4 bg-[#E8E889] hover:bg-[#E8E889]/90 text-black"
              >
                Got it
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
