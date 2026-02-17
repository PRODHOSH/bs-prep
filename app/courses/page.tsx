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
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/50"
    }
  }

  const getLevelLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  const getCourseTypeStyles = (courseType: string) => {
    switch (courseType) {
      case "skill-path":
        return {
          bg: "bg-cyan-100",
          text: "text-cyan-900",
          label: "Skill path"
        }
      case "course":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-900",
          label: "Course"
        }
      case "career-path":
        return {
          bg: "bg-slate-900",
          text: "text-white",
          label: "Career path"
        }
      case "free-course":
        return {
          bg: "bg-lime-200",
          text: "text-lime-950",
          label: "Free course"
        }
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-900",
          label: "Course"
        }
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                IITM BS Courses
              </span>
            </h1>
            <p className="text-lg text-slate-400">
              Master IITM BS curriculum with structured video courses in Tamil
            </p>
            <p className="text-sm text-slate-500 mt-2">
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
              <div className="bg-black/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white">Filters</h2>
                  <Badge className="bg-slate-700 text-slate-300 text-xs">{filteredCourses.length} results</Badge>
                </div>

                {/* Program Level Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Level</h3>
                  <div className="space-y-2.5">
                    {["qualifier", "foundation"].map(level => (
                      <label key={level} className="flex items-center gap-2.5 cursor-pointer group">
                        <Checkbox
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={() => toggleFilter("level", level)}
                          className="border-slate-600 data-[state=checked]:bg-[#51b206] data-[state=checked]:border-[#51b206]"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors capitalize">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Course Type Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Price</h3>
                  <div className="space-y-2.5">
                    {["free", "paid"].map(type => (
                      <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleFilter("type", type)}
                          className="border-slate-600 data-[state=checked]:bg-[#51b206] data-[state=checked]:border-[#51b206]"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors capitalize">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Course Type Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Type</h3>
                  <div className="space-y-2.5">
                    {["skill-path", "course", "career-path", "free-course"].map(ct => (
                      <label key={ct} className="flex items-center gap-2.5 cursor-pointer group">
                        <Checkbox
                          className="border-slate-600 data-[state=checked]:bg-[#51b206] data-[state=checked]:border-[#51b206]"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors capitalize">
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
                    className="w-full mt-5 px-3 py-2 text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search IITM BS courses"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 h-10 bg-black/80 backdrop-blur-sm border-slate-700 focus:border-[#51b206] focus:ring-[#51b206] rounded-lg text-white placeholder:text-slate-500 text-sm"
                  />
                </div>
                <select className="px-4 h-10 bg-black/80 backdrop-blur-sm border border-slate-700 rounded-lg text-white text-sm focus:border-[#51b206] focus:ring-[#51b206] focus:outline-none">
                  <option>Most relevant</option>
                  <option>Newest first</option>
                  <option>Oldest first</option>
                  <option>A-Z</option>
                </select>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No courses found</h3>
                  <p className="text-slate-400 mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={() => {
                      setSelectedLevels([])
                      setSelectedTypes([])
                      setSearchQuery("")
                    }}
                    className="px-6 py-3 bg-[#51b206] hover:bg-[#51b206]/90 text-white rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCourses.map(course => {
                  const isPaid = course.type === "paid"
                  const isLocked = isPaid
                  const typeStyles = getCourseTypeStyles(course.courseType)

                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="group"
                    >
                      <Card className="relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-[#51b206]/50 dark:hover:border-[#51b206]/50 transition-all duration-300 overflow-hidden h-full hover:shadow-lg hover:shadow-[#51b206]/10">
                        <CardContent className="p-0 flex flex-col h-full">
                          {/* Colored Header with Type */}
                          <div className={`${typeStyles.bg} ${typeStyles.text} px-4 py-2.5 font-medium text-sm`}>
                            {typeStyles.label}
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-grow flex flex-col">
                            {/* Title */}
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 min-h-[56px]">
                              {course.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-grow">
                              {course.description}
                            </p>

                            {/* Divider */}
                            <div className="border-t border-slate-200 dark:border-slate-700/50 mb-4"></div>

                            {/* Footer Meta Info */}
                            <div className="space-y-3">
                              {/* Includes Courses (if applicable) */}
                              {course.includesCourses && (
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  Includes <span className="font-semibold text-slate-900 dark:text-white">{course.includesCourses} Courses</span>
                                </div>
                              )}

                              {/* Bottom row: Certificate, Level, Duration */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                  {/* Certificate Badge */}
                                  {course.withCertificate && (
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                      <Award className="w-4 h-4" />
                                      <span className="text-xs">With Certificate</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Level and Duration */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                  <BookOpen className="w-4 h-4" />
                                  <span className="text-xs capitalize">{course.level} Friendly</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-xs">{course.weeks * 6} hours</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Locked Overlay for Paid Courses */}
                          {isLocked && (
                            <div className="absolute top-12 right-3">
                              <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-semibold shadow-lg">
                                <Lock className="w-3 h-3 mr-1" />
                                Premium
                              </Badge>
                            </div>
                          )}
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
