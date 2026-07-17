"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { User, Lock, CheckCircle, Trash2, AlertTriangle, Key, Shield, Image as ImageIcon } from "lucide-react"

export default function SettingsPage() {
  const supabase = createClient()

  // Profile details
  const [email, setEmail] = useState("")
  const [authProvider, setAuthProvider] = useState("email")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
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
      setAuthProvider(user.app_metadata?.provider ?? "email")

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, role, profile_picture_url")
        .eq("id", user.id)
        .single()

      const fallbackFirstName = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name : ""
      const fallbackLastName = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : ""
      const fallbackPhoto = typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : ""

      if (profile) {
        setFirstName(profile.first_name ?? fallbackFirstName)
        setLastName(profile.last_name ?? fallbackLastName)
        setRole(profile.role ?? "student")
        setPhotoUrl(profile.profile_picture_url ?? fallbackPhoto)
      } else {
        setFirstName(fallbackFirstName)
        setLastName(fallbackLastName)
        setPhotoUrl(fallbackPhoto)
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
    <div id="tour-settings" className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      <h1 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight">SETTINGS</h1>

      {loadingProfile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-96 bg-black/5 rounded-[2rem] animate-pulse" />
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-black/5 rounded-[2rem] animate-pulse" />
            <div className="h-64 bg-black/5 rounded-[2rem] animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Bento Overview */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Identity Card */}
            <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative w-32 h-32 rounded-full mb-6 border-4 border-white/20 overflow-hidden shadow-2xl bg-white/10 flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white/50" />
                )}
              </div>
              
              <h2 className="text-2xl font-black tracking-tight uppercase line-clamp-1 w-full">
                {firstName || 'No Name'} {lastName}
              </h2>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest text-white/80">
                {role || 'Student'}
              </div>
              <p className="mt-4 text-white/40 text-xs font-medium truncate w-full px-4">
                {email}
              </p>
            </div>
          </div>

          {/* Right Column: Editable Forms */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Edit Profile */}
            <Card className="p-8 md:p-10 bg-white border border-black/10 shadow-lg rounded-[2rem]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black uppercase tracking-tight leading-none">EDIT PROFILE</h2>
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">Update your personal details</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-[10px] font-black uppercase tracking-widest text-black/40">FIRST NAME</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="h-14 bg-black/5 border-transparent focus:border-black/20 focus:bg-white text-black rounded-xl font-bold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-[10px] font-black uppercase tracking-widest text-black/40">LAST NAME</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="h-14 bg-black/5 border-transparent focus:border-black/20 focus:bg-white text-black rounded-xl font-bold transition-all"
                    />
                  </div>
                </div>

                {profileError && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-xs font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> PROFILE UPDATED SUCCESSFULLY.
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full md:w-auto px-8 h-12 bg-black hover:bg-black/80 text-white font-black uppercase tracking-widest text-xs rounded-full shadow-md transition-all hover:-translate-y-0.5"
                  >
                    {isSavingProfile ? "SAVING..." : "SAVE CHANGES"}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Change Password - Only show if not using OAuth */}
            {authProvider === 'email' && (
              <Card className="p-8 md:p-10 bg-white border border-black/10 shadow-lg rounded-[2rem]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-black/5">
                    <Key className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight leading-none">SECURITY</h2>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">Update your password</p>
                  </div>
                </div>

              {passwordSuccess ? (
                <div className="flex items-center gap-3 p-5 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-xs font-black uppercase tracking-widest">PASSWORD UPDATED SUCCESSFULLY!</span>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
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
                      className="h-14 bg-black/5 border-transparent focus:border-black/20 focus:bg-white text-black rounded-xl font-bold transition-all"
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
                      className="h-14 bg-black/5 border-transparent focus:border-black/20 focus:bg-white text-black rounded-xl font-bold transition-all"
                    />
                  </div>

                  {passwordError && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-xs font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> {passwordError}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="h-12 px-8 bg-black hover:bg-black/80 text-white font-black uppercase tracking-widest text-xs rounded-full shadow-md transition-all hover:-translate-y-0.5"
                    >
                      {isChangingPassword ? "UPDATING..." : "UPDATE PASSWORD"}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
            )}

            {/* Danger Zone */}
            <Card className="p-8 md:p-10 bg-white border border-black/10 shadow-lg rounded-[2rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center border border-black/10">
                  <Trash2 className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black uppercase tracking-tight leading-none">DANGER ZONE</h2>
                  <p className="text-xs font-bold text-black/50 uppercase tracking-widest mt-1">Permanent actions</p>
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-black/50 mb-6 leading-relaxed relative z-10 max-w-xl">
                PERMANENTLY DELETES YOUR ACCOUNT AND ALL ASSOCIATED DATA — PROFILE, ENROLLMENTS, AND EVERYTHING ELSE. THIS CANNOT BE UNDONE.
              </p>

              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  className="h-12 px-6 border-2 border-black/10 text-black hover:bg-black/5 hover:border-black/30 rounded-full font-black uppercase tracking-widest text-xs transition-all relative z-10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  DELETE MY ACCOUNT
                </Button>
              ) : (
                <div className="space-y-6 p-6 bg-black/5 border border-black/10 rounded-2xl relative z-10 max-w-xl">
                  <div className="flex items-center gap-2 text-black">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">TYPE <strong className="text-black bg-black/10 px-2 py-0.5 rounded">DELETE</strong> TO CONFIRM</span>
                  </div>
                  <Input
                    placeholder="TYPE DELETE HERE"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    className="h-12 bg-white border-black/20 focus:border-black text-black font-bold uppercase tracking-widest rounded-xl"
                  />
                  {deleteError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest text-red-700">
                      {deleteError}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border border-black/20 text-black/60 hover:text-black hover:bg-black/5 rounded-full font-black uppercase tracking-widest text-[10px] transition-all"
                      onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); setDeleteError(null) }}
                      disabled={isDeletingAccount}
                    >
                      CANCEL
                    </Button>
                    <Button
                      className="flex-1 h-12 bg-black hover:bg-black/80 text-white font-black uppercase tracking-widest text-[10px] rounded-full shadow-md transition-all disabled:opacity-50"
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
        </div>
      )}
    </div>
  )
}
