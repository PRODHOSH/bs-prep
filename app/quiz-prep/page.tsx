"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight, CheckCircle2, ShieldCheck, Layers, Cpu, Code2, Sparkles, BookOpen } from "lucide-react"

const LoginModal = dynamic(
  () => import("@/components/auth/login-modal").then((m) => ({ default: m.LoginModal })),
  { ssr: false }
)
const SignUpModal = dynamic(
  () => import("@/components/auth/signup-modal").then((m) => ({ default: m.SignUpModal })),
  { ssr: false }
)

export default function QuizPrepLandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })
  }, [supabase])

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b border-neutral-100 bg-white py-20 md:py-28 px-4">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3.5 py-1.5 text-xs font-semibold text-neutral-800">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>IIT MADRAS BS DEGREE &bull; QUIZ & END TERM PREPARATION</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-black leading-tight max-w-4xl mx-auto">
              AI-Optimized Problem Solving for Your BS Degree Exams
            </h1>

            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Practise past Quiz 1, Quiz 2, and End Term papers in an interactive LeetCode-style environment. Fetched directly from Google Drive with server-validated option shuffling.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard/quiz-prep">
                  <Button className="bg-[#0a192f] hover:bg-[#112a52] text-white px-8 h-12 text-sm font-bold rounded-full transition-all uppercase tracking-wider shadow-md group">
                    <span>OPEN QUIZ PREP IN DASHBOARD</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    onClick={() => setLoginOpen(true)}
                    className="bg-[#0a192f] hover:bg-[#112a52] text-white px-8 h-12 text-sm font-bold rounded-full transition-all uppercase tracking-wider shadow-md group"
                  >
                    <span>SIGN IN TO ACCESS QUIZ PREP</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <Button
                    onClick={() => setSignUpOpen(true)}
                    variant="outline"
                    className="border-neutral-200 bg-white text-black hover:border-black px-8 h-12 text-sm font-bold rounded-full transition-all uppercase tracking-wider"
                  >
                    CREATE FREE ACCOUNT
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-20 px-4 bg-neutral-50/50 border-b border-neutral-100">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
                Engineered for Academic Excellence
              </h2>
              <p className="text-sm text-neutral-500 max-w-xl mx-auto">
                A clean, white-themed learning interface matching the BSPrep design standard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-black">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-black">Structured Navigation Path</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Navigate seamlessly through <span className="font-semibold">Level &rarr; Course &rarr; Exam &rarr; Date & Shift</span> to reach exact past papers for your subject.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-black">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-black">LeetCode Split-Screen Solver</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Focus on problem statements with dynamic split-screen layout, session timers, and keyboard shortcuts (<kbd className="px-1 py-0.5 bg-neutral-100 border rounded text-[10px] font-mono">A</kbd>, <kbd className="px-1 py-0.5 bg-neutral-100 border rounded text-[10px] font-mono">B</kbd>, <kbd className="px-1 py-0.5 bg-neutral-100 border rounded text-[10px] font-mono">C</kbd>, <kbd className="px-1 py-0.5 bg-neutral-100 border rounded text-[10px] font-mono">D</kbd>).
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-black">Google Drive & HMAC Security</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Questions are synced live from Google Drive with server-side option shuffling and HMAC token verification to guarantee tamper-proof practice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Interface Mockup Showcase */}
        <section className="py-20 px-4 bg-white border-b border-neutral-100">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-black">Platform Workspace Preview</h2>
              <p className="text-xs text-neutral-500">Minimal, clean, and distraction-free problem solving.</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-900 p-3 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-800 bg-neutral-950">
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
                <span className="text-[11px] font-mono text-neutral-400 ml-2">bsprep.in/dashboard/quiz-prep</span>
              </div>
              <div className="bg-white p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-black" />
                    <span className="font-bold text-sm text-black">Mathematics I &bull; Quiz 1</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">Q 1 / 10 &bull; 04:12</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-xl bg-neutral-50 space-y-2">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Question</span>
                    <p className="text-sm font-medium text-black">Let f: R &rarr; R be defined by f(x) = x^2 + 4x + 5. What is the minimum value of f(x)?</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Options</span>
                    {["Minimum value is 5 at x = 0", "Minimum value is 1 at x = -2", "Minimum value is -1 at x = 2", "Minimum value is 0 at x = -4"].map((opt, i) => (
                      <div key={i} className={`p-3 rounded-lg border text-xs flex items-center gap-3 ${i === 1 ? "border-black font-semibold bg-neutral-50" : "border-neutral-200"}`}>
                        <span className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center font-mono font-bold text-[10px]">{["A", "B", "C", "D"][i]}</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Banner */}
        <section className="py-20 px-4 bg-neutral-50 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold text-black">Ready to Prepare for Your Next Quiz?</h2>
            <p className="text-sm text-neutral-600">
              Sign in to your BSPrep account to access all course question banks and track your progress.
            </p>
            <div className="pt-2">
              {isAuthenticated ? (
                <Link href="/dashboard/quiz-prep">
                  <Button className="bg-[#0a192f] hover:bg-[#112a52] text-white px-8 h-12 text-sm font-bold rounded-full transition-all uppercase tracking-wider shadow-md">
                    GO TO DASHBOARD QUIZ PREP
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => setLoginOpen(true)}
                  className="bg-[#0a192f] hover:bg-[#112a52] text-white px-8 h-12 text-sm font-bold rounded-full transition-all uppercase tracking-wider shadow-md"
                >
                  SIGN IN / SIGN UP NOW
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignUp={() => {
          setLoginOpen(false)
          setSignUpOpen(true)
        }}
        onSwitchToForgotPassword={() => {
          setLoginOpen(false)
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
    </div>
  )
}
