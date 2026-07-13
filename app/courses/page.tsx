"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Lock, Search, Package, CheckCircle2, BookOpen } from "lucide-react"

const LoginModal = dynamic(
  () => import("@/components/auth/login-modal").then((m) => ({ default: m.LoginModal })),
  { ssr: false }
)
const SignUpModal = dynamic(
  () => import("@/components/auth/signup-modal").then((m) => ({ default: m.SignUpModal })),
  { ssr: false }
)

import { Course, courses } from "@/lib/course-catalog"

const levelLabels: Record<string, string> = {
  all: "All Levels",
  qualifier: "Qualifier",
  foundation: "Foundation",
  diploma: "Diploma",
  degree: "Degree",
}

export default function CoursesPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  const filteredCourses = courses.filter(course => {
    const levelMatch = selectedLevel === "all" || course.level === selectedLevel
    const searchMatch = searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    return levelMatch && searchMatch
  })

  return (
    <>
      <div className="min-h-screen bg-white">
        <Navbar isAuthenticated={false} />

        {/* Page header */}
        <section className="pt-28 pb-10 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] border border-[#e5e7eb] px-3 py-1 text-xs font-medium text-[#6b7280] mb-4">
              Tamil medium
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold text-[#111111] tracking-[-1.5px] leading-[1.1] mb-3">
              Courses we offer
            </h1>
            <p className="text-[#374151] text-base">
              Master IITM BS curriculum with structured video courses in Tamil
            </p>
          </div>
        </section>

        {/* Filters + content */}
        <section className="pb-24 bg-[#f8f9fa]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">

            {/* Search + Level filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                <Input
                  type="text"
                  placeholder="Search IITM BS courses"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 h-10 bg-white border-[#e5e7eb] focus:border-[#111111] rounded-lg text-[#111111] placeholder:text-[#6b7280] text-sm"
                  suppressHydrationWarning
                />
              </div>

              {/* Level pill tabs */}
              <div className="flex gap-1 bg-[#f5f5f5] border border-[#e5e7eb] rounded-lg p-1">
                {Object.entries(levelLabels).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSelectedLevel(val)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      selectedLevel === val
                        ? "bg-white text-[#111111] shadow-sm"
                        : "text-[#6b7280]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Package deals */}
            {(selectedLevel === "all" || selectedLevel === "qualifier") && searchQuery === "" && (
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div
                  onClick={() => setShowLogin(true)}
                  className="cursor-pointer group"
                >
                  <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 hover:border-[#111111] transition-all duration-200">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-[#f5f5f5] flex items-center justify-center shrink-0">
                          <Package className="w-6 h-6 text-[#111111]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest">Qualifier Bundle</span>
                            <span className="inline-flex rounded-full bg-[#111111] text-white text-[10px] font-semibold px-2 py-0.5 tracking-wide">BEST VALUE</span>
                          </div>
                          <h3 className="text-lg font-semibold text-[#111111] leading-tight tracking-[-0.3px]">All 4 Qualifier Courses</h3>
                          <p className="text-sm text-[#6b7280] mt-0.5">Math, Stats, CT, and English</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                        <div>
                          <p className="text-xs text-[#6b7280] line-through">₹1999</p>
                          <p className="text-3xl font-semibold text-[#111111] tracking-[-0.5px] leading-none">₹1799</p>
                          <p className="text-xs text-[#10b981] font-medium mt-0.5">Save ₹200</p>
                        </div>
                        <span className="inline-flex items-center h-10 bg-[#111111] group-hover:bg-[#242424] text-white text-sm font-semibold px-5 rounded-lg transition-colors">
                          Get Package Deal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setShowLogin(true)}
                    className="cursor-pointer group"
                  >
                    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 hover:border-[#111111] transition-all duration-200 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest">Qualifier Bundle</span>
                        </div>
                        <h3 className="text-lg font-semibold text-[#111111] leading-tight tracking-[-0.3px]">Core 3 Bundle</h3>
                        <p className="text-sm text-[#6b7280] mt-0.5">Math, Stats, and Computational Thinking</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <div>
                          <p className="text-xs text-[#6b7280] line-through">₹1499</p>
                          <p className="text-2xl font-semibold text-[#111111] tracking-[-0.5px] leading-none">₹1199</p>
                        </div>
                        <span className="inline-flex items-center h-10 bg-[#111111] group-hover:bg-[#242424] text-white text-sm font-semibold px-5 rounded-lg transition-colors">
                          Get Deal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setShowLogin(true)}
                    className="cursor-pointer group"
                  >
                    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 hover:border-[#111111] transition-all duration-200 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest">Coding Bundle</span>
                        </div>
                        <h3 className="text-lg font-semibold text-[#111111] leading-tight tracking-[-0.3px]">Python + Java</h3>
                        <p className="text-sm text-[#6b7280] mt-0.5">Master both programming languages</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <div>
                          <p className="text-xs text-[#6b7280] line-through">₹1199</p>
                          <p className="text-2xl font-semibold text-[#111111] tracking-[-0.5px] leading-none">₹999</p>
                        </div>
                        <span className="inline-flex items-center h-10 bg-[#111111] group-hover:bg-[#242424] text-white text-sm font-semibold px-5 rounded-lg transition-colors">
                          Get Deal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Course grid */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-[#e5e7eb] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#111111] mb-2">No courses found</h3>
                <p className="text-[#6b7280] text-sm">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map(course => {
                  const isAvailable = course.available !== false
                  return (
                    <Link
                      key={course.id}
                      href={isAvailable ? `/courses/${course.id}` : "#"}
                      className={`group block h-full ${!isAvailable ? 'pointer-events-none' : ''}`}
                    >
                      <div className="relative bg-white border border-[#e5e7eb] hover:border-[#111111] hover:shadow-md transition-all duration-200 rounded-2xl h-full overflow-hidden flex flex-col">
                        {/* Thumbnail */}
                        <div className="relative w-full overflow-hidden bg-[#f5f5f5]" style={{ aspectRatio: "16/9" }}>
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                          {/* Level badge over image */}
                          <span className={`absolute top-3 left-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
                            course.level === "qualifier"
                              ? "bg-white text-[#10b981] border border-[#10b981]/20"
                              : "bg-white text-[#6b7280] border border-[#e5e7eb]"
                          }`}>
                            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          <span className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-2">IITM BS</span>

                          <h3 className="text-[17px] font-semibold text-[#111111] mb-1.5 line-clamp-2 leading-snug flex-1 tracking-[-0.3px]">
                            {course.title}
                          </h3>
                          <p className="text-[15px] text-[#6b7280] mb-4 line-clamp-1">{course.description}</p>

                          <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb] mt-auto">
                            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{course.weeks} weeks</span>
                            </div>
                            {course.price ? (
                              <div className="flex items-center gap-1.5">
                                {course.originalPrice && (
                                  <span className="text-xs text-[#6b7280] line-through">₹{course.originalPrice}</span>
                                )}
                                <span className="text-lg font-semibold text-[#111111] tracking-[-0.3px]">₹{course.price}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Coming Soon overlay */}
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-2xl">
                            <div className="flex items-center gap-2 bg-[#111111] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg">
                              <Lock className="w-3.5 h-3.5" />
                              Coming Soon
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        onSwitchToSignUp={() => { setShowLogin(false); setShowSignup(true) }}
        onSwitchToForgotPassword={() => setShowLogin(false)}
      />
      <SignUpModal
        open={showSignup}
        onOpenChange={setShowSignup}
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true) }}
      />
    </>
  )
}
