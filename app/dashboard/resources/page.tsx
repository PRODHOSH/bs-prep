"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { ResourcesSkeleton, SkCards } from "@/components/dashboard/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Segmented, SearchBox } from "@/components/dashboard/controls"
import { Avatar, EmptyState, Field, Notice, PageHeader, Tag, btnGhost, btnPrimary, field } from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { Dropdown } from "@/components/resources/dropdown"
import { subjectsFor } from "@/lib/resources-subjects"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Download, Library, Plus, Star } from "lucide-react"

const LoginModal = dynamic(
  () => import("@/components/auth/login-modal").then((m) => ({ default: m.LoginModal })),
  { ssr: false }
)
const SignUpModal = dynamic(
  () => import("@/components/auth/signup-modal").then((m) => ({ default: m.SignUpModal })),
  { ssr: false }
)
const ForgotPasswordModal = dynamic(
  () => import("@/components/auth/forgot-password-modal").then((m) => ({ default: m.ForgotPasswordModal })),
  { ssr: false }
)

type LevelValue = "foundation" | "diploma" | "degree"
type DegreeValue = "data-science" | "electronic-systems"

type ResourceNote = {
  id: string
  degree: DegreeValue
  level: LevelValue
  subject: string
  notes_week_from: number
  notes_week_to: number
  title: string
  contributor_name: string
  notes_content_label: string
  drive_link: string
  downloads?: number
  contributor_avatar?: string | null
  created_at: string
  stars: number
  user_starred: boolean
}

type Contributor = {
  rank: number
  userId: string | null
  name: string
  avatarUrl: string | null
  notesCount: number
  stars: number
  xp: number
  bonus: number
  milestoneLabel: string | null
}

const levelLabels: Record<LevelValue, string> = {
  foundation: "Foundation",
  diploma: "Diploma",
  degree: "Degree",
}

const degreeLabels: Record<DegreeValue, string> = {
  "data-science": "Data Science",
  "electronic-systems": "Electronic Systems",
}

const degreeValues = Object.keys(degreeLabels) as DegreeValue[]

type NoteKind = "weeks" | "book" | "summary" | "other"
const kindLabels: Record<NoteKind, string> = { weeks: "Weeks", book: "Book", summary: "Summary", other: "Other" }

const initialForm = {
  kind: "weeks" as NoteKind,
  notesWeekFrom: "1",
  notesWeekTo: "",
  label: "",
  anonymous: false,
  contributorName: "",
  driveLink: "",
}

function getInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return "U"
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
}

export default function DashboardResourcesPage() {
  const supabase = useMemo(() => createClient(), [])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notes, setNotes] = useState<ResourceNote[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [starringNoteId, setStarringNoteId] = useState<string | null>(null)
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [contributorsLoading, setContributorsLoading] = useState(false)
  const [contributorsError, setContributorsError] = useState<string | null>(null)
  const [showXpGuide, setShowXpGuide] = useState(false)

  const [selectedDegree, setSelectedDegree] = useState<DegreeValue>("data-science")
  const [selectedLevel, setSelectedLevel] = useState<LevelValue>("foundation")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [shouldOpenAfterSignIn, setShouldOpenAfterSignIn] = useState(false)
  const [showAddNotesDialog, setShowAddNotesDialog] = useState(false)
  const [addStep, setAddStep] = useState(1)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(initialForm)

  const [loginOpen, setLoginOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

  const subjectsForSelection = useMemo(() => subjectsFor(selectedDegree, selectedLevel), [selectedDegree, selectedLevel])

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return notes
      .filter((note) => {
        if (selectedSubject && note.subject !== selectedSubject) {
          return false
        }

        if (!query) {
          return true
        }

        return (
          note.title.toLowerCase().includes(query) ||
          note.contributor_name.toLowerCase().includes(query) ||
          note.notes_content_label.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        if ((b.downloads ?? 0) !== (a.downloads ?? 0)) {
          return (b.downloads ?? 0) - (a.downloads ?? 0)
        }

        if (b.stars !== a.stars) {
          return b.stars - a.stars
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [notes, selectedSubject, searchQuery])

  const currentWeekFrom = Number(formData.notesWeekFrom)
  const currentWeekTo = Number(formData.notesWeekTo)
  const hasValidWeekRange = Number.isInteger(currentWeekFrom) && currentWeekFrom > 0 && (formData.notesWeekTo.trim() === "" || currentWeekTo >= currentWeekFrom)
  const dynamicWeekLabel = formData.kind !== "weeks" ? (formData.kind === "other" ? formData.label || "These notes" : kindLabels[formData.kind]) : hasValidWeekRange ? `Weeks ${currentWeekFrom}-${currentWeekTo || currentWeekFrom}` : "Selected weeks"

  const loadContributors = useCallback(async (showLoader: boolean) => {
    if (showLoader) {
      setContributorsLoading(true)
    }
    setContributorsError(null)

    try {
      const params = new URLSearchParams({
        degree: selectedDegree,
        level: selectedLevel,
      })

      const response = await fetch(`/api/resources/contributors?${params.toString()}`)
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load contributors")
      }

      setContributors(
        (Array.isArray(payload.contributors) ? (payload.contributors as Contributor[]) : [])
          .sort((a, b) => b.xp - a.xp)
          .map((c, i) => ({ ...c, rank: i + 1 })),
      )
    } catch (error: unknown) {
      setContributorsError(error instanceof Error ? error.message : "Failed to load contributors")
      setContributors([])
    } finally {
      if (showLoader) {
        setContributorsLoading(false)
      }
    }
  }, [selectedDegree, selectedLevel])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    let isMounted = true

    const hydrateAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!isMounted) {
        return
      }

      const loggedIn = !!session
      setIsAuthenticated(loggedIn)
      setIsLoading(false)

      if (loggedIn && shouldOpenAfterSignIn) {
        setShowAuthPrompt(false)
        setShowAddNotesDialog(true)
        setShouldOpenAfterSignIn(false)
      }
    }

    hydrateAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedIn = !!session
      setIsAuthenticated(loggedIn)

      if (loggedIn && shouldOpenAfterSignIn) {
        setShowAuthPrompt(false)
        setShowAddNotesDialog(true)
        setShouldOpenAfterSignIn(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, shouldOpenAfterSignIn])

  useEffect(() => {
    if (!subjectsForSelection.length) {
      setSelectedSubject("")
      return
    }

    if (!subjectsForSelection.includes(selectedSubject)) {
      setSelectedSubject(subjectsForSelection[0])
    }
  }, [subjectsForSelection, selectedSubject])

  useEffect(() => {
    if (!selectedSubject) {
      setNotes([])
      return
    }

    const loadNotes = async () => {
      setNotesLoading(true)
      setNotesError(null)

      try {
        const params = new URLSearchParams({
          degree: selectedDegree,
          level: selectedLevel,
          subject: selectedSubject,
        })

        const response = await fetch(`/api/resources/notes?${params.toString()}`)
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load notes")
        }

        setNotes(Array.isArray(payload.notes) ? payload.notes : [])
      } catch (error: unknown) {
        setNotesError(error instanceof Error ? error.message : "Failed to load notes")
      } finally {
        setNotesLoading(false)
      }
    }

    loadNotes()
  }, [selectedDegree, selectedLevel, selectedSubject])

  useEffect(() => {
    loadContributors(true)
  }, [loadContributors])

  // Start the name field with the signed-in name.
  useEffect(() => {
    if (!showAddNotesDialog || formData.contributorName) return
    supabase.auth.getUser().then(({ data }) => {
      const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>
      const name = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : ""
      if (name) setFormData((prev) => (prev.contributorName ? prev : { ...prev, contributorName: name }))
    })
  }, [showAddNotesDialog, formData.contributorName, supabase])

  const resetAddNotesForm = () => {
    setFormData(initialForm)
    setAddStep(1)
    setFormError(null)
    setFormSuccess(null)
  }

  const handleOpenAddNotes = () => {
    if (!isAuthenticated) {
      setShouldOpenAfterSignIn(true)
      setShowAuthPrompt(true)
      return
    }

    setShowAddNotesDialog(true)
  }

  const openSignInModal = () => {
    setShowAuthPrompt(false)
    setLoginOpen(true)
  }

  const validateStep = () => {
    if (addStep === 1) {
      if (!selectedDegree || !selectedLevel || !selectedSubject) {
        setFormError("Please select degree, level, and subject.")
        return false
      }
    }

    if (addStep === 2) {
      const start = Number(formData.notesWeekFrom)
      const end = formData.notesWeekTo.trim() === "" ? start : Number(formData.notesWeekTo)

      if (formData.kind === "weeks" && (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > 52)) {
        setFormError("Enter a week, or a range where the second week is not before the first.")
        return false
      }

      if (formData.kind === "other" && !formData.label.trim()) {
        setFormError("Tell us what these notes cover.")
        return false
      }

      if (!formData.anonymous && !formData.contributorName.trim()) {
        setFormError("Enter your name, or choose to post anonymously.")
        return false
      }
    }

    if (addStep === 3) {
      if (!formData.driveLink.trim()) {
        setFormError("Please add Drive link.")
        return false
      }
    }

    setFormError(null)
    return true
  }

  const handleNext = () => {
    if (!validateStep()) {
      return
    }

    setAddStep((step) => Math.min(step + 1, 3))
  }

  const handleBack = () => {
    setFormError(null)
    setAddStep((step) => Math.max(step - 1, 1))
  }

  const handleDownload = (note: ResourceNote) => {
    setNotes((current) => current.map((n) => (n.id === note.id ? { ...n, downloads: (n.downloads ?? 0) + 1 } : n)))
    fetch(`/api/resources/notes/${note.id}/download`, { method: "POST", keepalive: true }).catch(() => {})
  }

  const handleToggleStar = async (noteId: string) => {
    if (!isAuthenticated) {
      setShouldOpenAfterSignIn(false)
      setShowAuthPrompt(true)
      return
    }

    setStarringNoteId(noteId)

    try {
      const response = await fetch(`/api/resources/notes/${noteId}/star`, {
        method: "POST",
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update star")
      }

      const nextStarred = Boolean(payload.starred)
      const nextStars = Number(payload.stars) || 0

      setNotes((current) =>
        current.map((note) =>
          note.id === noteId
            ? {
                ...note,
                user_starred: nextStarred,
                stars: nextStars,
              }
            : note
        )
      )

      void loadContributors(false)
    } catch (error: unknown) {
      setNotesError(error instanceof Error ? error.message : "Failed to update star")
    } finally {
      setStarringNoteId(null)
    }
  }

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep()) {
      return
    }

    setSubmitting(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const response = await fetch("/api/resources/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degree: selectedDegree,
          level: selectedLevel,
          subject: selectedSubject,
          notesWeekFrom: Number(formData.notesWeekFrom),
          notesWeekTo: formData.notesWeekTo.trim() === "" ? Number(formData.notesWeekFrom) : Number(formData.notesWeekTo),
          kind: formData.kind,
          label: formData.label,
          contributorName: formData.anonymous ? "Anonymous" : formData.contributorName,
          driveLink: formData.driveLink,
        }),
      })

      const payload = await response.json()

      if (response.status === 401) {
        setShowAddNotesDialog(false)
        setShouldOpenAfterSignIn(true)
        setShowAuthPrompt(true)
        return
      }

      if (!response.ok) {
        throw new Error(payload.error || "Failed to submit notes")
      }

      setFormSuccess("Submitted successfully. Your note is pending admin approval.")
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : "Failed to submit notes")
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasMounted) {
    return <ResourcesSkeleton />
  }

  const dialogCls = "max-h-[90vh] overflow-y-auto rounded-2xl border bg-card p-0 text-foreground sm:max-w-md"
  const dialogHead = "border-b bg-muted/40 p-5 text-left"

  return (
    <div className="space-y-5">
      <div id="tour-resources">
        <PageHeader
          title="Resources"
          description="Notes shared by students. Pick a level and subject, then download."
          actions={
            <button onClick={handleOpenAddNotes} disabled={isLoading} className={btnPrimary}>
              <Plus className="size-4" /> Add notes
            </button>
          }
        />
      </div>

      <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1.2fr]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Degree</span>
          <Dropdown variant="dashboard" value={selectedDegree} onChange={(v) => setSelectedDegree(v as DegreeValue)} options={degreeValues.map((d) => ({ value: d, label: degreeLabels[d] }))} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Level</span>
          <Dropdown variant="dashboard" value={selectedLevel} onChange={(v) => setSelectedLevel(v as LevelValue)} options={(Object.keys(levelLabels) as LevelValue[]).map((l) => ({ value: l, label: levelLabels[l] }))} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Subject</span>
          <Dropdown variant="dashboard" value={selectedSubject} onChange={(v) => setSelectedSubject(v)} options={subjectsForSelection.map((s) => ({ value: s, label: s }))} disabled={subjectsForSelection.length === 0} />
        </label>
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Search</span>
          <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Name or weeks" className="w-full" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-sm font-bold">{selectedSubject || "Notes"}</h2>
            <p className="text-xs text-muted-foreground">{notesLoading ? "Loading" : `${filteredNotes.length} ${filteredNotes.length === 1 ? "note" : "notes"}`}</p>
          </div>
          <div className="h-[calc(100vh-24rem)] min-h-[22rem] overflow-y-auto p-4">
            {notesLoading && <SkCards count={6} image={false} cols="sm:grid-cols-2 2xl:grid-cols-3" />}
            {!notesLoading && notesError && <Notice tone="error">{notesError}</Notice>}
            {!notesLoading && !notesError && filteredNotes.length === 0 && (
              <EmptyState icon={Library} title="No notes yet" hint="Nobody has shared notes for this subject. Be the first to add some." />
            )}
            {!notesLoading && !notesError && filteredNotes.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredNotes.map((note) => (
                  <li key={note.id} className="flex flex-col gap-3 rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                        <Avatar name={note.contributor_name} src={note.contributor_avatar} size={26} />
                        <span className="truncate">{note.contributor_name}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleToggleStar(note.id)}
                        disabled={starringNoteId === note.id}
                        aria-pressed={note.user_starred}
                        aria-label="Star these notes"
                        className={cn("inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition-colors disabled:opacity-50", note.user_starred ? "bg-chart-2/15 text-chart-2" : "text-muted-foreground hover:bg-muted")}
                      >
                        <Star className={cn("size-3.5", note.user_starred && "fill-current")} /> {note.stars}
                      </button>
                    </div>
                    <div className="rounded-lg bg-muted/60 px-3 py-2">
                      <p className="text-[11px] font-medium text-muted-foreground">Covers</p>
                      <p className="text-sm font-bold">{note.notes_content_label.replace(/(\d+)\s*-\s*\1\b/, "$1").replace(/(\d)\s*-\s*(\d)/, "$1–$2")}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
                        <Download className="size-3.5" /> {(note.downloads ?? 0).toLocaleString("en-IN")}
                      </p>
                      <a href={note.drive_link} target="_blank" rel="noreferrer" onClick={() => handleDownload(note)} className={cn(btnPrimary, "h-9 px-4")}>
                        Download
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="flex h-fit flex-col overflow-hidden rounded-2xl border bg-card xl:h-[calc(100vh-24rem)] xl:min-h-[26rem]">
          <div className="flex items-center justify-between gap-2 border-b px-5 py-3">
            <h2 className="text-sm font-bold">Top contributors</h2>
            <button type="button" onClick={() => setShowXpGuide(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <CircleHelp className="size-3.5" /> How XP works
            </button>
          </div>
          {contributorsLoading && <div className="m-5 h-24 animate-pulse rounded-xl bg-muted" />}
          {!contributorsLoading && contributorsError && <div className="p-5"><Notice tone="error">{contributorsError}</Notice></div>}
          {!contributorsLoading && !contributorsError && contributors.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No contributors here yet.</p>
          )}
          {!contributorsLoading && !contributorsError && contributors.length > 0 && (
            <ol className="max-h-[30rem] min-h-0 flex-1 divide-y overflow-y-auto xl:max-h-none">
              {contributors.map((c) => (
                <li key={`${c.userId}-${c.rank}`} className="flex items-center gap-3 px-5 py-2.5">
                  <span className={cn("w-5 text-sm tabular-nums", c.rank <= 3 ? "font-extrabold" : "font-medium text-muted-foreground")}>{c.rank}</span>
                  <Avatar name={c.name} src={c.avatarUrl} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">{c.notesCount} {c.notesCount === 1 ? "note" : "notes"}</span>
                  </span>
                  <span className="text-sm font-bold tabular-nums">{c.xp.toLocaleString("en-IN")}<span className="ml-0.5 text-xs font-medium text-muted-foreground"> XP</span></span>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className={dialogCls}>
          <DialogHeader className={dialogHead}>
            <DialogTitle className="text-lg font-bold">Sign in required</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Sign in first to add notes. Afterwards you can submit your Google Drive link for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end p-5">
            <button onClick={openSignInModal} className={btnPrimary}>Sign in</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showXpGuide} onOpenChange={setShowXpGuide}>
        <DialogContent className={dialogCls}>
          <DialogHeader className={dialogHead}>
            <DialogTitle className="text-lg font-bold">How to earn XP</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Contributors are ranked by stars first, then notes count.</DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 p-5 text-sm font-medium">
            {[
              <>Every approved note gives <span className="font-bold text-primary">10 XP</span></>,
              <>Every star on your notes gives <span className="font-bold text-primary">2 XP</span></>,
              <>Upload 50+ approved notes to unlock <span className="font-bold text-chart-4">+500 bonus XP</span></>,
              <>More stars means a higher contributor rank</>,
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                <p className="pt-0.5">{line}</p>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddNotesDialog}
        onOpenChange={(open) => {
          setShowAddNotesDialog(open)
          if (!open) resetAddNotesForm()
        }}
      >
        <DialogContent className={cn(dialogCls, "sm:max-w-xl")}>
          <DialogHeader className={dialogHead}>
            <DialogTitle className="text-lg font-bold">Upload your notes</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Step {addStep} of 3</DialogDescription>
          </DialogHeader>

          <form onSubmit={submitNote} className="space-y-5 p-5">
            <div className="flex gap-1.5" aria-hidden>
              {[1, 2, 3].map((step) => (
                <span key={step} className={cn("h-1.5 flex-1 rounded-full transition-colors", addStep >= step ? "bg-primary" : "bg-muted")} />
              ))}
            </div>

            {addStep === 1 && (
              <div className="space-y-4">
                <Field label="Degree">
                  <Dropdown variant="dashboard" value={selectedDegree} onChange={(v) => setSelectedDegree(v as DegreeValue)} options={degreeValues.map((d) => ({ value: d, label: degreeLabels[d] }))} />
                </Field>
                <Field label="Level">
                  <Segmented
                    options={(Object.keys(levelLabels) as LevelValue[]).map((l) => ({ id: l, label: levelLabels[l] }))}
                    value={selectedLevel}
                    onChange={setSelectedLevel}
                    className="w-full [&_button]:flex-1"
                  />
                </Field>
                <Field label="Subject">
                  <Dropdown variant="dashboard" value={selectedSubject} onChange={(v) => setSelectedSubject(v)} options={subjectsForSelection.map((s) => ({ value: s, label: s }))} disabled={subjectsForSelection.length === 0} />
                </Field>
              </div>
            )}

            {addStep === 2 && (
              <div className="space-y-4">
                <Field label="What do these notes cover?">
                  <Segmented
                    options={(Object.keys(kindLabels) as NoteKind[]).map((k) => ({ id: k, label: kindLabels[k] }))}
                    value={formData.kind}
                    onChange={(k) => setFormData((prev) => ({ ...prev, kind: k }))}
                    className="w-full [&_button]:flex-1"
                  />
                </Field>
                {formData.kind === "weeks" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="From week">
                      <input type="number" min={1} max={52} value={formData.notesWeekFrom} onChange={(e) => setFormData((prev) => ({ ...prev, notesWeekFrom: e.target.value }))} className={field} />
                    </Field>
                    <Field label="To week (optional)">
                      <input type="number" min={1} max={52} value={formData.notesWeekTo} onChange={(e) => setFormData((prev) => ({ ...prev, notesWeekTo: e.target.value }))} className={field} placeholder="Same week" />
                    </Field>
                  </div>
                ) : (
                  <Field label={formData.kind === "other" ? "Name these notes" : formData.kind === "book" ? "Book number (optional)" : "Note (optional)"}>
                    <input value={formData.label} onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))} className={field} placeholder={formData.kind === "other" ? "e.g. Formula sheet" : formData.kind === "book" ? "e.g. 2" : "e.g. Quiz 1 summary"} maxLength={60} />
                  </Field>
                )}
                <Field label="Your name" htmlFor="name">
                  <input id="name" value={formData.anonymous ? "Anonymous" : formData.contributorName} disabled={formData.anonymous} onChange={(e) => setFormData((prev) => ({ ...prev, contributorName: e.target.value }))} className={field} placeholder="Enter your name" />
                </Field>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={formData.anonymous} onChange={(e) => setFormData((prev) => ({ ...prev, anonymous: e.target.checked }))} className="size-4 accent-primary" />
                  Post anonymously
                </label>
              </div>
            )}

            {addStep === 3 && (
              <div className="space-y-4">
                <Field label={`Drive link (${dynamicWeekLabel})`} htmlFor="driveLink">
                  <input id="driveLink" value={formData.driveLink} onChange={(e) => setFormData((prev) => ({ ...prev, driveLink: e.target.value }))} className={field} placeholder="https://drive.google.com/..." />
                </Field>
                <Notice>Only approved notes are shown publicly. Yours will be reviewed first.</Notice>
              </div>
            )}

            {formError && <Notice tone="error">{formError}</Notice>}
            {formSuccess && (
              <Notice tone="success" className="flex items-center gap-2">
                <CheckCircle2 className="size-4" /> {formSuccess}
              </Notice>
            )}

            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={handleBack} disabled={addStep === 1 || submitting || !!formSuccess} className={btnGhost}>
                <ArrowLeft className="size-4" /> Back
              </button>
              {addStep < 3 ? (
                <button type="button" onClick={handleNext} className={btnPrimary}>
                  Next <ArrowRight className="size-4" />
                </button>
              ) : formSuccess ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddNotesDialog(false)
                    resetAddNotesForm()
                  }}
                  className={btnPrimary}
                >
                  Close
                </button>
              ) : (
                <button type="submit" disabled={submitting} className={btnPrimary}>
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignUp={() => {
          setLoginOpen(false)
          setSignUpOpen(true)
        }}
        onSwitchToForgotPassword={() => {
          setLoginOpen(false)
          setForgotPasswordOpen(true)
        }}
      />
      <SignUpModal
        open={signUpOpen}
        onOpenChange={setSignUpOpen}
        onSwitchToLogin={() => {
          setSignUpOpen(false)
          setLoginOpen(true)
        }}
      />
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        onSwitchToLogin={() => {
          setForgotPasswordOpen(false)
          setLoginOpen(true)
        }}
      />
    </div>
  )
}
