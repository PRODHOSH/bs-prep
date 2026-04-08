"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { BadgeCheck, HeartHandshake, LockKeyhole, ShieldCheck, Sparkles, Wallet } from "lucide-react"
import { PostPaymentModal } from "@/components/razorpay/post-payment-modal"

const BeamsBackground = dynamic(() => import("@/components/beams-background").then((mod) => ({ default: mod.BeamsBackground })), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-white" />,
})

const DonateRazorpayButton = dynamic(
  () => import("@/components/razorpay/razorpay-button").then((mod) => ({ default: mod.RazorpayButton })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Loading secure payment form...
      </div>
    ),
  },
)

const SUPPORTER_NOTE_DISPLAY_LIMIT = 180

type PublicDonation = {
  id: string
  name: string
  amount: number
  contributor_image_url: string | null
  note: string | null
  submitted_at: string
}

function resolveContributorImageUrl(url: string | null): string | null {
  if (!url) return null

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  if (!base) return url

  if (url.startsWith("/storage/v1/object/public/")) {
    return `${base}${url}`
  }

  if (url.startsWith("storage/v1/object/public/")) {
    return `${base}/${url}`
  }

  if (url.startsWith("contributors/")) {
    return `${base}/storage/v1/object/public/donations/${url}`
  }

  return url
}

export default function DonatePage() {
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [defaultDonorName, setDefaultDonorName] = useState("")
  const [defaultDonorEmail, setDefaultDonorEmail] = useState("")

  const [supporters, setSupporters] = useState<PublicDonation[]>([])
  const [loadingSupporters, setLoadingSupporters] = useState(true)

  // Payment flow state
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const paymentSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [supporterPage, setSupporterPage] = useState(0)
  const supportersPerPage = 12

  const sortedSupporters = useMemo(
    () => [...supporters].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()),
    [supporters],
  )

  const totalSupporterPages = Math.max(1, Math.ceil(sortedSupporters.length / supportersPerPage))
  const paginatedSupporters = sortedSupporters.slice(
    supporterPage * supportersPerPage,
    (supporterPage + 1) * supportersPerPage,
  )

  useEffect(() => {
    const bootstrap = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsAuthenticated(!!user)
      if (user) {
        const firstName = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name.trim() : ""
        const lastName = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name.trim() : ""
        const fullName = [firstName, lastName].filter(Boolean).join(" ")

        setDefaultDonorName(fullName)
        setDefaultDonorEmail(user.email || "")
      }

      try {
        const res = await fetch("/api/donations", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setSupporters(Array.isArray(data.donations) ? data.donations : [])
        }
      } catch (error) {
        console.error("Failed to load supporters:", error)
      } finally {
        setLoadingSupporters(false)
      }
    }

    void bootstrap()
  }, [supabase])

  function handlePaymentSuccess(orderId: string, paymentId: string) {
    setCurrentOrderId(orderId)
    setCurrentPaymentId(paymentId)
    setPaymentError(null)
    setShowPaymentModal(true)
  }

  function handlePaymentError(error: string) {
    setPaymentError(error)
    setShowPaymentModal(false)
    setCurrentPaymentId(null)
    setCurrentOrderId(null)
  }

  function handlePaymentModalClose() {
    setShowPaymentModal(false)
    setCurrentPaymentId(null)
    setCurrentOrderId(null)
  }

  function handlePaymentModalSuccess() {
    if (paymentSuccessTimerRef.current) {
      clearTimeout(paymentSuccessTimerRef.current)
    }

    setPaymentSuccess(true)
    setShowPaymentModal(false)
    setCurrentPaymentId(null)
    setCurrentOrderId(null)
    setPaymentError(null)
    setSupporterPage(0)

    // Refresh supporters list
    setTimeout(() => {
      fetch("/api/donations", { cache: "no-store" })
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error("Failed to fetch")
        })
        .then((data) => {
          setSupporters(Array.isArray(data.donations) ? data.donations : [])
        })
        .catch((error) => console.error("Failed to refresh supporters:", error))
    }, 1000)

    paymentSuccessTimerRef.current = setTimeout(() => {
      setPaymentSuccess(false)
      paymentSuccessTimerRef.current = null
    }, 10 * 1000)
  }

  useEffect(() => {
    return () => {
      if (paymentSuccessTimerRef.current) {
        clearTimeout(paymentSuccessTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-white text-black">
      <BeamsBackground />
      <Navbar isAuthenticated={isAuthenticated} />

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_280px_at_0%_0%,rgba(190,24,93,0.14),transparent),radial-gradient(900px_280px_at_100%_100%,rgba(15,23,42,0.08),transparent)]" />

          <div className="relative grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                <HeartHandshake className="h-4 w-4" />
                Trustworthy Support
              </p>

              <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Help Us Keep Quality Learning Open for Everyone
              </h1>

              <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                Your donation directly funds course updates, better tools, and reliable infrastructure so learners can keep growing without barriers.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verified Payments</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">Only payment-confirmed entries are acknowledged.</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Moderated Wall</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">Public messages are reviewed before display.</p>
                </article>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">How your donation is used</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-rose-600" />
                    Course content quality and new learning modules
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-rose-600" />
                    Platform reliability, performance, and improvements
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-rose-600" />
                    Accessible resources for student-first learning
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-5">
              {paymentSuccess ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-emerald-900 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xl text-white">✓</div>
                  <h2 className="mt-3 text-2xl font-bold">Payment Received</h2>
                  <p className="mt-3 text-sm leading-7">
                    Thank you for supporting BSPREP. Your contribution is confirmed and your acknowledgement email is on the way.
                  </p>
                  <p className="mt-3 text-sm leading-7">
                    You can optionally share your profile in the next step for our moderated supporter wall.
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-slate-800" />
                    <h2 className="text-2xl font-bold text-slate-900">Secure Donation</h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Set an amount and continue with Razorpay checkout.
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    Allowed range: <strong>₹10</strong> to <strong>₹5,00,000</strong> per transaction.
                  </div>

                  <div className="mt-5 space-y-3">
                    <DonateRazorpayButton onPaymentSuccess={handlePaymentSuccess} onPaymentError={handlePaymentError} />

                    {paymentError ? (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{paymentError}</div>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-[#0F172A] p-6 text-slate-100 shadow-sm">
                <h3 className="text-lg font-bold">Payment Trust Layer</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <p className="flex items-start gap-2">
                    <LockKeyhole className="mt-0.5 h-4 w-4 text-rose-300" />
                    Razorpay checkout with encrypted transfer and gateway-level verification.
                  </p>
                  <p className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-rose-300" />
                    Public supporter wall includes only approved and verified entries.
                  </p>
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-rose-300" />
                    We do not store card details and limit public fields to what you choose to share.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supporter Wall */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Verified Supporter Wall</h2>
              <p className="mt-1 text-sm text-slate-600">Moderated public acknowledgements from verified payments only.</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              Showing {paginatedSupporters.length} of {sortedSupporters.length}
            </div>
          </div>

          {loadingSupporters ? (
            <p className="mt-4 text-sm text-slate-500">Loading supporters...</p>
          ) : sortedSupporters.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No public contributions yet. Be the first supporter!</p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedSupporters.map((item) => (
                  <article key={item.id} className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const imageUrl = resolveContributorImageUrl(item.contributor_image_url)
                        return imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                            referrerPolicy="no-referrer"
                            onError={(event) => {
                              event.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700">
                            {item.name.slice(0, 1).toUpperCase()}
                          </div>
                        )
                      })()}
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{new Date(item.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-rose-700">Verified supporter</p>

                    <p className="mt-2 wrap-break-word text-sm text-slate-600">
                      {(item.note?.trim() || "No comment").slice(0, SUPPORTER_NOTE_DISPLAY_LIMIT)}
                      {(item.note?.trim() || "").length > SUPPORTER_NOTE_DISPLAY_LIMIT ? "..." : ""}
                    </p>
                  </article>
                ))}
              </div>
              {totalSupporterPages > 1 ? (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSupporterPage((page) => Math.max(0, page - 1))}
                    disabled={supporterPage === 0}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white text-black transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous supporters"
                  >
                    ←
                  </button>
                  <span className="text-sm text-slate-600">
                    {supporterPage + 1} / {totalSupporterPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSupporterPage((page) => Math.min(totalSupporterPages - 1, page + 1))}
                    disabled={supporterPage >= totalSupporterPages - 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white text-black transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next supporters"
                  >
                    →
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>

        {/* Disclaimer */}
        <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Note
          </p>
          <p className="mt-2 text-sm leading-6">
            This is a personal initiative and not a registered charitable organization. Contributions are voluntary and used solely for the development and maintenance of the BSPREP platform.
          </p>
          <p className="mt-3 text-sm font-semibold">Thank you for supporting BSPREP.</p>
        </section>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && currentPaymentId && currentOrderId && (
        <PostPaymentModal
          paymentId={currentPaymentId}
          orderId={currentOrderId}
          defaultName={defaultDonorName}
          defaultEmail={defaultDonorEmail}
          onClose={handlePaymentModalClose}
          onSuccess={handlePaymentModalSuccess}
          onError={handlePaymentError}
        />
      )}

      <Footer />
    </div>
  )
}
