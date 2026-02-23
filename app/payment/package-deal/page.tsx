"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BeamsBackground } from "@/components/beams-background"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, CreditCard, Lock, Check, Shield, Package, Star
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const BUNDLE_COURSES = [
  {
    id: "qualifier-math-1",
    title: "Mathematics for Data Science I",
    description: "Fundamental math concepts essential for data science",
    thumbnail: "/courses/math.jpg",
    weeks: 4,
    individualPrice: 349,
  },
  {
    id: "qualifier-stats-1",
    title: "Statistics for Data Science I",
    description: "Statistical thinking and analysis from the ground up",
    thumbnail: "/courses/stats.jpg",
    weeks: 4,
    individualPrice: 349,
  },
  {
    id: "qualifier-computational-thinking",
    title: "Computational Thinking",
    description: "Problem-solving and algorithmic thinking fundamentals",
    thumbnail: "/courses/ct.jpg",
    weeks: 4,
    individualPrice: 349,
  },
]

const BUNDLE_PRICE = 999
const ORIGINAL_PRICE = BUNDLE_COURSES.reduce((s, c) => s + c.individualPrice, 0) // 1047

export default function PackageDealPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" })

  useEffect(() => {
    checkAuth()
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const handlePayment = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill all fields")
      return
    }
    setLoading(true)
    try {
      const options = {
        key: "YOUR_RAZORPAY_KEY_ID",
        amount: BUNDLE_PRICE * 100,
        currency: "INR",
        name: "BSPrep",
        description: "Qualifier Bundle — All 3 Courses",
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#000000" },
        handler: async function (response: any) {
          console.log("Payment Success:", response)
          alert("Payment successful! Payment ID: " + response.razorpay_payment_id)
          router.push(isAuthenticated ? "/dashboard/courses" : "/courses")
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }
      // @ts-ignore
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
      setLoading(false)
    }
  }

  const handleDemoEnroll = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Please log in first")
        setLoading(false)
        return
      }

      for (const course of BUNDLE_COURSES) {
        const { data: existing } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .single()

        if (!existing) {
          await supabase
            .from("enrollments")
            .insert({ user_id: user.id, course_id: course.id, payment_status: "completed" })
        }
      }

      router.push("/dashboard/courses")
    } catch (err) {
      console.error("Demo enroll error:", err)
      alert("Enrollment failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative">
      <BeamsBackground />
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pt-24 pb-20 relative z-10">
        {/* Back Button */}
        <Link
          href={isAuthenticated ? "/dashboard/courses" : "/courses"}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#51b206]/10 border border-[#51b206]/30 mb-3">
            <Star className="w-3.5 h-3.5 text-[#51b206]" />
            <span className="text-xs font-bold text-[#51b206] uppercase tracking-wide">Best Value</span>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Qualifier Bundle — All 3 Courses</h1>
          <p className="text-gray-600">Enroll in all 3 available qualifier courses at once and save ₹{ORIGINAL_PRICE - BUNDLE_PRICE}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Bundle Summary */}
          <div className="space-y-5">
            {/* Courses included */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#51b206]" />
                  <h2 className="font-bold text-black text-base">Included in this bundle</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {BUNDLE_COURSES.map((course) => (
                    <div key={course.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-14 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-black leading-tight truncate">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{course.weeks} weeks · Qualifier</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-gray-400 line-through">₹{course.individualPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price summary */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Individual total</span>
                    <span className="line-through">₹{ORIGINAL_PRICE}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#51b206]">
                    <span>Bundle discount</span>
                    <span>− ₹{ORIGINAL_PRICE - BUNDLE_PRICE}</span>
                  </div>
                  <div className="flex justify-between text-xl font-extrabold text-black pt-2 border-t border-gray-200">
                    <span>You pay</span>
                    <span>₹{BUNDLE_PRICE}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What you get */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
              <CardContent className="p-5 space-y-2.5">
                {[
                  "All 3 qualifier courses unlocked immediately",
                  "Expert-led video lectures in Tamil",
                  "Practice assignments and quizzes for each course",
                  "Certificate of completion for each course",
                  "Lifetime access to all course materials",
                  "Live doubt-clearing sessions",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#51b206] shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Secure payment processing with Razorpay</span>
            </div>
          </div>

          {/* Right — Payment form */}
          <div className="space-y-5">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:border-gray-400 transition-colors"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:border-gray-400 transition-colors"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 1234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-black focus:outline-none focus:border-gray-400 transition-colors"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-black hover:bg-black/80 text-white py-6 text-lg font-semibold"
                  suppressHydrationWarning
                >
                  {loading ? "Processing..." : `Pay ₹${BUNDLE_PRICE} for All 3 Courses`}
                </Button>

                {/* Demo enroll */}
                <div className="mt-3 border border-dashed border-gray-300 rounded-lg p-3">
                  <p className="text-xs text-center text-gray-400 mb-2 uppercase tracking-widest font-semibold">Testing only</p>
                  <Button
                    onClick={handleDemoEnroll}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-black font-semibold"
                    suppressHydrationWarning
                  >
                    {loading ? "Enrolling..." : "Demo Pay — Enroll in All 3"}
                  </Button>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border border-blue-200 rounded-xl">
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Secure Payment Gateway</p>
                  <p className="text-xs text-blue-700">
                    Your payment information is encrypted and secure. We use Razorpay's industry-standard security measures.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
