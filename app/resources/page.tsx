"use client"

import { useEffect, useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ExternalLink, FileText, Loader2, UploadCloud } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const DEFAULT_LEVELS = ["foundation", "diploma", "degree", "other"]
const DEFAULT_RESOURCE_TYPES = ["course-material", "activity", "notes", "assignment", "other"]
const MAX_PDF_SIZE_BYTES = 45 * 1024 * 1024
const MAX_PDF_SIZE_MB = Math.floor(MAX_PDF_SIZE_BYTES / (1024 * 1024))

type ApprovedResource = {
  id: string
  title: string
  description: string
  level: string
  resource_type: string
  pdf_url: string
  created_at: string
  uploaded_by: string
  approved_by: string
  approved_at: string
  rating_count: number
  user_has_rated: boolean
}

type MySubmission = {
  id: string
  title: string
  pdf_url: string | null
  level: string
  resource_type: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  review_notes: string | null
}

export default function ResourcesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [viewMode, setViewMode] = useState<"my" | "all">("all")
  const [resources, setResources] = useState<ApprovedResource[]>([])
  const [mySubmissions, setMySubmissions] = useState<MySubmission[]>([])
  const [levels, setLevels] = useState<string[]>(DEFAULT_LEVELS)
  const [resourceTypes, setResourceTypes] = useState<string[]>(DEFAULT_RESOURCE_TYPES)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState("")
  const [loadWarning, setLoadWarning] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [ratingLoadingId, setRatingLoadingId] = useState<string | null>(null)
  const [ratingsEnabled, setRatingsEnabled] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState<"all" | "rated" | "unrated" | "popular">("all")
  const [minRatingsFilter, setMinRatingsFilter] = useState("0")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating-high" | "rating-low">("newest")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [level, setLevel] = useState("")
  const [resourceType, setResourceType] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const supabase = createClient()

  async function loadResources() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/resources", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        setLoadWarning(data.error || "Some resource data could not be loaded.")
        return
      }

      setResources(Array.isArray(data.resources) ? data.resources : [])
      setMySubmissions(Array.isArray(data.mySubmissions) ? data.mySubmissions : [])
      setLevels(Array.isArray(data.levels) && data.levels.length > 0 ? data.levels : DEFAULT_LEVELS)
      setResourceTypes(
        Array.isArray(data.resourceTypes) && data.resourceTypes.length > 0
          ? data.resourceTypes
          : DEFAULT_RESOURCE_TYPES,
      )
      setIsAuthenticated(Boolean(data.isAuthenticated))
      setRatingsEnabled(data.ratingsEnabled !== false)
      setLoadWarning(typeof data.warning === "string" ? data.warning : "")
    } catch {
      setLoadWarning("Some resource data could not be loaded. You can still use upload options.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const authenticated = Boolean(session)
      setIsAuthenticated(authenticated)

      if (authenticated) {
        await loadResources()
      } else {
        setResources([])
        setMySubmissions([])
        setRatingsEnabled(false)
        setIsLoading(false)
      }
    }
    void checkAuthAndLoad()
  }, [])

  useEffect(() => {
    if (!isAuthenticated && viewMode === "my") {
      setViewMode("all")
    }
  }, [isAuthenticated, viewMode])

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const minRatings = Number.parseInt(minRatingsFilter, 10) || 0

    const filtered = resources.filter((resource) => {
      const matchesQuery =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.uploaded_by.toLowerCase().includes(query)

      const matchesLevel = levelFilter === "all" || resource.level === levelFilter
      const matchesType = typeFilter === "all" || resource.resource_type === typeFilter
      const matchesMinRatings = resource.rating_count >= minRatings

      const matchesRatingMode =
        ratingFilter === "all" ||
        (ratingFilter === "rated" && resource.user_has_rated) ||
        (ratingFilter === "unrated" && !resource.user_has_rated) ||
        (ratingFilter === "popular" && resource.rating_count >= 3)

      return matchesQuery && matchesLevel && matchesType && matchesMinRatings && matchesRatingMode
    })

    return filtered.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === "rating-high") return b.rating_count - a.rating_count
      return a.rating_count - b.rating_count
    })
  }, [resources, searchQuery, levelFilter, typeFilter, ratingFilter, minRatingsFilter, sortBy])

  async function toggleRating(resourceId: string) {
    if (!isAuthenticated) {
      setStatus("Please sign in to rate resources.")
      return
    }

    if (!ratingsEnabled) {
      setStatus("Ratings are temporarily unavailable until admin finishes ratings setup.")
      return
    }

    setRatingLoadingId(resourceId)
    try {
      const res = await fetch("/api/resources/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      })

      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error || "Failed to update rating")
        return
      }

      setResources((prev) =>
        prev.map((item) =>
          item.id === resourceId
            ? {
                ...item,
                rating_count: data.ratingCount,
                user_has_rated: data.rated,
              }
            : item,
        ),
      )
    } catch {
      setStatus("Failed to update rating")
    } finally {
      setRatingLoadingId(null)
    }
  }

  async function submitResource() {
    if (!isAuthenticated) {
      setStatus("Please sign in to upload resources.")
      return
    }

    if (!title.trim() || !description.trim() || !level || !resourceType || !pdfFile) {
      setStatus("Please fill title, description, level, type and PDF file.")
      return
    }

    if (pdfFile.size > MAX_PDF_SIZE_BYTES) {
      setStatus(`PDF is too large. Please upload a file up to ${MAX_PDF_SIZE_MB} MB.`)
      return
    }

    setIsSubmitting(true)
    setStatus("")

    try {
      const form = new FormData()
      form.append("title", title.trim())
      form.append("description", description.trim())
      form.append("level", level)
      form.append("resourceType", resourceType)
      form.append("pdf", pdfFile)

      const res = await fetch("/api/resources", {
        method: "POST",
        body: form,
      })

      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error || "Failed to submit resource")
        return
      }

      setTitle("")
      setDescription("")
      setLevel("")
      setResourceType("")
      setPdfFile(null)
      setStatus("Resource uploaded. It is now pending admin approval.")
      setUploadOpen(false)
      await loadResources()
    } catch {
      setStatus("Failed to submit resource")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />
      
      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black">Learning Resources</h1>
            <p className="mt-3 text-base text-black/70">Approved PDF resources by course. Uploads are reviewed by admins first.</p>
          </header>

          {loadWarning ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">{loadWarning}</div>
          ) : null}

          {!isAuthenticated ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-8">
              <h2 className="text-2xl font-semibold text-black">Sign In Required</h2>
              <p className="mt-2 text-sm text-black/70">
                Resources are available only after signup/login. Please sign in and then open this page again.
              </p>
            </section>
          ) : (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-black">Upload A PDF Resource</h2>
                <p className="mt-1 text-sm text-black/70">Only PDFs are allowed. Submission status will be pending until admin approval.</p>
              </div>
              <button
                type="button"
                onClick={() => setUploadOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20 text-2xl leading-none text-black hover:bg-black/5"
                aria-label="Toggle upload form"
              >
                {uploadOpen ? "-" : "+"}
              </button>
            </div>

            {uploadOpen ? (
              <>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Resource title"
                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                  />

                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                  >
                    <option value="">Select level</option>
                    {levels.map((item) => (
                      <option key={item} value={item}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={resourceType}
                    onChange={(event) => setResourceType(event.target.value)}
                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                  >
                    <option value="">Select type</option>
                    {resourceTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe this PDF resource"
                    className="min-h-28 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black md:col-span-2"
                  />

                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0] ?? null
                      if (nextFile && nextFile.size > MAX_PDF_SIZE_BYTES) {
                        setStatus(`PDF is too large. Please upload a file up to ${MAX_PDF_SIZE_MB} MB.`)
                        setPdfFile(null)
                        return
                      }
                      setPdfFile(nextFile)
                    }}
                    className="h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm md:col-span-2"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button onClick={submitResource} disabled={isSubmitting || !isAuthenticated} className="bg-black text-white hover:bg-black/80">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Submit PDF
                      </>
                    )}
                  </Button>
                  {!isAuthenticated ? <p className="text-sm text-rose-600">Sign in required for uploading.</p> : null}
                </div>
              </>
            ) : null}

            {status ? <p className="mt-3 text-sm text-black/70">{status}</p> : null}
          </section>
          )}

          {isAuthenticated ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setViewMode("my")}
                  className={`rounded-xl border p-4 text-left transition ${
                    viewMode === "my" ? "border-black bg-black text-white" : "border-gray-200 bg-gray-50 text-black"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">My Uploads</p>
                  <p className="mt-1 text-2xl font-bold">{mySubmissions.length}</p>
                  <p className="mt-1 text-xs opacity-80">Track your pending and reviewed submissions</p>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("all")}
                  className={`rounded-xl border p-4 text-left transition ${
                    viewMode === "all" ? "border-black bg-black text-white" : "border-gray-200 bg-gray-50 text-black"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">All Resources</p>
                  <p className="mt-1 text-2xl font-bold">{resources.length}</p>
                  <p className="mt-1 text-xs opacity-80">See approved resources from everyone</p>
                </button>
              </div>
            </section>
          ) : null}

          {viewMode === "my" && isAuthenticated ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <h2 className="text-xl font-semibold text-black">My Submissions</h2>
              {mySubmissions.length === 0 ? (
                <p className="mt-3 text-sm text-black/60">No submissions yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {mySubmissions.map((item) => (
                    <article key={item.id} className="rounded-xl border border-gray-200 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-black">{item.title}</p>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${
                          item.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-black/60">Level: {item.level} | Type: {item.resource_type} | Submitted: {new Date(item.created_at).toLocaleString()}</p>
                      {item.review_notes ? <p className="mt-1 text-xs text-black/70">Admin note: {item.review_notes}</p> : null}
                      {item.pdf_url ? (
                        <a
                          href={item.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 rounded-md border border-black/20 px-3 py-1.5 text-xs font-semibold text-black hover:bg-black/5"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Open Uploaded PDF
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : (
            isAuthenticated ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-black">All Resources</h2>
                <p className="text-sm text-black/60">Showing {filteredResources.length} of {resources.length}</p>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search title, description, uploader"
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                />

                <select
                  value={levelFilter}
                  onChange={(event) => setLevelFilter(event.target.value)}
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                >
                  <option value="all">All levels</option>
                  {levels.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                >
                  <option value="all">All types</option>
                  {resourceTypes.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>

                <select
                  value={ratingFilter}
                  onChange={(event) => setRatingFilter(event.target.value as "all" | "rated" | "unrated" | "popular")}
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                >
                  <option value="all">All ratings</option>
                  <option value="rated">Rated by me</option>
                  <option value="unrated">Not rated by me</option>
                  <option value="popular">Popular (3+ ratings)</option>
                </select>

                <select
                  value={minRatingsFilter}
                  onChange={(event) => setMinRatingsFilter(event.target.value)}
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                >
                  <option value="0">Min ratings: 0</option>
                  <option value="1">Min ratings: 1</option>
                  <option value="3">Min ratings: 3</option>
                  <option value="5">Min ratings: 5</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as "newest" | "oldest" | "rating-high" | "rating-low")}
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-black"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="oldest">Sort: Oldest</option>
                  <option value="rating-high">Sort: Highest rated</option>
                  <option value="rating-low">Sort: Lowest rated</option>
                </select>
              </div>

              {isLoading ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-black/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading resources...
                </div>
              ) : filteredResources.length === 0 ? (
                <p className="mt-3 text-sm text-black/60">No resources match your current filters.</p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {filteredResources.map((resource) => (
                    <article key={resource.id} className="rounded-xl border border-gray-200 p-4">
                      <p className="text-base font-semibold text-black">{resource.title}</p>
                      <p className="mt-1 text-sm text-black/70">{resource.description}</p>
                      <p className="mt-2 text-xs text-black/60">Level: {resource.level} | Type: {resource.resource_type}</p>
                      <p className="mt-1 text-xs text-black/60">Uploaded by: {resource.uploaded_by}</p>
                      <p className="mt-1 text-xs text-black/60">Approved by: {resource.approved_by}</p>
                      <p className="mt-1 text-xs text-black/60">Approved on: {new Date(resource.approved_at).toLocaleDateString()}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {ratingsEnabled ? (
                          <button
                            type="button"
                            onClick={() => toggleRating(resource.id)}
                            disabled={ratingLoadingId === resource.id}
                            className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                              resource.user_has_rated
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-black/20 text-black hover:bg-black/5"
                            } ${ratingLoadingId === resource.id ? "opacity-60" : ""}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {resource.user_has_rated ? "Rated" : "Rate"} ({resource.rating_count})
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            Ratings unavailable
                          </span>
                        )}

                        <a
                          href={resource.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-black/20 px-3 py-1.5 text-xs font-semibold text-black hover:bg-black/5"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Open PDF
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
            ) : null
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
