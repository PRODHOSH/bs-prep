'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BookOpen, Search, Package, CheckCircle2, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Course {
  id: string
  title: string
  description: string
  level: string
  type: string
  courseType?: string
  weeks: number
  price: number
  originalPrice?: number
  thumbnail: string
  includesCourses?: number
  withCertificate?: boolean
  available?: boolean
}

const courses: Course[] = [
  // Available Qualifier Courses
  {
    id: "qualifier-math-1",
    title: "Mathematics for Data Science I",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Master fundamental math concepts",
    thumbnail: "/courses/math.png",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-stats-1",
    title: "Statistics for Data Science I",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Learn statistical thinking & analysis",
    thumbnail: "/courses/stats.png",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-computational-thinking",
    title: "Computational Thinking",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Build problem-solving skills",
    thumbnail: "/courses/ct.png",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-english-1",
    title: "English I",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Essential communication skills",
    thumbnail: "/courses/english.png",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-python",
    title: "Programming in Python",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Learn Python from scratch and build real-world applications.",
    thumbnail: "/courses/python.png",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-java",
    title: "Programming in Java",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Master Object Oriented Programming principles with Java.",
    thumbnail: "/courses/java.png",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  
  // Foundation Courses (Coming Soon)
  {
    id: "foundation-math-2",
    title: "Mathematics for Data Science II",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Advanced mathematical concepts",
    thumbnail: "/courses/math.png",
    price: 129,
    originalPrice: 149,
    available: false,
    withCertificate: true
  },
  {
    id: "foundation-stats-2",
    title: "Statistics for Data Science II",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Advanced statistical methods",
    thumbnail: "/courses/stats.png",
    price: 129,
    originalPrice: 149,
    available: false,
    withCertificate: true
  },
  {
    id: "foundation-programming-python",
    title: "Programming in Python",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Python for data analysis",
    thumbnail: "/courses/ct.png",
    price: 129,
    originalPrice: 149,
    available: false,
    withCertificate: true
  },
  {
    id: "foundation-english-2",
    title: "English II",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Advanced communication skills",
    thumbnail: "/courses/english.png",
    price: 129,
    originalPrice: 149,
    available: false,
    withCertificate: true
  }
]

export default function ExploreCourses() {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"explore" | "my">("my")
  const supabase = createClient()

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      // Fetch user's enrollments
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id)

        if (!enrollError && enrollments) {
          setEnrolledCourseIds(enrollments.map(e => e.course_id))
        }
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const levelMatch = selectedLevel === "all" || course.level === selectedLevel
    const searchMatch = searchQuery === "" || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const tabMatch = activeTab === "explore" || enrolledCourseIds.includes(course.id)
    return levelMatch && searchMatch && tabMatch
  })

  const getCourseTypeStyles = (courseType: string) => {
    switch (courseType) {
      case "skill-path":
        return {
          bg: "bg-gradient-to-r from-cyan-50 to-cyan-100",
          text: "text-cyan-900",
          label: "Skill path",
          border: "border-l-4 border-cyan-500"
        }
      case "course":
        return {
          bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
          text: "text-emerald-900",
          label: "Course",
          border: "border-l-4 border-emerald-500"
        }
      case "career-path":
        return {
          bg: "bg-gradient-to-r from-slate-800 to-slate-900",
          text: "text-white",
          label: "Career path",
          border: "border-l-4 border-amber-500"
        }
      case "free-course":
        return {
          bg: "bg-gradient-to-r from-lime-100 to-lime-200",
          text: "text-lime-950",
          label: "Free course",
          border: "border-l-4 border-lime-600"
        }
      default:
        return {
          bg: "bg-gradient-to-r from-slate-50 to-slate-100",
          text: "text-black",
          label: "Course",
          border: "border-l-4 border-slate-400"
        }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-8 pb-4 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-black">
              Courses
            </h1>
            <p className="text-base text-black/60">
              Master IITM BS curriculum with structured video courses in Tamil
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab("my")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "my"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              My Courses
              {enrolledCourseIds.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === "my" ? "bg-black text-white" : "bg-gray-300 text-gray-600"
                }`}>{enrolledCourseIds.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "explore"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Explore Courses
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
              <Input
                type="text"
                placeholder="Search IITM BS courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-white border-[#E5E5E5] focus:border-[#3e3098] focus:ring-[#3e3098] rounded-lg text-black placeholder:text-black/50 text-sm"
                suppressHydrationWarning
              />
            </div>
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 h-10 bg-white border border-[#E5E5E5] rounded-lg text-black text-sm focus:border-[#3e3098] focus:ring-[#3e3098] focus:outline-none min-w-[140px]"
              suppressHydrationWarning
            >
              <option value="all">All Levels</option>
              <option value="qualifier">Qualifier</option>
              <option value="foundation">Foundation</option>
              <option value="diploma">Diploma</option>
              <option value="degree">Degree</option>
            </select>
          </div>

          {/* Package Deals */}
          {activeTab === "explore" && (selectedLevel === "all" || selectedLevel === "qualifier") && searchQuery === "" && (
            <div className="grid grid-cols-1 gap-4 mb-6">
              <Link href="/payment/bundle" className="cursor-pointer group block">
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
                        <p className="text-3xl font-semibold text-[#111111] tracking-[-0.5px] leading-none">₹1499</p>
                        <p className="text-xs text-[#10b981] font-medium mt-0.5">Save ₹500</p>
                      </div>
                      <span className="inline-flex items-center h-10 bg-[#111111] group-hover:bg-[#242424] text-white text-sm font-semibold px-5 rounded-lg transition-colors">
                        Get Package Deal
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/payment/core-3-bundle" className="cursor-pointer group block">
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
                </Link>

                <Link href="/payment/coding-bundle" className="cursor-pointer group block">
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
                </Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#51b206] mx-auto"></div>
              <p className="text-black/70 mt-4">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-black/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">
                {activeTab === "my" ? "No enrolled courses yet" : "No courses found"}
              </h3>
              <p className="text-black/70 mb-6">
                {activeTab === "my"
                  ? "Enroll in a course to see it here"
                  : "Try adjusting your search query"}
              </p>
              {activeTab === "my" && (
                <button
                  onClick={() => setActiveTab("explore")}
                  className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-black/80 transition-colors"
                >
                  Explore Courses
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map(course => {
                const isAvailable = course.available !== false
                const isEnrolled = enrolledCourseIds.includes(course.id)
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
                        {/* Level & Enrolled badges over image */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
                            course.level === "qualifier"
                              ? "bg-white text-[#10b981] border border-[#10b981]/20"
                              : "bg-white text-[#6b7280] border border-[#e5e7eb]"
                          }`}>
                            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                          </span>
                          {isEnrolled && isAvailable && (
                            <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm bg-[#111111] text-white border border-[#111111]/20">
                              Enrolled
                            </span>
                          )}
                        </div>
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
                          {course.price && !isEnrolled ? (
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
    </div>
  )
}

