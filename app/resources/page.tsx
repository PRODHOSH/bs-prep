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
import { courseData } from "@/lib/gpa/course-data"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, ExternalLink, Loader2, Plus, Star } from "lucide-react"

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
    return <Loading />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <div className="border border-black/10 bg-white p-6 md:p-10 shadow-xl rounded-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight leading-none">RESOURCES NOTES</h1>
                <p className="max-w-2xl text-sm md:text-base font-bold text-black/70 uppercase tracking-wide">
                  Community-driven notes linked by subject from GPA tools. Browse approved links or submit your own notes for approval.
                </p>
              </div>

              <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
                <Input
                  placeholder="SEARCH NOTES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border border-black/10 bg-white text-black placeholder:text-black/40 focus:ring-0 focus-visible:ring-0 focus:border-black sm:w-72 rounded-2xl font-bold uppercase shadow-sm"
                />
                <Button
                  onClick={handleOpenAddNotes}
                  className="h-12 bg-black text-white hover:bg-black/90 transition-all rounded-2xl text-sm font-black uppercase tracking-widest shadow-md border border-black/10"
                  disabled={isLoading}
                >
                  <Plus className="mr-3 h-5 w-5" />
                  ADD NOTES
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 pt-8 border-t-2 border-black">
              <div>
                <Label className="mb-3 block text-xs font-black uppercase tracking-widest text-black/60">DEGREE</Label>
                <select
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value as DegreeValue)}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-black font-bold uppercase shadow-sm outline-none focus:ring-0"
                >
                  {degreeValues.map((degree) => (
                    <option key={degree} value={degree} className="bg-white text-black font-bold">
                      {degreeLabels[degree].toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-3 block text-xs font-black uppercase tracking-widest text-black/60">LEVEL</Label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(Object.keys(levelLabels) as LevelValue[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedLevel(level)}
                      className={`border border-black/10 rounded-2xl px-2 sm:px-3 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all truncate ${
                        selectedLevel === level
                          ? "bg-black text-white shadow-sm "
                          : "bg-white text-black hover:bg-black/5 shadow-md hover:shadow-sm"
                      }`}
                    >
                      {levelLabels[level]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)_300px]">
            <aside className="border border-black/10 bg-white p-4 shadow-md rounded-2xl h-fit">
              <h2 className="px-2 py-2 text-sm font-black text-black uppercase tracking-widest border-b-2 border-black mb-4">SUBJECTS</h2>
              <div className="space-y-2">
                {subjectsForSelection.length === 0 && (
                  <p className="px-2 py-3 text-xs font-bold text-black/60 uppercase">No subjects found for this selection.</p>
                )}

                {subjectsForSelection.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setSelectedSubject(subject)}
                    className={`flex w-full items-center justify-between border border-black/10 rounded-2xl px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider transition-all ${
                      selectedSubject === subject
                        ? "bg-[#1e3a8a] text-white shadow-sm "
                        : "bg-white text-black shadow-md hover:shadow-sm"
                    }`}
                  >
                    <span className="truncate">{subject}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                ))}
              </div>
            </aside>

            <section className="space-y-6">
              {notesLoading && (
                <div className="flex h-40 items-center justify-center border border-black/10 bg-white shadow-md">
                  <Loader2 className="h-8 w-8 animate-spin text-black" />
                </div>
              )}

              {!notesLoading && notesError && (
                <div className="border border-black/10 bg-red-100 px-5 py-4 text-sm font-black text-red-700 uppercase tracking-widest shadow-md">
                  {notesError}
                </div>
              )}

              {!notesLoading && !notesError && filteredNotes.length === 0 && (
                <div className="border border-black/10 bg-[#FDFBF7] px-5 py-12 text-center text-black shadow-md text-sm font-black uppercase tracking-widest">
                  NO APPROVED NOTES FOUND FOR THIS SUBJECT YET.
                </div>
              )}

              {!notesLoading && !notesError && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                  {filteredNotes.map((note) => (
                    <article
                      key={note.id}
                      className="border border-black/10 bg-white p-5 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
                          <p className="truncate text-xs font-black uppercase tracking-widest text-black/60">{note.contributor_name}</p>
                          <button
                            type="button"
                            onClick={() => void handleToggleStar(note.id)}
                            disabled={starringNoteId === note.id}
                            className={`inline-flex items-center gap-1.5 border border-black/10 px-2.5 py-1 text-xs font-black transition-all ${
                              note.user_starred
                                ? "bg-[#f59e0b] text-black shadow-sm"
                                : "bg-white text-black hover:bg-black/5 shadow-sm"
                            } disabled:opacity-50`}
                          >
                            <Star className={`h-3.5 w-3.5 ${note.user_starred ? "fill-current" : ""}`} />
                            {note.stars}
                          </button>
                        </div>
                        <h3 className="line-clamp-2 text-lg font-black text-black uppercase leading-tight">{note.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="inline-flex items-center border border-black/10 bg-[#FDFBF7] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                            {note.notes_content_label}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-black/60">
                            WEEKS {note.notes_week_from} - {note.notes_week_to}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t-2 border-black/10">
                        <a href={note.drive_link} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="h-10 w-full border border-black/10 bg-white text-black hover:bg-black hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            OPEN IN DRIVE
                          </Button>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <aside className="border border-black/10 bg-white p-5 shadow-md rounded-2xl h-fit">
              <div className="mb-6 flex items-center justify-between gap-2 border-b-2 border-black pb-4">
                <h2 className="text-sm font-black text-black uppercase tracking-widest">TOP CONTRIBUTORS</h2>
                <button
                  type="button"
                  onClick={() => setShowXpGuide(true)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-black text-black/70 hover:text-black uppercase tracking-widest transition-colors"
                >
                  <CircleHelp className="h-3.5 w-3.5" />
                  HOW TO EARN XP
                </button>
              </div>

              {contributorsLoading && (
                <div className="flex items-center gap-3 border border-black/10 bg-[#FDFBF7] px-4 py-3 text-xs font-black text-black uppercase tracking-widest">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  LOADING CONTRIBUTORS...
                </div>
              )}

              {!contributorsLoading && contributorsError && (
                <div className="border border-black/10 bg-red-100 px-4 py-3 text-xs font-black text-red-700 uppercase tracking-widest">
                  {contributorsError}
                </div>
              )}

              {!contributorsLoading && !contributorsError && contributors.length === 0 && (
                <p className="border border-black/10 bg-[#FDFBF7] px-4 py-4 text-xs font-black text-black/60 uppercase tracking-widest text-center">
                  NO CONTRIBUTORS YET FOR THIS SECTION.
                </p>
              )}

              {!contributorsLoading && !contributorsError && contributors.length > 0 && (
                <div className="max-h-115 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {contributors.map((contributor) => (
                    <div key={`${contributor.userId}-${contributor.rank}`} className="border border-black/10 bg-white p-4 shadow-sm rounded-2xl relative">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="absolute -top-3 -left-3 h-8 w-8 flex items-center justify-center border border-black/10 rounded-full bg-[#1e3a8a] text-white text-xs font-black shadow-sm">
                            #{contributor.rank}
                          </div>

                          {contributor.avatarUrl ? (
                            <img
                              src={contributor.avatarUrl}
                              alt={contributor.name}
                              className="h-10 w-10 shrink-0 border border-black/10 rounded-full object-cover bg-[#FDFBF7] ml-2"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/10 rounded-full bg-[#FDFBF7] text-sm font-black text-black ml-2 uppercase">
                              {getInitials(contributor.name)}
                            </div>
                          )}

                          <div className="min-w-0 ml-1">
                            <p className="line-clamp-1 text-sm font-black uppercase text-black">{contributor.name}</p>
                            <p className="mt-1 text-[10px] font-black text-black/60 uppercase tracking-widest">{contributor.notesCount} NOTES</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="inline-flex items-center gap-1.5 border border-black/10 rounded-full bg-[#f59e0b] px-3 py-1 text-[10px] font-black text-black shadow-sm">
                            <Star className="h-3 w-3 fill-current" />
                            <span>{contributor.stars}</span>
                          </div>
                          <span className="text-[10px] font-black text-black uppercase tracking-widest mt-1">{contributor.xp} XP</span>
                        </div>
                      </div>

                      {contributor.milestoneLabel && (
                        <div className="mt-3 pt-3 border-t-2 border-black/10">
                          <p className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest bg-green-100/50 border border-[#16a34a]/20 rounded-full px-3 py-1 inline-block">
                            +{contributor.bonus} {contributor.milestoneLabel}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  <select
                    value={selectedDegree}
                    onChange={(e) => setSelectedDegree(e.target.value as DegreeValue)}
                    className="h-12 w-full rounded-2xl border border-black/10 bg-white px-3 text-black font-bold uppercase shadow-sm outline-none focus:ring-0"
                  >
                    {degreeValues.map((degree) => (
                      <option key={degree} value={degree} className="bg-white text-black font-bold uppercase">
                        {degreeLabels[degree].toUpperCase()}
                      </option>
                    ))}
                  </select>
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
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-black/10 bg-white px-3 text-black font-bold uppercase shadow-sm outline-none focus:ring-0"
                  >
                    {subjectsForSelection.map((subject) => (
                      <option key={subject} value={subject} className="bg-white text-black font-bold uppercase">
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {addStep === 2 && (
              <div className="space-y-6 border border-black/10 bg-white p-6 shadow-md">
                <div>
                  <Label className="mb-3 block text-xs font-black text-black uppercase tracking-widest">NOTES WEEK (FROM → TO)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={formData.notesWeekFrom}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notesWeekFrom: e.target.value }))}
                      className="h-12 border border-black/10 bg-white text-black placeholder:text-black/40 rounded-2xl font-bold shadow-sm focus:ring-0 focus-visible:ring-0 focus:border-black uppercase"
                      placeholder="FROM"
                    />
                    <Input
                      type="number"
                      min={1}
                      max={52}
                      value={formData.notesWeekTo}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notesWeekTo: e.target.value }))}
                      className="h-12 border border-black/10 bg-white text-black placeholder:text-black/40 rounded-2xl font-bold shadow-sm focus:ring-0 focus-visible:ring-0 focus:border-black uppercase"
                      placeholder="TO"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="mb-3 block text-xs font-black text-black uppercase tracking-widest">YOUR NAME</Label>
                  <Input
                    id="name"
                    value={formData.contributorName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contributorName: e.target.value }))}
                    className="h-12 border border-black/10 bg-white text-black placeholder:text-black/40 rounded-2xl font-bold shadow-sm focus:ring-0 focus-visible:ring-0 focus:border-black uppercase"
                    placeholder="ENTER YOUR NAME"
                  />
                </div>
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
