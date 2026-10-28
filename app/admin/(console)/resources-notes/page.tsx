"use client"

import { useEffect, useMemo, useState } from "react"
import { SkRows } from "@/components/dashboard/skeleton"
import { BookOpen, CheckCircle2, ExternalLink, Trash2, XCircle } from "lucide-react"
import { SearchBox, Tabs } from "@/components/dashboard/controls"
import { Avatar, EmptyState, Notice, PageHeader, Tag, btnGhost, btnPrimary } from "@/components/dashboard/ui"

type ReviewStatus = "pending" | "approved" | "rejected"

type AdminResourceNote = {
  id: string
  user_id: string
  degree: string
  level: string
  subject: string
  notes_week_from: number
  notes_week_to: number
  title: string
  contributor_name: string
  notes_content_label: string
  drive_link: string
  status: ReviewStatus
  created_at: string
  updated_at: string
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export default function AdminResourcesNotesPage() {
  const [status, setStatus] = useState<ReviewStatus>("pending")
  const [notes, setNotes] = useState<AdminResourceNote[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes

    return notes.filter((note) => {
      return (
        note.subject.toLowerCase().includes(q) ||
        note.title.toLowerCase().includes(q) ||
        note.contributor_name.toLowerCase().includes(q) ||
        note.notes_content_label.toLowerCase().includes(q)
      )
    })
  }, [notes, query])

  const loadNotes = async (nextStatus: ReviewStatus) => {
    setLoading(true)
    setStatusMessage("")

    try {
      const res = await fetch(`/api/admin/resources-notes?status=${nextStatus}`, { cache: "no-store" })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load notes")
      }

      setNotes(Array.isArray(data.notes) ? data.notes : [])
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load notes")
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadNotes(status)
  }, [status])

  const updateStatus = async (id: string, nextStatus: "approved" | "rejected") => {
    setUpdatingId(id)
    setStatusMessage("")

    try {
      const res = await fetch(`/api/admin/resources-notes/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status")
      }

      setStatusMessage(nextStatus === "approved" ? "Note approved" : "Note rejected")
      setNotes((current) => current.filter((n) => n.id !== id))
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteNote = async (id: string) => {
    const confirmed = window.confirm("Delete this note permanently?")
    if (!confirmed) {
      return
    }

    setUpdatingId(id)
    setStatusMessage("")

    try {
      const res = await fetch(`/api/admin/resources-notes/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete note")
      }

      setStatusMessage("Note deleted")
      setNotes((current) => current.filter((n) => n.id !== id))
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to delete note")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Resources notes" description="Approve or reject note submissions before they appear on the Resources page." />

      {statusMessage && <Notice>{statusMessage}</Notice>}

      <div>
        <Tabs
          tabs={[
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
          ]}
          value={status}
          onChange={setStatus}
        />
        <div className="mt-5">
          <SearchBox value={query} onChange={setQuery} placeholder="Search submissions" className="max-w-sm" />
        </div>
      </div>

      {loading ? (
        <SkRows rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No submissions" hint={`Nothing is ${status} right now.`} />
      ) : (
        <ul className="space-y-3">
          {filtered.map((note) => (
            <li key={note.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="capitalize">{note.degree}</Tag>
                    <Tag className="capitalize">{note.level}</Tag>
                    <Tag tone="primary">Weeks {note.notes_week_from}–{note.notes_week_to}</Tag>
                  </div>
                  <h2 className="mt-2.5 text-[15px] font-bold leading-snug">{note.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{note.subject}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar name={note.contributor_name} size={20} />
                    <span className="font-medium">{note.contributor_name}</span>
                    <span>·</span>
                    <span>{formatDate(note.created_at)}</span>
                  </p>
                  {note.notes_content_label && <p className="mt-3 text-sm">{note.notes_content_label}</p>}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <a href={note.drive_link} target="_blank" rel="noopener noreferrer" className={`${btnGhost} h-9 px-3 text-xs`}>
                    <ExternalLink className="size-3.5" /> Open in Drive
                  </a>
                  {status === "pending" && (
                    <>
                      <button type="button" disabled={updatingId === note.id} onClick={() => void updateStatus(note.id, "approved")} className={`${btnPrimary} h-9 px-3 text-xs`}>
                        <CheckCircle2 className="size-3.5" /> Approve
                      </button>
                      <button type="button" disabled={updatingId === note.id} onClick={() => void updateStatus(note.id, "rejected")} className={`${btnGhost} h-9 px-3 text-xs`}>
                        <XCircle className="size-3.5" /> Reject
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={updatingId === note.id}
                    onClick={() => void deleteNote(note.id)}
                    aria-label="Delete"
                    title="Delete"
                    className="grid size-9 place-items-center rounded-xl border text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
