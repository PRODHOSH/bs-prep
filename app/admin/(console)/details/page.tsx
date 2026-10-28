"use client"

import { FormEvent, useEffect, useState } from "react"
import { Sk } from "@/components/dashboard/skeleton"
import { Trash2, User } from "lucide-react"
import { Avatar, Field, Notice, PageHeader, Section, Tag, btnDanger, btnGhost, btnPrimary, field } from "@/components/dashboard/ui"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type AdminProfile = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  created_at: string
  avatar_url: string | null
}

export default function AdminDetailsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) {
          setStatusMessage(data.error || "Failed to load admin details")
          return
        }

        const nextProfile = data?.profile || null
        setProfile(nextProfile)
        setFirstName(nextProfile?.first_name ?? "")
        setLastName(nextProfile?.last_name ?? "")
      } catch {
        setStatusMessage("Failed to load admin details")
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setProfileSaving(true)
    setStatusMessage("")

    try {
      const res = await fetch("/api/admin/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setStatusMessage(data.error || "Failed to update profile")
        return
      }

      setProfile(data.profile)
      setStatusMessage("Profile updated successfully")
    } catch {
      setStatusMessage("Failed to update profile")
    } finally {
      setProfileSaving(false)
    }
  }

  async function deleteMyAccount() {
    setDeleteError("")
    setIsDeletingAccount(true)

    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" })
      const data = await res.json()

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete account")
        setIsDeletingAccount(false)
        return
      }

      await supabase.auth.signOut()
      router.push("/")
    } catch {
      setDeleteError("Failed to delete account")
      setIsDeletingAccount(false)
    }
  }

  const displayName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || profile?.email || "Admin"

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-5">
        <PageHeader title="Settings" description="Manage your admin profile and account." />

        <Section icon={User} title="Name" description="Only first and last name can be changed here.">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={field} /></Field>
              <Field label="Last name"><input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={field} /></Field>
            </div>
            {statusMessage && <Notice>{statusMessage}</Notice>}
            <div className="flex justify-end">
              <button type="submit" disabled={profileSaving} className={btnPrimary}>{profileSaving ? "Saving…" : "Save changes"}</button>
            </div>
          </form>
        </Section>

        <section className="rounded-2xl border border-destructive/30 bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-[18px]" />
              </span>
              <div>
                <h2 className="text-base font-bold leading-tight">Delete account</h2>
                <p className="text-xs text-muted-foreground">Permanently removes your account. This can&apos;t be undone.</p>
              </div>
            </div>
            {!showDeleteConfirm && (
              <button type="button" onClick={() => setShowDeleteConfirm(true)} className={btnDanger}>Delete account</button>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="mt-5 space-y-4 rounded-xl bg-muted/60 p-4">
              <Field label="Type DELETE to confirm">
                <input value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder="DELETE" className={field} />
              </Field>
              {deleteError && <Notice tone="error">{deleteError}</Notice>}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteInput("")
                    setDeleteError("")
                  }}
                  disabled={isDeletingAccount}
                  className={btnGhost}
                >
                  Cancel
                </button>
                <button type="button" onClick={deleteMyAccount} disabled={deleteInput !== "DELETE" || isDeletingAccount} className={btnDanger}>
                  {isDeletingAccount ? "Deleting…" : "Confirm delete"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="xl:pt-[4.25rem]">
        <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-chart-1/15 via-card to-card p-6 text-center">
          {isLoading ? (
            <Sk className="mx-auto size-[88px] rounded-full" />
          ) : (
            <Avatar name={displayName} src={profile?.avatar_url} size={88} className="mx-auto" />
          )}
          <h2 className="mt-4 truncate text-lg font-extrabold tracking-tight">{isLoading ? "Loading…" : displayName}</h2>
          <div className="mt-2"><Tag tone="primary" className="capitalize">{profile?.role || "admin"}</Tag></div>
          <p className="mt-3 truncate text-xs text-muted-foreground">{profile?.email}</p>
          {profile?.created_at && <p className="mt-1 text-xs text-muted-foreground">Joined {new Date(profile.created_at).toLocaleDateString()}</p>}
        </section>
      </aside>
    </div>
  )
}
