"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"
import { Loading } from "@/components/loading"
import { Dropdown } from "@/components/resources/dropdown"
import { subjectsFor } from "@/lib/resources-subjects"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Download, Loader2, Plus, Search, Star } from "lucide-react"

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

export default function ResourcesPage() {
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
    return (
      <>
        <h1 className="sr-only">IITM BS Notes and Study Resources</h1>
        <p className="sr-only">Community-driven notes linked by subject. Browse approved links or submit your own notes for approval.</p>
        <Loading />
      </>
    )
  }

  const selectCls = "h-11 w-full rounded-full border border-black/10 bg-white px-4 text-sm font-bold text-black outline-none focus:border-[#0a192f] disabled:opacity-60"

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 px-4 pb-16 pt-6">
        <div className="mx-auto w-full max-w-7xl space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-black md:text-5xl">Notes by <span className="text-[#0a192f]">students</span></h1>
              <p className="mt-2 max-w-xl text-sm font-medium text-black/60 md:text-base">Free IITM BS notes, sorted by level and subject. Pick yours, then download.</p>
            </div>
            <button
              onClick={handleOpenAddNotes}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0a192f] px-6 text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#112a52] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> Add notes
            </button>
          </div>

          <div className="grid gap-3 rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1.2fr]">
            <label className="block">
              <span className="mb-1.5 block px-2 text-xs font-bold text-black/50">Degree</span>
              <Dropdown variant="public" value={selectedDegree} onChange={(v) => setSelectedDegree(v as DegreeValue)} options={degreeValues.map((d) => ({ value: d, label: degreeLabels[d] }))} />
            </label>
            <label className="block">
              <span className="mb-1.5 block px-2 text-xs font-bold text-black/50">Level</span>
              <Dropdown variant="public" value={selectedLevel} onChange={(v) => setSelectedLevel(v as LevelValue)} options={(Object.keys(levelLabels) as LevelValue[]).map((l) => ({ value: l, label: levelLabels[l] }))} />
            </label>
            <label className="block">
              <span className="mb-1.5 block px-2 text-xs font-bold text-black/50">Subject</span>
              <Dropdown variant="public" value={selectedSubject} onChange={(v) => setSelectedSubject(v)} options={subjectsForSelection.map((s) => ({ value: s, label: s }))} disabled={subjectsForSelection.length === 0} />
            </label>
            <div>
              <span className="mb-1.5 block px-2 text-xs font-bold text-black/50">Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name or weeks"
                  className="h-11 w-full rounded-full border border-black/10 bg-white pl-10 pr-4 text-sm font-medium text-black outline-none placeholder:text-black/40 focus:border-[#0a192f]"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-3.5">
                <h2 className="text-sm font-black text-black">{selectedSubject || "Notes"}</h2>
                <p className="text-xs font-bold text-black/50">{notesLoading ? "Loading" : `${filteredNotes.length} ${filteredNotes.length === 1 ? "note" : "notes"}`}</p>
              </div>
              <div className="h-[calc(100vh-22rem)] min-h-[24rem] overflow-y-auto bg-[#FDFBF7] p-4">
                {notesLoading && (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-black/60" />
                  </div>
                )}
                {!notesLoading && notesError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{notesError}</p>}
                {!notesLoading && !notesError && filteredNotes.length === 0 && (
                  <p className="px-5 py-16 text-center text-sm font-bold text-black/50">No notes for this subject yet. Add yours and help the next student.</p>
                )}
                {!notesLoading && !notesError && filteredNotes.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredNotes.map((note) => (
                      <article key={note.id} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between gap-3">
                          <p className="flex min-w-0 items-center gap-2 text-sm font-black text-black">
                            {note.contributor_avatar ? (
                              <img src={note.contributor_avatar} alt="" className="h-6 w-6 shrink-0 rounded-full bg-black/5 object-cover" />
                            ) : (
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#FDFBF7] text-[10px] font-black">{getInitials(note.contributor_name)}</span>
                            )}
                            <span className="truncate">{note.contributor_name}</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => void handleToggleStar(note.id)}
                            disabled={starringNoteId === note.id}
                            aria-label="Star these notes"
                            className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-bold transition-colors disabled:opacity-50 ${note.user_starred ? "bg-[#f59e0b] text-black" : "bg-black/5 text-black/60 hover:bg-black/10"}`}
                          >
                            <Star className={`h-3.5 w-3.5 ${note.user_starred ? "fill-current" : ""}`} />
                            {note.stars}
                          </button>
                        </div>
                        <div className="rounded-xl bg-[#FDFBF7] px-3 py-2.5">
                          <p className="text-[11px] font-bold text-black/50">Covers</p>
                          <p className="text-sm font-black text-black">{note.notes_content_label.replace(/(\d+)\s*-\s*\1\b/, "$1").replace(/(\d)\s*-\s*(\d)/, "$1–$2")}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3">
                          <p className="inline-flex items-center gap-1.5 text-xs font-bold tabular-nums text-black/50">
                            <Download className="h-3.5 w-3.5" /> {(note.downloads ?? 0).toLocaleString("en-IN")}
                          </p>
                          <a
                            href={note.drive_link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => handleDownload(note)}
                            className="inline-flex h-9 items-center rounded-full bg-[#0a192f] px-5 text-sm font-bold text-white transition-colors hover:bg-[#112a52]"
                          >
                            Download
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="flex h-fit flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm lg:h-[calc(100vh-18.5rem)] lg:min-h-[28rem]">
              <div className="flex items-center justify-between gap-2 border-b border-black/10 px-5 py-3.5">
                <h2 className="text-sm font-black text-black">Top contributors</h2>
                <button type="button" onClick={() => setShowXpGuide(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-black/50 hover:text-black">
                  <CircleHelp className="h-3.5 w-3.5" /> How XP works
                </button>
              </div>

              {contributorsLoading && <div className="m-5 h-24 animate-pulse rounded-2xl bg-black/5" />}
              {!contributorsLoading && contributorsError && <p className="m-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{contributorsError}</p>}
              {!contributorsLoading && !contributorsError && contributors.length === 0 && <p className="px-5 py-8 text-center text-sm font-bold text-black/50">No contributors here yet.</p>}

              {!contributorsLoading && !contributorsError && contributors.length > 0 && (
                <ol className="max-h-[30rem] min-h-0 flex-1 divide-y divide-black/5 overflow-y-auto lg:max-h-none">
                  {contributors.map((c) => (
                    <li key={`${c.userId}-${c.rank}`} className="flex items-center gap-3 px-5 py-2.5">
                      <span className={`w-5 text-sm tabular-nums ${c.rank <= 3 ? "font-black text-[#0a192f]" : "font-bold text-black/40"}`}>{c.rank}</span>
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full bg-black/5 object-cover" />
                      ) : (
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FDFBF7] text-xs font-black text-black">{getInitials(c.name)}</span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-black">{c.name}</span>
                        <span className="block text-xs font-medium text-black/50">{c.notesCount} {c.notesCount === 1 ? "note" : "notes"}</span>
                      </span>
                      <span className="text-sm font-black tabular-nums text-black">{c.xp.toLocaleString("en-IN")}<span className="ml-0.5 text-xs font-bold text-black/40"> XP</span></span>
                    </li>
                  ))}
                </ol>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="max-w-md border border-black/10 bg-white text-black p-0 overflow-hidden shadow-xl rounded-2xl">
          <DialogHeader className="p-6 border-b-2 border-black bg-[#FDFBF7]">
            <DialogTitle className="text-xl font-black text-black uppercase tracking-widest">SIGN IN REQUIRED</DialogTitle>
            <DialogDescription className="text-black/70 font-bold text-sm uppercase mt-2">
              Please sign in first to add notes. After sign in, you can submit your Google Drive note link for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 flex justify-end">
            <Button onClick={openSignInModal} className="bg-black text-white hover:bg-black/90 transition-all rounded-2xl text-sm font-black uppercase tracking-widest shadow-md border border-black/10 h-12 px-8">
              SIGN IN
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showXpGuide} onOpenChange={setShowXpGuide}>
        <DialogContent className="max-w-md border border-black/10 bg-white text-black p-0 overflow-hidden shadow-xl rounded-2xl">
          <DialogHeader className="p-6 border-b-2 border-black bg-[#FDFBF7]">
            <DialogTitle className="text-xl font-black text-black uppercase tracking-widest">HOW TO EARN XP</DialogTitle>
            <DialogDescription className="text-black/70 font-bold text-sm uppercase mt-2">
              Contributors are ranked by stars first, then notes count.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4 text-sm font-black text-black uppercase tracking-widest">
            <div className="flex items-start gap-3 border border-black/10 rounded-xl p-3 shadow-sm">
              <span className="bg-black text-white rounded-full px-2.5 py-0.5">1</span>
              <p>EVERY APPROVED NOTE GIVES <span className="text-[#1e3a8a]">10 XP</span></p>
            </div>
            <div className="flex items-start gap-3 border border-black/10 rounded-xl p-3 shadow-sm">
              <span className="bg-black text-white rounded-full px-2.5 py-0.5">2</span>
              <p>EVERY STAR ON YOUR NOTES GIVES <span className="text-[#1e3a8a]">2 XP</span></p>
            </div>
            <div className="flex items-start gap-3 border border-black/10 rounded-xl p-3 shadow-sm">
              <span className="bg-black text-white rounded-full px-2.5 py-0.5">3</span>
              <p>UPLOAD 50+ APPROVED NOTES TO UNLOCK <span className="text-[#16a34a]">+500 BONUS XP</span></p>
            </div>
            <div className="flex items-start gap-3 border border-black/10 rounded-xl p-3 shadow-sm">
              <span className="bg-black text-white rounded-full px-2.5 py-0.5">4</span>
              <p>HIGHER STARS MEANS HIGHER CONTRIBUTOR RANK</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddNotesDialog}
        onOpenChange={(open) => {
          setShowAddNotesDialog(open)
          if (!open) {
            resetAddNotesForm()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-black/10 bg-white text-black sm:max-w-2xl p-0 shadow-xl rounded-2xl custom-scrollbar">
          <DialogHeader className="p-6 border-b-2 border-black bg-[#FDFBF7]">
            <DialogTitle className="text-2xl font-black text-black uppercase tracking-tight">UPLOAD YOUR NOTES</DialogTitle>
            <DialogDescription className="text-black/70 font-bold text-xs uppercase tracking-widest mt-2">
              STEP {addStep} OF 3
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitNote} className="space-y-8 p-6">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`border border-black/10 px-3 py-2.5 text-center text-xs font-black uppercase tracking-widest transition-all ${
                    addStep >= step ? "bg-black text-white shadow-sm" : "bg-white text-black/40 border-black/20"
                  }`}
                >
                  STEP {step}
                </div>
              ))}
            </div>

            {addStep === 1 && (
              <div className="space-y-6 border border-black/10 bg-white p-6 shadow-md">
                <div>
                  <Label className="mb-3 block text-xs font-black text-black uppercase tracking-widest">DEGREE</Label>
                  <Dropdown variant="public" value={selectedDegree} onChange={(v) => setSelectedDegree(v as DegreeValue)} options={degreeValues.map((d) => ({ value: d, label: degreeLabels[d] }))} />
                </div>

                <div>
                  <Label className="mb-3 block text-xs font-black text-black uppercase tracking-widest">LEVEL</Label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {(Object.keys(levelLabels) as LevelValue[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedLevel(level)}
                        className={`border border-black/10 rounded-2xl px-2 sm:px-3 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all truncate ${
                          selectedLevel === level
                            ? "bg-[#1e3a8a] text-white shadow-sm "
                            : "bg-white text-black hover:bg-black/5 shadow-md hover:shadow-sm"
                        }`}
                      >
                        {levelLabels[level]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block text-xs font-black text-black uppercase tracking-widest">SUBJECT</Label>
                  <Dropdown variant="public" value={selectedSubject} onChange={(v) => setSelectedSubject(v)} options={subjectsForSelection.map((s) => ({ value: s, label: s }))} disabled={subjectsForSelection.length === 0} />
                </div>
              </div>
            )}

            {addStep === 2 && (
              <div className="space-y-5 rounded-2xl border border-black/10 bg-white p-5">
                <div>
                  <Label className="mb-2 block text-xs font-bold text-black/60">What do these notes cover?</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(kindLabels) as NoteKind[]).map((k) => (
                      <button key={k} type="button" onClick={() => setFormData((prev) => ({ ...prev, kind: k }))} className={`h-10 rounded-full border text-sm font-bold transition-colors ${formData.kind === k ? "border-[#0a192f] bg-[#0a192f] text-white" : "border-black/10 bg-white text-black hover:border-black/30"}`}>
                        {kindLabels[k]}
                      </button>
                    ))}
                  </div>
                </div>
                {formData.kind === "weeks" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-2 block text-xs font-bold text-black/60">From week</Label>
                      <Input type="number" min={1} max={52} value={formData.notesWeekFrom} onChange={(e) => setFormData((prev) => ({ ...prev, notesWeekFrom: e.target.value }))} className="h-11 rounded-full border border-black/10 bg-white font-bold text-black" />
                    </div>
                    <div>
                      <Label className="mb-2 block text-xs font-bold text-black/60">To week (optional)</Label>
                      <Input type="number" min={1} max={52} value={formData.notesWeekTo} onChange={(e) => setFormData((prev) => ({ ...prev, notesWeekTo: e.target.value }))} placeholder="Same week" className="h-11 rounded-full border border-black/10 bg-white font-bold text-black" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="mb-2 block text-xs font-bold text-black/60">{formData.kind === "other" ? "Name these notes" : formData.kind === "book" ? "Book number (optional)" : "Note (optional)"}</Label>
                    <Input value={formData.label} maxLength={60} onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))} placeholder={formData.kind === "other" ? "e.g. Formula sheet" : formData.kind === "book" ? "e.g. 2" : "e.g. Quiz 1 summary"} className="h-11 rounded-full border border-black/10 bg-white font-bold text-black" />
                  </div>
                )}
                <div>
                  <Label className="mb-2 block text-xs font-bold text-black/60">Your name</Label>
                  <Input value={formData.anonymous ? "Anonymous" : formData.contributorName} disabled={formData.anonymous} onChange={(e) => setFormData((prev) => ({ ...prev, contributorName: e.target.value }))} placeholder="Enter your name" className="h-11 rounded-full border border-black/10 bg-white font-bold text-black" />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-black">
                  <input type="checkbox" checked={formData.anonymous} onChange={(e) => setFormData((prev) => ({ ...prev, anonymous: e.target.checked }))} className="h-4 w-4 accent-[#0a192f]" />
                  Post anonymously
                </label>
              </div>
            )}

            {addStep === 3 && (
              <div className="space-y-6 border border-black/10 bg-white p-6 shadow-md">
                <div>
                  <Label htmlFor="driveLink" className="mb-3 block text-xs font-black text-black uppercase tracking-widest">UPLOAD DRIVE LINK ({dynamicWeekLabel})</Label>
                  <Input
                    id="driveLink"
                    value={formData.driveLink}
                    onChange={(e) => setFormData((prev) => ({ ...prev, driveLink: e.target.value }))}
                    className="h-12 border border-black/10 bg-white text-black placeholder:text-black/40 rounded-2xl font-bold shadow-sm focus:ring-0 focus-visible:ring-0 focus:border-black"
                    placeholder="https://drive.google.com/..."
                  />
                </div>

                <div className="border border-black/10 bg-[#FDFBF7] px-4 py-3 text-xs font-black text-black uppercase tracking-widest shadow-sm">
                  SUBMIT FOR APPROVAL: ONLY APPROVED NOTES ARE SHOWN IN PUBLIC RESOURCES.
                </div>
              </div>
            )}

            {formError && (
              <div className="border border-black/10 bg-red-100 px-4 py-3 text-xs font-black text-red-700 uppercase tracking-widest shadow-sm">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="border border-black/10 bg-[#10b981] px-4 py-4 text-xs font-black text-white uppercase tracking-widest shadow-sm flex items-center">
                <CheckCircle2 className="mr-3 h-5 w-5" />
                {formSuccess}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={addStep === 1 || submitting || !!formSuccess}
                className="border border-black/10 bg-white text-black hover:bg-black hover:text-white rounded-2xl h-12 px-6 text-sm font-black uppercase tracking-widest shadow-md transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-md disabled:hover:bg-white disabled:hover:text-black"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                BACK
              </Button>

              {addStep < 3 ? (
                <Button type="button" onClick={handleNext} className="border border-black/10 bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90 rounded-2xl h-12 px-8 text-sm font-black uppercase tracking-widest shadow-md transition-all">
                  NEXT
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  {formSuccess ? (
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddNotesDialog(false)
                        resetAddNotesForm()
                      }}
                      className="border border-black/10 bg-black text-white hover:bg-black/90 rounded-2xl h-12 px-8 text-sm font-black uppercase tracking-widest shadow-md transition-all"
                    >
                      CLOSE
                    </Button>
                  ) : (
                    <Button type="submit" disabled={submitting} className="border border-black/10 bg-[#16a34a] text-white hover:bg-[#16a34a]/90 rounded-2xl h-12 px-8 text-sm font-black uppercase tracking-widest shadow-md transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-md">
                      {submitting ? "SUBMITTING..." : "SUBMIT"}
                    </Button>
                  )}
                </div>
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
