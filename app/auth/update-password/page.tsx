"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Update Password</h1>
          <p className="text-black/50 text-lg">Choose a new secure password.</p>
        </div>

        {!success ? (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 text-base bg-slate-900/50 border-slate-700 text-white placeholder:text-black/60 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-14 text-base bg-slate-900/50 border-slate-700 text-white placeholder:text-black/60 focus:border-purple-500 focus:ring-purple-500"
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
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        ) : (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">Password Updated!</h3>
            <p className="text-slate-300">
              Your password has been successfully updated.
            </p>
            <p className="text-black/50 text-sm">
              Redirecting to login page...
            </p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/auth/login" className="text-black/50 hover:text-white transition-colors">
            Back to <span className="text-white font-semibold underline">Login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
