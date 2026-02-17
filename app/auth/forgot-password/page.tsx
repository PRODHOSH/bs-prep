"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Forgot Password?</h1>
          <p className="text-slate-400 text-lg">No worries, we'll send you reset instructions.</p>
        </div>

        {!success ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. user@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-base bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500"
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
        ) : (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 text-center space-y-4">
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
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors">
            Remember your password? <span className="text-white font-semibold underline">Login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
