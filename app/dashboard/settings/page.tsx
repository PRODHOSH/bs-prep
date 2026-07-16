"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { User, Lock, CheckCircle, Trash2, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const supabase = createClient()

  // Profile details
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState("")
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password change
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingProfile(false)
        return
      }
      setEmail(user.email ?? "")

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, role")
        .eq("id", user.id)
        .single()

      const fallbackFirstName = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name : ""
      const fallbackLastName = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : ""

      if (profile) {
        setFirstName(profile.first_name ?? fallbackFirstName)
        setLastName(profile.last_name ?? fallbackLastName)
        setRole(profile.role ?? "student")
      } else {
        setFirstName(fallbackFirstName)
        setLastName(fallbackLastName)
      }

      // Resolve role from server so effective admin access is reflected correctly.
      try {
        const roleRes = await fetch("/api/account/me", { cache: "no-store" })
        if (roleRes.ok) {
          const roleData = await roleRes.json()
          const effectiveRole = typeof roleData?.profile?.role === "string" ? roleData.profile.role : null
          if (effectiveRole) {
            setRole(effectiveRole)
          }
        }
      } catch {
        // Keep existing role fallback from profile/user metadata.
      }

      setLoadingProfile(false)
    }
    load()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(false)

    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()

    if (!trimmedFirstName) {
      setProfileError("First name is required")
      return
    }

    if (trimmedFirstName.length > 50 || trimmedLastName.length > 50) {
      setProfileError("Names cannot exceed 50 characters")
      return
    }

    setIsSavingProfile(true)

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setProfileError(data.error || "Failed to update profile")
      setIsSavingProfile(false)
      return
    }

    setProfileSuccess(true)
    setIsSavingProfile(false)
  }

  const handleDeleteAccount = async () => {
    setDeleteError(null)
    setIsDeletingAccount(true)
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (res.ok) {
      await supabase.auth.signOut()
      window.location.href = '/'
    } else {
      const data = await res.json()
      setDeleteError(data.error ?? 'Failed to delete account')
      setIsDeletingAccount(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setIsChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setIsChangingPassword(false)

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <div id="tour-settings" className="max-w-2xl mx-auto space-y-8 py-8">
      <h1 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight">SETTINGS</h1>

      {/* Profile Details */}
      <Card className="p-8 bg-white border border-black/10 shadow-xl rounded-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">PROFILE DETAILS</h2>
        </div>

        {loadingProfile ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="text-[10px] font-black uppercase tracking-widest text-black/40">FIRST NAME</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="h-14 bg-white border-2 border-black/10 focus:border-black text-black rounded-xl font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name" className="text-[10px] font-black uppercase tracking-widest text-black/40">LAST NAME</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="h-14 bg-white border-2 border-black/10 focus:border-black text-black rounded-xl font-bold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">EMAIL ADDRESS</Label>
              <div className="h-14 px-4 flex items-center bg-black/5 border-2 border-black/10 rounded-xl text-black font-bold">
                {email}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">ROLE</Label>
              <div className="h-14 px-4 flex items-center bg-black/5 border-2 border-black/10 rounded-xl text-black font-bold capitalize">
                {role || "student"}
              </div>
            </div>

            {profileError && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-xs font-black uppercase tracking-widest text-red-700">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-xs font-black uppercase tracking-widest text-green-700">
                PROFILE UPDATED SUCCESSFULLY.
              </div>
            )}

            <Button
              type="submit"
              disabled={isSavingProfile}
              className="w-full h-14 bg-black hover:bg-black/80 text-white font-black uppercase tracking-widest text-xs rounded-full shadow-md transition-all hover:-translate-y-0.5"
            >
              {isSavingProfile ? "SAVING..." : "SAVE PROFILE"}
            </Button>
          </form>
        )}
      </Card>

      {/* Change Password */}
      <Card className="p-8 bg-white border border-black/10 shadow-xl rounded-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">CHANGE PASSWORD</h2>
        </div>

        {passwordSuccess ? (
          <div className="flex items-center gap-3 p-5 bg-green-50 border-2 border-green-200 rounded-xl text-green-700">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <span className="text-xs font-black uppercase tracking-widest">PASSWORD UPDATED SUCCESSFULLY!</span>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[10px] font-black uppercase tracking-widest text-black/40">
                NEW PASSWORD
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-14 bg-white border-2 border-black/10 focus:border-black text-black rounded-xl font-bold transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-widest text-black/40">
                CONFIRM NEW PASSWORD
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-14 bg-white border-2 border-black/10 focus:border-black text-black rounded-xl font-bold transition-all"
              />
            </div>

            {passwordError && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-xs font-black uppercase tracking-widest text-red-700">
                {passwordError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isChangingPassword}
              className="w-full h-14 bg-black hover:bg-black/80 text-white font-black uppercase tracking-widest text-xs rounded-full shadow-md transition-all hover:-translate-y-0.5"
            >
              {isChangingPassword ? "UPDATING..." : "UPDATE PASSWORD"}
            </Button>
          </form>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="p-8 bg-white border border-red-200 shadow-xl rounded-3xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-red-700 uppercase tracking-tight">DELETE ACCOUNT</h2>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-black/50 mb-6 leading-relaxed">
          PERMANENTLY DELETES YOUR ACCOUNT AND ALL ASSOCIATED DATA — PROFILE, ENROLLMENTS, AND EVERYTHING ELSE. THIS CANNOT BE UNDONE.
        </p>

        {!showDeleteConfirm ? (
          <Button
            variant="outline"
            className="h-14 px-8 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full font-black uppercase tracking-widest text-xs transition-all"
            onClick={() => setShowDeleteConfirm(true)}
          >
            DELETE MY ACCOUNT
          </Button>
        ) : (
          <div className="space-y-6 p-6 bg-red-50 border-2 border-red-200 rounded-3xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest">TYPE <strong>DELETE</strong> TO CONFIRM</span>
            </div>
            <Input
              placeholder="TYPE DELETE HERE"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="h-14 bg-white border-2 border-red-300 focus:border-red-500 text-black font-bold uppercase tracking-widest rounded-xl"
            />
            {deleteError && (
              <div className="p-4 bg-red-100 border-2 border-red-300 rounded-xl text-xs font-black uppercase tracking-widest text-red-700">
                {deleteError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 h-14 border-2 border-black/20 text-black/60 hover:text-black rounded-full font-black uppercase tracking-widest text-xs transition-all"
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); setDeleteError(null) }}
                disabled={isDeletingAccount}
              >
                CANCEL
              </Button>
              <Button
                className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-full shadow-md transition-all shadow-red-600/20 disabled:opacity-50"
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "DELETE" || isDeletingAccount}
              >
                {isDeletingAccount ? "DELETING..." : "PERMANENTLY DELETE"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
