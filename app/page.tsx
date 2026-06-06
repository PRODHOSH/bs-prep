"use client"

import Link from "next/link"
import Script from "next/script"
import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AnnouncementBar } from "@/components/announcement-bar"
import { WelcomeModal } from "@/components/welcome-modal"
import { QualifierCountdown } from "@/components/qualifier-countdown"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { BookOpen, Users, TrendingUp, ArrowRight, ChevronDown } from "lucide-react"

const spinner = <div className="animate-spin w-6 h-6 border-2 border-[#e5e7eb] border-t-[#111111] rounded-full" />

const CardSwap = dynamic(
  () => import("@/components/card-swap"),
  { ssr: false, loading: () => <div className="h-64 rounded-2xl" /> }
)

const SwapCard = dynamic(
  () => import("@/components/card-swap").then((m) => ({ default: m.Card })),
  { ssr: false }
)

const StaggerTestimonials = dynamic(() => import("@/components/stagger-testimonials").then(mod => ({ default: mod.StaggerTestimonials })), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center">{spinner}</div>
})

const LoginModal = dynamic(() => import("@/components/auth/login-modal").then(mod => ({ default: mod.LoginModal })), {
  ssr: false,
  loading: () => null
})

const SignUpModal = dynamic(() => import("@/components/auth/signup-modal").then(mod => ({ default: mod.SignUpModal })), {
  ssr: false,
  loading: () => null
})

const AnimatedCounter = dynamic(() => import("@/components/animated-counter").then(mod => ({ default: mod.AnimatedCounter })), {
  ssr: false,
  loading: () => <span className="text-4xl md:text-5xl font-semibold text-[#111111]">—</span>
})

const marqueeItems = [
  "Mathematics for Data Science I", "Statistics for Data Science I", "Computational Thinking", "English I",
  "500+ Study Materials", "15+ Expert Mentors", "Tamil Medium", "Live Weekly Classes", "Qualifier Prep",
  "Mathematics for Data Science I", "Statistics for Data Science I", "Computational Thinking", "English I",
  "500+ Study Materials", "15+ Expert Mentors", "Tamil Medium", "Live Weekly Classes", "Qualifier Prep",
]

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  const heroRef = useScrollReveal<HTMLElement>({ threshold: 0.1 })
  const statsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 })
  const howItWorksRef = useScrollReveal<HTMLElement>({ threshold: 0.05 })
  const mockup1Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.15 })
  const mockup2Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.15 })
  const mockup3Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.15 })
  const coursesRef = useScrollReveal<HTMLElement>({ threshold: 0.1 })
  const ctaRef = useScrollReveal<HTMLElement>({ threshold: 0.2 })
  const faqRef = useScrollReveal<HTMLElement>({ threshold: 0.1 })

  const courseCards = [
    { image: "/hero-section/image-1.png", title: "Mathematics for Data Science I" },
    { image: "/hero-section/image-2.png", title: "Statistics for Data Science I" },
    { image: "/hero-section/image-3.png", title: "Computational Thinking" }
  ]

  const faqs = [
    {
      question: "What is BSPrep?",
      answer: "BSPrep is a community-driven learning platform designed to help IITM BS students prepare better through structured courses, quizzes, and mentor support."
    },
    {
      question: "Is BSPrep officially affiliated with IIT Madras?",
      answer: "No. BSPrep is not officially affiliated with IIT Madras. It is an independent, student-led initiative."
    },
    {
      question: "How can I contact BSPrep?",
      answer: "You can contact us through the Support page on the website or by emailing bsprep.team@gmail.com"
    }
  ]

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .animate-marquee { animation: marquee 40s linear infinite; }
      `}</style>

      <Script src="https://www.noupe.com/embed/019d8d0fbba47ae59158befce960de8af525.js" strategy="afterInteractive" />
      <WelcomeModal />
      <AnnouncementBar />
      <Navbar isAuthenticated={false} />

      {/* Hero */}
      <section
        ref={heroRef.ref}
        className={`relative overflow-hidden pt-10 sm:pt-16 md:pt-20 pb-0 transition-all duration-1000 ${heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      >
        {/* fade dot grid at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-0">

            {/* Left — heading */}
            <div className="space-y-6">
              {/* Live badge */}
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]" />
                </span>
                <span className="text-sm font-medium text-[#374151]">Now enrolling — Qualifier 2026</span>
              </div>

              <h1 className="text-[44px] md:text-[44px] lg:text-[60px] xl:text-[72px] font-semibold tracking-[-2.5px] leading-[1.06] text-[#111111]">
                Learn IITM BS With Mentors by Your Side
              </h1>

              <p className="max-w-lg text-base sm:text-lg text-[#374151] leading-relaxed">
                Expert-led learning in Tamil, community support, and peer mentorship for IITM BS students. Master concepts, solve doubts, and ace your exams.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="group w-full sm:w-auto bg-[#111111] text-white hover:bg-[#242424] px-6 h-11 text-sm font-semibold rounded-lg transition-colors"
                >
                  <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfyhCw9tPgKmMWYPhjV6Kzixp2RdYEi-x7JPL6JUxoLwbnB_g/viewform?usp=sharing&ouid=109000575421815991569" target="_blank" rel="noopener noreferrer">
                    Join Community
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
                <Button
                  onClick={() => setShowLogin(true)}
                  className="w-full sm:w-auto bg-white text-[#111111] px-6 h-11 text-sm font-semibold rounded-lg border border-[#e5e7eb] hover:bg-[#f5f5f5] transition-colors"
                >
                  Sign In
                </Button>
              </div>
            </div>

            {/* Right: Animated Card Stack */}
            <div className="hidden md:block relative h-[360px]">
              <CardSwap
                width={630}
                height={420}
                cardDistance={60}
                verticalDistance={70}
                delay={2800}
                pauseOnHover={false}
              >
                <SwapCard>
                  <img src="/hero-section/image-1.png" alt="Mathematics for Data Science I" className="w-full h-full object-cover" />
                </SwapCard>
                <SwapCard>
                  <img src="/hero-section/image-2.png" alt="Statistics for Data Science I" className="w-full h-full object-cover" />
                </SwapCard>
                <SwapCard>
                  <img src="/hero-section/image-3.png" alt="Computational Thinking" className="w-full h-full object-cover" />
                </SwapCard>
              </CardSwap>
            </div>

            {/* Mobile: Horizontal Swipe */}
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide">
              <div className="flex gap-4 pb-4">
                {courseCards.map((card, index) => (
                  <div key={index} className="snap-center shrink-0 w-[85vw]">
                    <div className="bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] h-64">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats — more space below hero */}
          <div
            ref={statsRef.ref}
            className={`relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-14 md:mt-20 pb-10 transition-all duration-1000 delay-300 ${statsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {[
              { label: "Active Students", value: 100, suffix: "+", icon: Users },
              { label: "Expert Mentors", value: 15, suffix: "+", icon: TrendingUp },
              { label: "Study Materials", value: 500, suffix: "+", icon: BookOpen },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="bg-white border border-[#e5e7eb] rounded-xl p-6 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#f5f5f5] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#111111]" />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-semibold text-[#111111] tracking-[-0.5px] leading-none">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2500} />
                    </p>
                    <p className="text-sm text-[#6b7280] mt-1">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="overflow-hidden bg-[#f8f9fa] border-y border-[#e5e7eb] py-4">
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeItems.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 mx-6 text-sm font-medium text-[#6b7280]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1d5db] inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <QualifierCountdown />

      {/* Product Mockups — alternating */}
      <section ref={howItWorksRef.ref} className="relative py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20 md:space-y-28">

          {/* 1 — Dashboard: content left, image right */}
          <div ref={mockup1Ref.ref} className="grid md:grid-cols-[5fr_8fr] gap-10 md:gap-14 items-center">
            <div className={`space-y-5 order-2 md:order-1 transition-all duration-700 ease-out ${mockup1Ref.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] border border-[#e5e7eb] px-3 py-1 text-xs font-medium text-[#6b7280]">Learning Dashboard</span>
              <h2 className="text-3xl md:text-[2.6rem] font-semibold text-[#111111] tracking-[-1.2px] leading-[1.1]">Track Your Progress at a Glance</h2>
              <p className="text-[#374151] text-base leading-relaxed">Enrolled courses, GPA predictions, mentor sessions, and leaderboard — all in one clean view.</p>
              <ul className="space-y-3 pt-1">
                {["GPA calculator & grade predictor", "Enrolled courses & live sessions", "Community leaderboard & profile"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[15px] text-[#374151]">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`order-1 md:order-2 transition-all duration-700 ease-out delay-150 ${mockup1Ref.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)]">
                <video
                  src="/videos/dashboard.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>

          {/* 2 — Compiler: image left, content right */}
          <div ref={mockup2Ref.ref} className="grid md:grid-cols-[8fr_5fr] gap-10 md:gap-14 items-center">
            <div className={`transition-all duration-700 ease-out ${mockup2Ref.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)]">
                <video
                  src="/videos/compiler.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto block"
                />
              </div>
            </div>
            <div className={`space-y-5 transition-all duration-700 ease-out delay-150 ${mockup2Ref.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] border border-[#e5e7eb] px-3 py-1 text-xs font-medium text-[#6b7280]">Code Compiler</span>
              <h2 className="text-3xl md:text-[2.6rem] font-semibold text-[#111111] tracking-[-1.2px] leading-[1.1]">Practice Code Right in Your Browser</h2>
              <p className="text-[#374151] text-base leading-relaxed">No installs, no setup. Python, Java, C, C++ — write, run, and share with a single link.</p>
              <ul className="space-y-3 pt-1">
                {["Python, Java, C & C++ support", "Share code via shareable link", "Multi-file editor with tabs"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[15px] text-[#374151]">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3 — Live Classes: content left, image right */}
          <div ref={mockup3Ref.ref} className="grid md:grid-cols-[5fr_8fr] gap-10 md:gap-14 items-center">
            <div className={`space-y-5 order-2 md:order-1 transition-all duration-700 ease-out ${mockup3Ref.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] border border-[#e5e7eb] px-3 py-1 text-xs font-medium text-[#6b7280]">Live Classes</span>
              <h2 className="text-3xl md:text-[2.6rem] font-semibold text-[#111111] tracking-[-1.2px] leading-[1.1]">Learn Live with Expert Tamil Mentors</h2>
              <p className="text-[#374151] text-base leading-relaxed">Weekly sessions per subject — ask questions, clear doubts, and stay on track for the qualifier.</p>
              <ul className="space-y-3 pt-1">
                {["Weekly sessions per subject", "Live Q&A and doubt clearing", "Recordings available after class"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[15px] text-[#374151]">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0"><svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`order-1 md:order-2 transition-all duration-700 ease-out delay-150 ${mockup3Ref.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)]">
                <img src="/hero-section/image-1.png" alt="Live Classes" className="w-full h-auto block" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Courses */}
      <section ref={coursesRef.ref} className={`relative py-24 bg-white transition-all duration-1000 ${coursesRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] border border-[#e5e7eb] px-3 py-1 text-xs font-medium text-[#6b7280] mb-4">
              Tamil medium · Qualifier level
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold text-[#111111] tracking-[-1.5px] leading-[1.1] mb-4">Crack Qualifier with Tamil Courses</h2>
            <p className="text-[#6b7280] text-base mb-2">Master IITM BS Qualifier level with comprehensive Tamil video courses</p>
            <div className="inline-flex items-stretch mt-6 rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
              <div className="flex flex-col items-center justify-center px-6 py-4 gap-0.5">
                <span className="text-xs font-medium text-[#6b7280] uppercase tracking-widest mb-1">Per Course</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-[#6b7280] line-through">₹149</span>
                  <span className="text-3xl font-semibold text-[#111111] leading-none tracking-[-0.5px]">₹129</span>
                </div>
                <span className="mt-1 text-[11px] bg-[#111111] text-white rounded-full px-2.5 py-0.5 font-semibold tracking-wide">Special Price</span>
              </div>
              <div className="w-px bg-[#e5e7eb] my-3" />
              <div className="flex flex-col items-center justify-center px-6 py-4 gap-0.5">
                <span className="text-xs font-medium text-[#6b7280] uppercase tracking-widest mb-1">All 4 Courses</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-[#10b981]/60 line-through">₹599</span>
                  <span className="text-3xl font-semibold text-[#10b981] leading-none tracking-[-0.5px]">₹499</span>
                </div>
                <span className="mt-1 text-[11px] bg-[#10b981] text-white rounded-full px-2.5 py-0.5 font-semibold tracking-wide">Best Value</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { id: "qualifier-math-1", title: "Mathematics for Data Science I", description: "Master fundamental math concepts", thumbnail: "/courses/math.png", price: 129, originalPrice: 149 },
              { id: "qualifier-stats-1", title: "Statistics for Data Science I", description: "Learn statistical thinking & analysis", thumbnail: "/courses/stats.png", price: 129, originalPrice: 149 },
              { id: "qualifier-computational-thinking", title: "Computational Thinking", description: "Build problem-solving skills", thumbnail: "/courses/ct.png", price: 129, originalPrice: 149 },
              { id: "qualifier-english-1", title: "English I", description: "Build core English communication skills", thumbnail: "/courses/english.png", price: 129, originalPrice: 149 }
            ].map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="group">
                <Card className="bg-white border border-[#e5e7eb] hover:border-[#111111] transition-all duration-200 rounded-xl h-full overflow-hidden">
                  <div className="relative w-full aspect-video overflow-hidden">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">IITM BS</span>
                    <h3 className="text-[15px] font-semibold text-[#111111] mt-1 mb-1.5 line-clamp-2 leading-snug">{course.title}</h3>
                    <p className="text-sm text-[#374151] mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#e5e7eb]">
                      <span className="text-xs text-[#6b7280]">Price</span>
                      <div className="flex items-center gap-1.5">
                        {course.originalPrice && (
                          <span className="text-xs text-[#6b7280] line-through">₹{course.originalPrice}</span>
                        )}
                        <span className="text-base font-semibold text-[#111111]">₹{course.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/courses">
              <Button className="bg-[#111111] text-white hover:bg-[#242424] px-8 h-10 text-sm font-semibold rounded-lg transition-colors">
                View All Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      <StaggerTestimonials />

      {/* CTA Band */}
      <section ref={ctaRef.ref} className={`relative py-24 bg-white transition-all duration-1000 ${ctaRef.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center bg-[#111111] rounded-2xl p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-[-1px] leading-[1.15] mb-5">Ready to Transform Your Learning?</h2>
          <p className="text-white/65 text-base mb-8 max-w-2xl mx-auto">
            Join thousands of IITM BS students accelerating their journey with expert mentorship and community support.
          </p>
          <Button
            onClick={() => setShowLogin(true)}
            className="group bg-white text-[#111111] hover:bg-[#f5f5f5] px-8 h-11 text-sm font-semibold rounded-lg transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>

          <p className="mt-5 text-xs text-white/40">
            Want to support the initiative?{" "}
            <Link href="/donate" className="font-semibold text-white/70 underline underline-offset-4">
              Donate to BSPREP
            </Link>
          </p>
        </div>
      </section>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        onSwitchToSignUp={() => { setShowLogin(false); setShowSignup(true) }}
        onSwitchToForgotPassword={() => {}}
      />
      <SignUpModal
        open={showSignup}
        onOpenChange={setShowSignup}
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true) }}
      />

      {/* FAQ */}
      <section ref={faqRef.ref} className={`relative py-24 bg-[#f8f9fa] transition-all duration-1000 ${faqRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#111111] tracking-[-1.5px] leading-[1.1] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[#6b7280] text-base">
              Everything you need to know about BSPrep
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h3 className="text-base font-semibold text-[#111111] pr-8">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-[#6b7280] flex-shrink-0 transition-transform duration-200 ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${openFAQ === index ? "max-h-96" : "max-h-0"}`}>
                  <div className="px-6 pb-6 text-[#374151] text-sm leading-relaxed">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[#6b7280] text-sm mb-4">Still have questions?</p>
            <Link href="/support">
              <Button className="bg-[#111111] text-white hover:bg-[#242424] px-6 h-10 text-sm font-semibold rounded-lg transition-colors">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
