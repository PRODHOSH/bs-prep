"use client"

import Script from "next/script"
import { useState } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AnnouncementBar } from "@/components/announcement-bar"
import { QualifierCountdown } from "@/components/qualifier-countdown"
import { Hero } from "@/components/home/Hero"
import { Features } from "@/components/home/Features"
import { Courses } from "@/components/home/Courses"
import { Faq } from "@/components/home/Faq"
import { Cta } from "@/components/home/Cta"

const spinner = <div className="animate-spin w-6 h-6 border-2 border-[#e5e7eb] border-t-[#111111] rounded-full" />

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

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  return (
    <div className="min-h-screen bg-white text-black">
      <Script src="https://www.noupe.com/embed/019d8d0fbba47ae59158befce960de8af525.js" strategy="afterInteractive" />
      <AnnouncementBar />
      <Navbar isAuthenticated={false} />
      
      <main className="flex flex-col w-full">
        <Hero />
        <QualifierCountdown />
        <Features />
        <Courses />
        <StaggerTestimonials />
        <Cta setShowLogin={setShowLogin} />
        <Faq />
      </main>

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

      <Footer />
    </div>
  )
}
