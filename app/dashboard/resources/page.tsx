"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { ResourcesSkeleton, SkCards } from "@/components/dashboard/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Segmented, SearchBox } from "@/components/dashboard/controls"
import { Avatar, EmptyState, Field, Notice, PageHeader, Tag, btnGhost, btnPrimary, field } from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { courseData } from "@/lib/gpa/course-data"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, ExternalLink, Library, Plus, Star } from "lucide-react"

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

const initialForm = {
  notesWeekFrom: "1",
  notesWeekTo: "12",
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
  const [selectedLevel, setSelectedLevel] = useState<LevelValue>("diploma")
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

  const subjectsForSelection = useMemo(() => {
    const unique = new Set<string>()

    for (const course of courseData) {
      if (course.degree === selectedDegree && course.level === selectedLevel) {
        unique.add(course.name)
      }
    }

    return Array.from(unique)
  }, [selectedDegree, selectedLevel])

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
        if (b.stars !== a.stars) {
          return b.stars - a.stars
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [notes, selectedSubject, searchQuery])

  const currentWeekFrom = Number(formData.notesWeekFrom)
  const currentWeekTo = Number(formData.notesWeekTo)
  const hasValidWeekRange = Number.isInteger(currentWeekFrom) && Number.isInteger(currentWeekTo) && currentWeekFrom > 0 && currentWeekTo >= currentWeekFrom
  const dynamicWeekLabel = hasValidWeekRange ? `Weeks ${currentWeekFrom}-${currentWeekTo}` : "Selected weeks"

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

      setContributors(Array.isArray(payload.contributors) ? payload.contributors : [])
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
      const end = Number(formData.notesWeekTo)

      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > 52) {
        setFormError("Please enter a valid week range.")
        return false
      }

      if (!formData.contributorName.trim()) {
        setFormError("Please enter your name.")
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
          notesWeekTo: Number(formData.notesWeekTo),
          contributorName: formData.contributorName,
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
    <div className="space-y-6">
      <div id="tour-resources">
        <PageHeader
          title="Resources"
          description="Community notes organised by subject. Browse approved links or submit your own."
          actions={
            <>
              <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search notes" className="w-full sm:w-64" />
              <button onClick={handleOpenAddNotes} disabled={isLoading} className={btnPrimary}>
                <Plus className="size-4" /> Add notes
              </button>
            </>
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          options={degreeValues.map((d) => ({ id: d, label: degreeLabels[d] }))}
          value={selectedDegree}
          onChange={setSelectedDegree}
        />
        <Segmented
          options={(Object.keys(levelLabels) as LevelValue[]).map((l) => ({ id: l, label: levelLabels[l] }))}
          value={selectedLevel}
          onChange={setSelectedLevel}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_21rem]">
        <aside className="h-fit rounded-2xl border bg-card p-3">
          <h2 className="px-3 pb-2 pt-1 text-sm font-bold">Subjects</h2>
          {subjectsForSelection.length === 0 && <p className="px-3 py-3 text-xs text-muted-foreground">No subjects found for this selection.</p>}
          <ul className="space-y-0.5">
            {subjectsForSelection.map((subject) => (
              <li key={subject}>
                <button
                  type="button"
                  onClick={() => setSelectedSubject(subject)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    selectedSubject === subject ? "bg-accent font-semibold text-foreground" : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="truncate">{subject}</span>
                  <ArrowRight className="size-3.5 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="min-w-0">
          {notesLoading && (
            <SkCards count={4} image={false} cols="md:grid-cols-2" />
          )}
          {!notesLoading && notesError && <Notice tone="error">{notesError}</Notice>}
          {!notesLoading && !notesError && filteredNotes.length === 0 && (
            <EmptyState icon={Library} title="No approved notes yet" hint="Nothing has been approved for this subject. Be the first to add some." />
          )}
          {!notesLoading && !notesError && filteredNotes.length > 0 && (
            <ul className="grid gap-4 md:grid-cols-2">
              {filteredNotes.map((note) => (
                <li key={note.id} className="flex flex-col justify-between rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Avatar name={note.contributor_name} size={22} />
                        <span className="truncate">{note.contributor_name}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleToggleStar(note.id)}
                        disabled={starringNoteId === note.id}
                        aria-pressed={note.user_starred}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
                          note.user_starred ? "border-chart-2/30 bg-chart-2/15 text-chart-2" : "hover:bg-muted",
                        )}
                      >
                        <Star className={cn("size-3.5", note.user_starred && "fill-current")} /> {note.stars}
                      </button>
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-[15px] font-bold leading-snug">{note.title}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Tag>{note.notes_content_label}</Tag>
                      <Tag>Weeks {note.notes_week_from}–{note.notes_week_to}</Tag>
                    </div>
                  </div>
                  <a href={note.drive_link} target="_blank" rel="noreferrer" className={cn(btnGhost, "mt-5 h-9 w-full text-sm")}>
                    <ExternalLink className="size-4" /> Open in Drive
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="h-fit rounded-2xl border bg-card p-5 lg:col-span-2 xl:col-span-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold">Top contributors</h2>
            <button type="button" onClick={() => setShowXpGuide(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <CircleHelp className="size-3.5" /> How to earn XP
            </button>
          </div>

          {contributorsLoading && <div className="h-24 animate-pulse rounded-xl bg-muted" />}
          {!contributorsLoading && contributorsError && <Notice tone="error">{contributorsError}</Notice>}
          {!contributorsLoading && !contributorsError && contributors.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No contributors yet for this section.</p>
          )}
          {!contributorsLoading && !contributorsError && contributors.length > 0 && (
            <ol className="max-h-[28rem] divide-y overflow-y-auto">
              {contributors.map((c) => (
                <li key={`${c.userId}-${c.rank}`} className="py-3 first:pt-1">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-muted-foreground">#{c.rank}</span>
                    <Avatar name={c.name} src={c.avatarUrl} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{c.name}</span>
                      <span className="block text-xs text-muted-foreground">{c.notesCount} notes</span>
                    </span>
                    <span className="text-right">
                      <span className="flex items-center justify-end gap-1 text-sm font-bold"><Star className="size-3.5 fill-chart-2 text-chart-2" />{c.stars}</span>
                      <span className="block text-xs text-muted-foreground">{c.xp} XP</span>
                    </span>
                  </div>
                  {c.milestoneLabel && <Tag tone="green" className="mt-2 ml-9">+{c.bonus} {c.milestoneLabel}</Tag>}
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
                  <select value={selectedDegree} onChange={(e) => setSelectedDegree(e.target.value as DegreeValue)} className={field}>
                    {degreeValues.map((degree) => (
                      <option key={degree} value={degree}>{degreeLabels[degree]}</option>
                    ))}
                  </select>
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
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className={field}>
                    {subjectsForSelection.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {addStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Notes from week">
                    <input type="number" min={1} max={52} value={formData.notesWeekFrom} onChange={(e) => setFormData((prev) => ({ ...prev, notesWeekFrom: e.target.value }))} className={field} placeholder="From" />
                  </Field>
                  <Field label="To week">
                    <input type="number" min={1} max={52} value={formData.notesWeekTo} onChange={(e) => setFormData((prev) => ({ ...prev, notesWeekTo: e.target.value }))} className={field} placeholder="To" />
                  </Field>
                </div>
                <Field label="Your name" htmlFor="name">
                  <input id="name" value={formData.contributorName} onChange={(e) => setFormData((prev) => ({ ...prev, contributorName: e.target.value }))} className={field} placeholder="Enter your name" />
                </Field>
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
