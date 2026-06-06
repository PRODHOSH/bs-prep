"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { BadgeCheck, HeartHandshake, LockKeyhole, ShieldCheck, Wallet } from "lucide-react"
import { PostPaymentModal } from "@/components/razorpay/post-payment-modal"

const DonateRazorpayButton = dynamic(
  () => import("@/components/razorpay/razorpay-button").then((mod) => ({ default: mod.RazorpayButton })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-4 text-sm text-[#6b7280]">
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
  if (url.startsWith("http://") || url.startsWith("https://")) return url

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  if (!base) return url

  if (url.startsWith("/storage/v1/object/public/")) return `${base}${url}`
  if (url.startsWith("storage/v1/object/public/")) return `${base}/${url}`
  if (url.startsWith("contributors/")) return `${base}/storage/v1/object/public/donations/${url}`
  return url
}

export default function DonatePage() {
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [defaultDonorName, setDefaultDonorName] = useState("")
  const [defaultDonorEmail, setDefaultDonorEmail] = useState("")
  const [supporters, setSupporters] = useState<PublicDonation[]>([])
  const [loadingSupporters, setLoadingSupporters] = useState(true)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const paymentSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sortedSupporters = useMemo(
    () => [...supporters].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()),
    [supporters],
  )

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      if (user) {
        const firstName = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name.trim() : ""
        const lastName = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name.trim() : ""
        setDefaultDonorName([firstName, lastName].filter(Boolean).join(" "))
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
    if (paymentSuccessTimerRef.current) clearTimeout(paymentSuccessTimerRef.current)
    setPaymentSuccess(true)
    setShowPaymentModal(false)
    setCurrentPaymentId(null)
    setCurrentOrderId(null)
    setPaymentError(null)

    setTimeout(() => {
      fetch("/api/donations", { cache: "no-store" })
        .then((res) => { if (res.ok) return res.json(); throw new Error("Failed") })
        .then((data) => { setSupporters(Array.isArray(data.donations) ? data.donations : []) })
        .catch((error) => console.error("Failed to refresh supporters:", error))
    }, 1000)

    paymentSuccessTimerRef.current = setTimeout(() => {
      setPaymentSuccess(false)
      paymentSuccessTimerRef.current = null
    }, 10 * 1000)
  }

  useEffect(() => {
    return () => { if (paymentSuccessTimerRef.current) clearTimeout(paymentSuccessTimerRef.current) }
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Hero header */}
      <section className="pt-28 pb-10 border-b border-[#e5e7eb]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fff1f2] border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 mb-4">
            <HeartHandshake className="h-3.5 w-3.5" />
            Community Support
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-1.5px] leading-[1.1] text-[#111111] mb-3">
            Support BSPrep
          </h1>
          <p className="text-[#374151] text-base max-w-2xl">
            Every contribution helps us keep the platform free and growing for Tamil-speaking IITM BS students.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">

            {/* Supporter Wall */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[#111111] tracking-[-0.3px]">Supporter Wall</h2>
                    <p className="mt-1 text-sm text-[#6b7280]">Verified public acknowledgements — moderated for quality.</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-[#f5f5f5] border border-[#e5e7eb] px-3 py-1 text-xs font-medium text-[#374151]">
                    {sortedSupporters.length} supporter{sortedSupporters.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {loadingSupporters ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-[#6b7280]">
                    <div className="w-4 h-4 border-2 border-[#e5e7eb] border-t-[#111111] rounded-full animate-spin" />
                    Loading supporters...
                  </div>
                ) : sortedSupporters.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-3">
                      <HeartHandshake className="w-6 h-6 text-[#6b7280]" />
                    </div>
                    <p className="text-sm font-medium text-[#111111]">No supporters yet</p>
                    <p className="text-sm text-[#6b7280] mt-1">Be the first to support BSPrep!</p>
                  </div>
                ) : (
                  <div className="max-h-150 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {sortedSupporters.map((item) => {
                        const imageUrl = resolveContributorImageUrl(item.contributor_image_url)
                        const displayName = (item.name || "").replace(/\s+/g, " ").trim() || "Supporter"
                        const wallMessage = (item.note || "").replace(/\s+/g, " ").trim() || "No comment"

                        return (
                          <article key={item.id} className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-4">
                            <div className="flex items-center gap-3 mb-3">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={displayName}
                                  className="h-10 w-10 rounded-full border border-[#e5e7eb] object-cover shrink-0"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => { e.currentTarget.style.display = "none" }}
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-[#e5e7eb] text-sm font-semibold text-[#111111]">
                                  {displayName.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#111111] truncate">{displayName}</p>
                                <p className="text-xs text-[#6b7280]">{new Date(item.submitted_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] border border-[#10b981]/30 px-2 py-0.5 mb-2">
                              <BadgeCheck className="w-3 h-3 text-[#10b981]" />
                              <span className="text-[10px] font-semibold text-[#10b981]">Verified supporter</span>
                            </div>
                            <p className="text-sm leading-relaxed text-[#374151] wrap-break-word">
                              {wallMessage.slice(0, SUPPORTER_NOTE_DISPLAY_LIMIT)}
                              {wallMessage.length > SUPPORTER_NOTE_DISPLAY_LIMIT ? "…" : ""}
                            </p>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment sidebar */}
            <div className="lg:col-span-5">
              <div className="top-24 space-y-4 lg:sticky">

                {/* Success state */}
                {paymentSuccess ? (
                  <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-7">
                    <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-[#111111] tracking-[-0.3px] mb-2">Payment received!</h2>
                    <p className="text-sm text-[#374151] leading-relaxed">
                      Thank you for supporting BSPrep. Your contribution is confirmed and an acknowledgement email is on the way.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="h-4 w-4 text-[#111111]" />
                      <h2 className="text-lg font-semibold text-[#111111] tracking-[-0.3px]">Make a Donation</h2>
                    </div>
                    <p className="text-sm text-[#6b7280] mb-4">
                      Secure checkout via Razorpay. Set any amount between ₹10 and ₹5,00,000.
                    </p>

                    <div className="rounded-lg bg-[#f8f9fa] border border-[#e5e7eb] p-3 text-xs text-[#6b7280] mb-5">
                      Allowed range: <span className="font-semibold text-[#111111]">₹10</span> — <span className="font-semibold text-[#111111]">₹5,00,000</span> per transaction
                    </div>

                    <DonateRazorpayButton onPaymentSuccess={handlePaymentSuccess} onPaymentError={handlePaymentError} />

                    {paymentError && (
                      <div className="mt-3 rounded-lg border border-[#ef4444]/30 bg-[#fef2f2] p-3 text-sm text-[#ef4444]">
                        {paymentError}
                      </div>
                    )}
                  </div>
                )}

                {/* Trust layer */}
                <div className="rounded-2xl border border-[#e5e7eb] bg-[#111111] p-6 text-white">
                  <h3 className="text-sm font-semibold mb-4">Payment Trust Layer</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm text-white/75">
                      <LockKeyhole className="mt-0.5 h-4 w-4 text-white/50 shrink-0" />
                      Razorpay checkout with encrypted transfer and gateway-level verification.
                    </div>
                    <div className="flex items-start gap-3 text-sm text-white/75">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-white/50 shrink-0" />
                      Public supporter wall includes only approved and verified entries.
                    </div>
                    <div className="flex items-start gap-3 text-sm text-white/75">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-white/50 shrink-0" />
                      We do not store card details and limit public fields to what you choose to share.
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="rounded-2xl border border-[#fb923c]/30 bg-[#fff7ed] p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-[#ea580c]" />
                    <span className="text-xs font-semibold text-[#ea580c]">Disclaimer</span>
                  </div>
                  <p className="text-sm text-[#9a3412] leading-relaxed">
                    This is a personal initiative and not a registered charitable organization. Contributions are voluntary and used solely for the development and maintenance of the BSPrep platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
