"use client"

import { FormEvent, useEffect, useState } from "react"
import { SkRows } from "@/components/dashboard/skeleton"
import { Megaphone, Pencil, Trash2 } from "lucide-react"
import { Modal } from "@/components/dashboard/controls"
import { EmptyState, Field, Notice, PageHeader, Section, Tag, btnGhost, btnPrimary, field } from "@/components/dashboard/ui"

type Announcement = {
  id: string | number
  title: string
  message: string
  display_hours?: number | null
  created_at: string
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const [title, setTitle] = useState("")
  const [messageText, setMessageText] = useState("")
  const [displayHours, setDisplayHours] = useState("24")
  const [loadingCreate, setLoadingCreate] = useState(false)

  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editMessage, setEditMessage] = useState("")
  const [editDisplayHours, setEditDisplayHours] = useState("24")
  const [loadingEdit, setLoadingEdit] = useState(false)

  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [statusMessage, setStatusMessage] = useState("")

  async function loadAnnouncements() {
    setLoadingList(true)
    try {
      const res = await fetch("/api/announcements?includeExpired=1", { cache: "no-store" })
      const data = await res.json()

      if (!res.ok) {
        setStatusMessage(data.error || "Failed to load announcements")
        return
      }

      setAnnouncements(data)
    } catch {
      setStatusMessage("Failed to load announcements")
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    void loadAnnouncements()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setLoadingCreate(true)
    setStatusMessage("")

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message: messageText,
          display_hours: Number(displayHours),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const detail = typeof data.details === "string" && data.details ? ` (${data.details})` : ""
        setStatusMessage((data.error || "Something went wrong") + detail)
      } else {
        setStatusMessage("Announcement added successfully")
        setTitle("")
        setMessageText("")
        setDisplayHours("24")
        await loadAnnouncements()
      }
    } catch {
      setStatusMessage("Network error while posting announcement")
    } finally {
      setLoadingCreate(false)
    }
  }

  function startEdit(announcement: Announcement) {
    setEditingId(announcement.id)
    setEditTitle(announcement.title)
    setEditMessage(announcement.message || "")
    setEditDisplayHours(String(announcement.display_hours ?? 24))
    setStatusMessage("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle("")
    setEditMessage("")
    setEditDisplayHours("24")
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editingId) {
      return
    }

    setLoadingEdit(true)
    setStatusMessage("")

    const res = await fetch(`/api/announcements/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle,
        message: editMessage,
        display_hours: Number(editDisplayHours),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setStatusMessage(data.error || "Failed to update announcement")
    } else {
      setStatusMessage("Announcement updated successfully")
      cancelEdit()
      await loadAnnouncements()
    }

    setLoadingEdit(false)
  }

  async function handleDelete(id: string | number) {
    setDeletingId(id)
    setStatusMessage("")

    const res = await fetch(`/api/announcements/${id}`, {
      method: "DELETE",
    })

    const data = await res.json()

    if (!res.ok) {
      setStatusMessage(data.error || "Failed to delete announcement")
    } else {
      setStatusMessage("Announcement deleted successfully")
      if (editingId === id) {
        cancelEdit()
      }
      await loadAnnouncements()
    }

    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" description="Post updates that show on the student dashboard for a set number of hours." />

      {statusMessage && <Notice>{statusMessage}</Notice>}

      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <Section icon={Megaphone} title="New announcement" description="Visible to every student." className="h-fit">
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Title" htmlFor="title">
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="What's the update?" className={field} suppressHydrationWarning />
            </Field>
            <Field label="Message" htmlFor="message">
              <textarea id="message" value={messageText} onChange={(e) => setMessageText(e.target.value)} required rows={5} placeholder="Write the announcement" className={`${field} h-auto resize-none py-3`} suppressHydrationWarning />
            </Field>
            <Field label="Show for (hours)" htmlFor="hours" hint="Between 1 and 720 hours.">
              <input id="hours" type="number" min={1} max={720} value={displayHours} onChange={(e) => setDisplayHours(e.target.value)} required className={field} suppressHydrationWarning />
            </Field>
            <button type="submit" disabled={loadingCreate} className={`${btnPrimary} w-full`} suppressHydrationWarning>
              {loadingCreate ? "Posting…" : "Post announcement"}
            </button>
          </form>
        </Section>

        <section className="min-w-0">
          <h2 className="mb-3 text-sm font-bold">
            All announcements <span className="ml-1 rounded-md bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">{announcements.length}</span>
          </h2>
          {loadingList ? (
            <SkRows rows={3} />
          ) : announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements yet" hint="Post the first one using the form." />
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold leading-snug">{a.title}</h3>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{a.message || ""}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => startEdit(a)} aria-label="Edit" title="Edit" className="grid size-8 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground" suppressHydrationWarning>
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        aria-label="Delete"
                        title="Delete"
                        className="grid size-8 place-items-center rounded-lg border text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        suppressHydrationWarning
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Tag>{new Date(a.created_at).toLocaleString()}</Tag>
                    <Tag tone="primary">Visible {a.display_hours ?? 24}h</Tag>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Modal open={!!editingId} onClose={cancelEdit} title="Edit announcement" width="max-w-lg">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Field label="Title"><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className={field} suppressHydrationWarning /></Field>
          <Field label="Message"><textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} required rows={5} className={`${field} h-auto resize-none py-3`} suppressHydrationWarning /></Field>
          <Field label="Show for (hours)"><input type="number" min={1} max={720} value={editDisplayHours} onChange={(e) => setEditDisplayHours(e.target.value)} required className={field} suppressHydrationWarning /></Field>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={cancelEdit} className={btnGhost} suppressHydrationWarning>Cancel</button>
            <button type="submit" disabled={loadingEdit} className={btnPrimary} suppressHydrationWarning>{loadingEdit ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
