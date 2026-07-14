"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Shield, Zap, AlertCircle, BookOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { courses } from "@/lib/course-catalog"

type RazorpaySuccessResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export default function DashboardPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const course = courses.find(c => c.id === courseId)
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const [checkoutReady, setCheckoutReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Calculate pricing
  const gatewayFeePercent = 2.5
  const basePrice = course?.price || 0
  const gatewayFee = Number((basePrice * (gatewayFeePercent / 100)).toFixed(2))
  const finalTotal = basePrice + gatewayFee

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setCheckoutReady(true)
    script.onerror = () => setCheckoutReady(false)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (!course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <h2 className="text-2xl font-black uppercase text-black">Course not found.</h2>
      </div>
    )
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMsg("Please fill in all details.")
      return
    }

    setLoading(true)

    try {
      if (!checkoutReady) throw new Error("Payment gateway is still loading. Please wait.")
      if (!razorpayKeyId) throw new Error("Payment gateway is not configured properly.")

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        router.replace('/dashboard/courses')
        return
      }

      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          courseId,
          payer: formData,
        }),
      })
      const orderData = await orderResponse.json()
      if (!orderResponse.ok || !orderData?.orderId) {
        throw new Error(orderData?.error || 'Failed to create payment order')
      }

      const options = {
        key: razorpayKeyId,
        amount: orderData.amount, // from backend which includes 2.5%
        currency: 'INR',
        name: 'BSPrep',
        description: course.title,
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#000000'
        },
        handler: async function (response: RazorpaySuccessResponse) {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
              })
            })

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed')
            }
            router.push('/dashboard/courses?success=true')
          } catch (verifyError) {
            setErrorMsg('Payment verification failed. If money was deducted, please contact support.')
            setLoading(false)
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setErrorMsg(response.error.description || 'Payment failed')
        setLoading(false)
      })
      rzp.open()
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during checkout.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto py-8">
      
      {/* Header with Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/courses/${courseId}`} className="w-10 h-10 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center transition-colors">
          <ArrowLeft className="w-5 h-5 text-black" />
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-black" />
          <h1 className="text-xl font-black uppercase tracking-tight text-black">BSPREP SECURE CHECKOUT</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left side: Order Summary */}
        <div className="w-full md:w-5/12 bg-[#0a192f] text-white p-8 md:p-10 rounded-3xl shadow-xl flex flex-col justify-between overflow-hidden relative">
          <div>
            <div className="w-full h-40 mb-6 rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            </div>

            <span className="bg-white/10 text-white border border-white/20 font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full mb-4 inline-block">
              ORDER SUMMARY
            </span>
            
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-2">
              {course.title}
            </h2>
            <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-10">
              IITM BS • {course.level}
            </p>

            <div className="space-y-4 font-bold text-sm">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-white/70 uppercase tracking-widest">Base Price</span>
                <span>₹{basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-white/70 uppercase tracking-widest flex items-center gap-2">
                  Gateway Fee (2.5%)
                  <div className="group relative">
                    <AlertCircle className="w-4 h-4 text-white/40 cursor-help" />
                    <div className="absolute left-0 bottom-6 w-48 bg-white text-black text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Razorpay transaction processing fee applied to all purchases.
                    </div>
                  </div>
                </span>
                <span>₹{gatewayFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-white font-black uppercase tracking-widest text-lg">Total Due</span>
                <span className="text-white font-black text-2xl">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right side: Checkout Form */}
        <div className="w-full md:w-7/12 p-8 md:p-10 bg-white border border-black/10 rounded-3xl shadow-sm flex flex-col justify-center">
          
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-8">
            Billing Details
          </h2>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-black/50 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="JOHN DOE"
                className="w-full h-12 bg-black/5 border-transparent focus:border-black focus:bg-white rounded-xl px-4 text-xs font-bold uppercase tracking-widest text-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-black/50 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="JOHN@EXAMPLE.COM"
                className="w-full h-12 bg-black/5 border-transparent focus:border-black focus:bg-white rounded-xl px-4 text-xs font-bold uppercase tracking-widest text-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-black/50 uppercase tracking-widest mb-2">
                Phone Number
              </label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 98765 43210"
                className="w-full h-12 bg-black/5 border-transparent focus:border-black focus:bg-white rounded-xl px-4 text-xs font-bold uppercase tracking-widest text-black outline-none transition-all"
              />
            </div>

            <div className="pt-6 border-t border-black/5">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-black hover:bg-black/80 text-white rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-1"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    PAY ₹{finalTotal.toFixed(2)}
                  </>
                )}
              </button>
              <div className="mt-6 bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest leading-relaxed">
                  Your payment is secure. We use Razorpay to process all transactions safely.
                </p>
              </div>
              <p className="text-center text-[10px] font-bold text-black/40 uppercase tracking-widest mt-4">
                By clicking pay, you agree to our Terms of Service.
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
