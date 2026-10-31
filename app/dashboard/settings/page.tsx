"use client"

import { useState, useEffect } from "react"
import { getUserCached, notifyProfileUpdated } from "@/lib/supabase/cached-user"
import { SettingsSkeleton } from "@/components/dashboard/skeleton"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { ArrowUpRight, BookOpen, KeyRound, Mail, Trash2, User } from "lucide-react"
import { courses } from "@/lib/course-catalog"
import { Avatar, Field, Notice, PageHeader, Section, Tag, btnDanger, btnGhost, btnPrimary, field } from "@/components/dashboard/ui"

export default function SettingsPage() {
  const supabase = createClient()

  // Profile details
  const [email, setEmail] = useState("")
  const [authProvider, setAuthProvider] = useState("email")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [enrolledIds, setEnrolledIds] = useState<string[]>([])
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
      const { data: { user } } = await getUserCached()
      if (!user) {
        setLoadingProfile(false)
        return
      }
      setEmail(user.email ?? "")
      setAuthProvider(user.app_metadata?.provider ?? "email")

      const { data: enrollments } = await supabase.from("enrollments").select("course_id").eq("user_id", user.id)
      setEnrolledIds((enrollments ?? []).map((e) => e.course_id))

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
    notifyProfileUpdated()
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

  const displayName = `${firstName} ${lastName}`.trim() || "No name"
  const enrolledCourses = enrolledIds.map((id) => courses.find((c) => c.id === id) ?? { id, title: id, level: "" })

  if (loadingProfile) return <SettingsSkeleton />

  return (
    <div id="tour-settings" className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-5">
        <PageHeader title="Settings" description="Manage your profile and account." />

        <Section icon={User} title="Profile" description="Your name as it appears across BSPrep.">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="first-name">
                <input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={field} />
              </Field>
              <Field label="Last name" htmlFor="last-name">
                <input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={field} />
              </Field>
            </div>
            <Field label="Email" htmlFor="email" hint="Your sign-in email can't be changed here.">
              <input id="email" value={email} readOnly className={`${field} cursor-not-allowed bg-muted/60 text-muted-foreground`} />
            </Field>
            {profileError && <Notice tone="error">{profileError}</Notice>}
            {profileSuccess && <Notice tone="success">Profile updated.</Notice>}
            <div className="flex justify-end">
              <button type="submit" disabled={isSavingProfile} className={btnPrimary}>
                {isSavingProfile ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </Section>

        <Section icon={BookOpen} tone="green" title="Courses enrolled" description="Everything you have access to on BSPrep.">
          {enrolledCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You are not enrolled in any course yet.{" "}
              <Link href="/dashboard/courses" className="font-semibold text-foreground underline underline-offset-2">Browse courses</Link>
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {enrolledCourses.map((c) => (
                <li key={c.id}>
                  <Link href={`/dashboard/courses/${c.id}`} className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/60">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{c.title}</span>
                      {c.level && <span className="text-xs capitalize text-muted-foreground">{c.level}</span>}
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            Any issue with your courses or payments? Email{" "}
            <a href="mailto:support@bsprep.in" className="font-semibold text-foreground underline underline-offset-2">support@bsprep.in</a>
          </p>
        </Section>

        {authProvider === "email" && (
          <Section icon={KeyRound} tone="amber" title="Password" description="Use at least 8 characters.">
            {passwordSuccess ? (
              <Notice tone="success">Password updated.</Notice>
            ) : (
              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <Field label="New password" htmlFor="new-password">
                  <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="At least 8 characters" className={field} />
                </Field>
                <Field label="Confirm new password" htmlFor="confirm-password">
                  <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Repeat the new password" className={field} />
                </Field>
                {passwordError && <Notice tone="error">{passwordError}</Notice>}
                <button type="submit" disabled={isChangingPassword} className={btnPrimary}>
                  {isChangingPassword ? "Updating…" : "Update password"}
                </button>
              </form>
            )}
          </Section>
        )}

        <section className="rounded-2xl border border-destructive/30 bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-[18px]" />
              </span>
              <div>
                <h2 className="text-base font-bold leading-tight">Delete account</h2>
                <p className="max-w-lg text-xs text-muted-foreground">
                  Permanently removes your profile, enrollments and all related data. This can&apos;t be undone.
                </p>
              </div>
            </div>
            {!showDeleteConfirm && (
              <button type="button" className={btnDanger} onClick={() => setShowDeleteConfirm(true)}>
                Delete account
              </button>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="mt-5 space-y-4 rounded-xl bg-muted/60 p-4">
              <Field label="Type DELETE to confirm" htmlFor="delete-confirm">
                <input id="delete-confirm" placeholder="DELETE" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} className={field} />
              </Field>
              {deleteError && <Notice tone="error">{deleteError}</Notice>}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteInput("")
                    setDeleteError(null)
                  }}
                  disabled={isDeletingAccount}
                >
                  Cancel
                </button>
                <button type="button" className={btnDanger} onClick={handleDeleteAccount} disabled={deleteInput !== "DELETE" || isDeletingAccount}>
                  {isDeletingAccount ? "Deleting…" : "Permanently delete"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="xl:pt-[4.25rem]">
        <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-chart-1/15 via-card to-card p-6 text-center">
          <Avatar name={displayName} src={photoUrl || null} size={88} className="mx-auto" />
          <h2 className="mt-4 truncate text-lg font-extrabold tracking-tight">{displayName}</h2>
          <div className="mt-2">
            <Tag tone="primary" className="capitalize">{role || "student"}</Tag>
          </div>
          <p className="mt-3 truncate text-xs text-muted-foreground">{email}</p>
        </section>
      </aside>
    </div>
  )
}
