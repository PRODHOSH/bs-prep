"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Lock, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getUserCached } from "@/lib/supabase/cached-user"
import { SettingsSkeleton } from "@/components/dashboard/skeleton"
import { Avatar, Field, Notice, PageHeader, Section, Tag, btnPrimary, field } from "@/components/dashboard/ui"
import { subjectLabels } from "@/components/dashboard/subject-picker"

export default function MentorSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const [assigned, setAssigned] = useState<string[]>([])

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await getUserCached()
        if (!user) return
        setEmail(user.email ?? "")

        const [{ data: profile }, subjectRes] = await Promise.all([
          createClient().from("profiles").select("first_name, last_name, avatar_url").eq("id", user.id).maybeSingle(),
          fetch("/api/mentor/subject", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
        ])

        const meta = user.user_metadata ?? {}
        setFirstName(profile?.first_name ?? (typeof meta.first_name === "string" ? meta.first_name : ""))
        setLastName(profile?.last_name ?? (typeof meta.last_name === "string" ? meta.last_name : ""))
        setAvatarUrl(profile?.avatar_url || (typeof meta.avatar_url === "string" ? meta.avatar_url : null) || (typeof meta.picture === "string" ? meta.picture : null))

        if (subjectRes) setAssigned(subjectRes.selected_course_ids ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selectedLabels = subjectLabels(assigned)
  const displayName = `${firstName} ${lastName}`.trim() || email || "Mentor"

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim()) return setProfileMsg({ tone: "error", text: "First name is required." })
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update profile")
      setProfileMsg({ tone: "success", text: "Profile updated." })
      router.refresh() // re-render the sidebar with the new name
    } catch (err) {
      setProfileMsg({ tone: "error", text: err instanceof Error ? err.message : "Failed to update profile" })
    } finally {
      setSavingProfile(false)
    }
  }

  if (loading) return <SettingsSkeleton />

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-5">
        <PageHeader title="Settings" description="Your account details and the subjects you mentor." />

        <Section icon={User} title="Account" description="Your name as students see it.">
          <form onSubmit={saveProfile} className="space-y-4">
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
            {profileMsg && <Notice tone={profileMsg.tone}>{profileMsg.text}</Notice>}
            <div className="flex justify-end">
              <button type="submit" disabled={savingProfile} className={btnPrimary}>
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </Section>

        <Section icon={BookOpen} tone="pink" title="Subjects" description="The subjects you mentor. Your classes, doubts and student groups follow these.">
          {selectedLabels.length === 0 ? (
            <Notice>No subjects are assigned to you yet. Ask an admin to add them.</Notice>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {selectedLabels.map((l) => (
                <li key={l} className="rounded-xl border bg-muted/50 px-3.5 py-2 text-sm font-semibold">{l}</li>
              ))}
            </ul>
          )}
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 shrink-0" /> Subjects are assigned by an admin. Message one to change them.
          </p>
        </Section>
      </div>

      <aside className="xl:pt-[4.25rem]">
        <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-chart-1/15 via-card to-card p-6 text-center">
          <Avatar name={displayName} src={avatarUrl} size={88} className="mx-auto" />
          <h2 className="mt-4 truncate text-lg font-extrabold tracking-tight">{displayName}</h2>
          <div className="mt-2"><Tag tone="primary">Mentor</Tag></div>
          <p className="mt-3 truncate text-xs text-muted-foreground">{email}</p>
          {selectedLabels.length > 0 && (
            <div className="mt-5 border-t pt-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Mentoring</p>
              <ul className="flex flex-wrap justify-center gap-1.5">
                {selectedLabels.map((l) => (
                  <li key={l}><Tag>{l}</Tag></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </aside>
    </div>
  )
}
