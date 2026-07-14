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
      // Use current origin for redirect (works for both localhost and production)
      const redirectUrl = `${window.location.origin}/auth/update-password`
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
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
      <DialogContent className="bg-white border border-black/5 max-w-md p-0 overflow-hidden rounded-3xl shadow-2xl">
        <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {!success ? (
            <>
              <button
                onClick={onSwitchToLogin}
                className="inline-flex items-center text-xs font-bold text-black/60 hover:text-black transition-colors mb-6 group tracking-widest uppercase"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                BACK TO LOGIN
              </button>

              <DialogHeader className="text-center mb-6">
                <DialogTitle className="text-3xl font-black text-black uppercase tracking-tight mb-1.5">FORGOT PASSWORD</DialogTitle>
                <DialogDescription className="text-black/70 text-sm font-medium uppercase tracking-widest">
                  No worries, we'll send you reset instructions.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-black uppercase tracking-widest">
                    EMAIL ADDRESS
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-sm bg-white border border-black/10 focus:border-[#0a192f] focus:ring-1 focus:ring-[#0a192f] text-black placeholder:text-black/40 rounded-xl transition-all shadow-sm"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-bold bg-[#0a192f] hover:bg-[#112a52] text-white rounded-full disabled:opacity-50 tracking-widest uppercase transition-colors shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "SENDING..." : "SEND RESET LINK"}
                </Button>
              </form>

              <div className="text-center mt-6">
                <button
                  onClick={onSwitchToLogin}
                  className="text-xs font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors"
                >
                  REMEMBER YOUR PASSWORD? <span className="text-[#1e3a8a] font-black underline">LOGIN</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">CHECK YOUR EMAIL</h3>
              <p className="text-black/70 text-sm font-bold uppercase">
                We've sent a password reset link to <span className="text-[#0a192f] font-black">{email}</span>
              </p>
              <p className="text-black/50 text-xs font-bold uppercase mt-2">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-[#0a192f] hover:text-[#112a52] underline font-black"
                >
                  TRY AGAIN
                </button>
              </p>
              <Button
                onClick={() => {
                  onOpenChange(false)
                  setSuccess(false)
                }}
                className="mt-6 h-12 text-sm font-bold bg-[#0a192f] hover:bg-[#112a52] text-white rounded-full tracking-widest uppercase transition-colors shadow-md px-8"
              >
                GOT IT
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
