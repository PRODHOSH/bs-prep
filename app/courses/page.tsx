"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Lock, Play, Clock, Star, Search, Award, BookOpen } from "lucide-react"

interface Course {
  id: string
  title: string
  level: "qualifier" | "foundation" | "diploma" | "degree"
  type: "free" | "paid"
  courseType: "skill-path" | "course" | "career-path" | "free-course"
  weeks: number
  description: string
  thumbnail: string
  includesCourses?: number
  withCertificate?: boolean
}

const courses: Course[] = [
  // Qualifier Courses (Always Free)
  {
    id: "qualifier-math-1",
    title: "Mathematics for Data Science I",
    level: "qualifier",
    type: "free",
    courseType: "free-course",
    weeks: 4,
    description: "Fundamental mathematics concepts for data science including algebra, calculus, and linear algebra basics.",
    thumbnail: "/courses/math.jpg",
    withCertificate: true
  },
  {
    id: "qualifier-stats-1",
    title: "Statistics for Data Science I",
    level: "qualifier",
    type: "free",
    courseType: "course",
    weeks: 4,
    description: "Introduction to statistical thinking and analysis with practical applications in data science.",
    thumbnail: "/courses/stats.jpg",
    withCertificate: true
  },
  {
    id: "qualifier-computational-thinking",
    title: "Computational Thinking",
    level: "qualifier",
    type: "free",
    courseType: "skill-path",
    weeks: 4,
    description: "Problem-solving and algorithmic thinking fundamentals for programming and data analysis.",
    thumbnail: "/courses/ct.jpg",
    includesCourses: 3,
    withCertificate: true
  },
  {
    id: "qualifier-english-1",
    title: "English I",
    level: "qualifier",
    type: "free",
    courseType: "course",
    weeks: 4,
    description: "Essential English communication skills for academic and professional settings.",
    thumbnail: "/courses/english.jpg",
    withCertificate: true
  },
  
  // Foundation Courses (Paid)
  {
    id: "foundation-math-2",
    title: "Mathematics for Data Science II",
    level: "foundation",
    type: "paid",
    courseType: "career-path",
    weeks: 12,
    description: "Advanced mathematical concepts for data science including multivariable calculus and optimization.",
    thumbnail: "/courses/math.jpg",
    includesCourses: 5,
    withCertificate: true
  },
  {
    id: "foundation-stats-2",
    title: "Statistics for Data Science II",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Comprehensive statistical methods and applications including hypothesis testing and regression.",
    thumbnail: "/courses/stats.jpg",
    withCertificate: true
  },
  {
    id: "foundation-programming-python",
    title: "Programming in Python",
    level: "foundation",
    type: "paid",
    courseType: "skill-path",
    weeks: 12,
    description: "Python programming for data analysis and applications with hands-on projects.",
    thumbnail: "/courses/ct.jpg",
    includesCourses: 4,
    withCertificate: true
  },
  {
    id: "foundation-english-2",
    title: "English II",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Advanced English communication and writing skills for professional development.",
    thumbnail: "/courses/english.jpg",
    withCertificate: true
  }
]

export default function CoursesPage() {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleFilter = (filterType: "level" | "type", value: string) => {
    if (filterType === "level") {
      setSelectedLevels(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    } else {
      setSelectedTypes(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      )
    }
  }

  const filteredCourses = courses.filter(course => {
    const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(course.level)
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(course.type)
    const searchMatch = searchQuery === "" || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    return levelMatch && typeMatch && searchMatch
  })

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "qualifier": return "bg-[#51b206]/20 text-[#51b206] border-[#51b206]/50"
      case "foundation": return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      default: return "bg-slate-500/20 text-black/50 border-slate-500/50"
    }
  }

  const getLevelLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

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
    <div className="min-h-screen bg-[#FEF9E7]">
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-black">
              IITM BS Courses
            </h1>
            <p className="text-lg text-black/70">
              Master IITM BS curriculum with structured video courses in Tamil
            </p>
            <p className="text-sm text-black/60 mt-2">
              🇮🇳 All courses taught in Tamil language for better understanding
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT SIDEBAR - FILTERS */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white border border-[#E5DBC8] rounded-xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-black">Filters</h2>
                  <Badge className="bg-[#F5EFE7] text-black text-xs border border-[#E5DBC8]">{filteredCourses.length} results</Badge>
                </div>

                {/* Program Level Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-black mb-3">Level</h3>
                  <div className="space-y-2.5">
                    {["qualifier", "foundation"].map(level => (
                      <label key={level} className="flex items-center gap-2.5 cursor-pointer group">
                        <Checkbox
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={() => toggleFilter("level", level)}
                          className="border-gray-300 data-[state=checked]:bg-[#3e3098] data-[state=checked]:border-[#3e3098]"
                        />
                        <span className="text-sm text-black/70 group-hover:text-black transition-colors capitalize">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Course Type Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-black mb-3">Price</h3>
                  <div className="space-y-2.5">
                    {["free", "paid"].map(type => (
                      <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleFilter("type", type)}
                          className="border-gray-300 data-[state=checked]:bg-[#3e3098] data-[state=checked]:border-[#3e3098]"
                        />
                        <span className="text-sm text-black/70 group-hover:text-black transition-colors capitalize">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Course Type Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-black mb-3">Type</h3>
                  <div className="space-y-2.5">
                    {["skill-path", "course", "career-path", "free-course"].map(ct => (
                      <label key={ct} className="flex items-center gap-2.5 cursor-pointer group">
                        <Checkbox
                          className="border-gray-300 data-[state=checked]:bg-[#3e3098] data-[state=checked]:border-[#3e3098]"
                        />
                        <span className="text-sm text-black/70 group-hover:text-black transition-colors capitalize">
                          {ct.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset Filters */}
                {(selectedLevels.length > 0 || selectedTypes.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedLevels([])
                      setSelectedTypes([])
                    }}
                    className="w-full mt-5 px-3 py-2 text-sm bg-[#F5EFE7] hover:bg-[#E5DBC8] text-black rounded-lg transition-colors border border-[#E5DBC8]"
                  >
                    Reset All
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT SIDE - COURSE CARDS */}
            <div className="flex-1 min-w-0">
              {/* Search and Sort Bar */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
                  <Input
                    type="text"
                    placeholder="Search IITM BS courses"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 h-10 bg-white border-[#E5DBC8] focus:border-[#3e3098] focus:ring-[#3e3098] rounded-lg text-black placeholder:text-black/50 text-sm"
                  />
                </div>
                <select className="px-4 h-10 bg-white border border-[#E5DBC8] rounded-lg text-black text-sm focus:border-[#3e3098] focus:ring-[#3e3098] focus:outline-none">
                  <option>Most relevant</option>
                  <option>Newest first</option>
                  <option>Oldest first</option>
                  <option>A-Z</option>
                </select>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 text-black/50 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-black mb-2">No courses found</h3>
                  <p className="text-black/70 mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={() => {
                      setSelectedLevels([])
                      setSelectedTypes([])
                      setSearchQuery("")
                    }}
                    className="px-6 py-3 bg-[#3e3098] hover:bg-[#3e3098]/90 text-white rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredCourses.map(course => {
                  const isPaid = course.type === "paid"
                  const isLocked = isPaid
                  const typeStyles = getCourseTypeStyles(course.courseType)

                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="group block h-full"
                    >
                      <Card className="relative bg-white border border-[#E5DBC8] hover:border-[#3e3098] transition-all duration-200 overflow-hidden hover:shadow-md rounded-xl h-full">
                        <CardContent className="p-0 flex flex-col h-full">
                          {/* Top Badge - Certification Path / Course Type */}
                          <div className="px-4 pt-3 pb-2">
                            <span className="inline-block px-2.5 py-1 bg-[#F5EFE7] text-black/70 text-xs font-medium rounded">
                              {typeStyles.label}
                            </span>
                            {isLocked && (
                              <Badge className="ml-2 bg-amber-500 hover:bg-amber-500 text-white text-xs px-2 py-0.5">
                                <Lock className="w-3 h-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>

                          <div className="px-4 pb-4 flex-grow flex flex-col">
                            {/* Course Branding/Provider */}
                            <div className="mb-2">
                              <span className="text-sm font-bold text-[#3e3098]">IITM BS</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-black mb-2 line-clamp-2 leading-tight min-h-[44px]">
                              {course.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-black/70 mb-3 line-clamp-2 leading-relaxed flex-grow">
                              {course.description}
                            </p>

                            {/* Dotted Divider */}
                            <div className="border-t border-dotted border-gray-300 my-3"></div>

                            {/* Includes Courses */}
                            {course.includesCourses && (
                              <>
                                <div className="text-sm text-black/80 mb-2">
                                  Includes <span className="font-semibold text-black">{course.includesCourses} courses</span>
                                </div>
                                <div className="border-t border-dotted border-gray-300 my-3"></div>
                              </>
                            )}

                            {/* Bottom Row: Level and Duration */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1.5 text-black/80">
                                <BookOpen className="w-4 h-4" />
                                <span className="text-sm font-medium capitalize">{course.level}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-black/80">
                                <span className="text-sm font-medium">{course.weeks * 6} hours</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
