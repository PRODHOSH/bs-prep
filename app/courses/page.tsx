"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Lock, Play, Clock, Star, Search } from "lucide-react"

interface Course {
  id: string
  title: string
  level: "qualifier" | "foundation" | "diploma" | "degree"
  type: "free" | "paid"
  weeks: number
  description: string
  thumbnail: string
}

const courses: Course[] = [
  // Qualifier Courses (Always Free)
  {
    id: "qualifier-math-1",
    title: "Mathematics for Data Science I",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Fundamental mathematics concepts for data science",
    thumbnail: "/courses/math.jpg"
  },
  {
    id: "qualifier-stats-1",
    title: "Statistics for Data Science I",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Introduction to statistical thinking and analysis",
    thumbnail: "/courses/stats.jpg"
  },
  {
    id: "qualifier-computational-thinking",
    title: "Computational Thinking",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Problem-solving and algorithmic thinking fundamentals",
    thumbnail: "/courses/ct.jpg"
  },
  {
    id: "qualifier-english-1",
    title: "English I",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Essential English communication skills",
    thumbnail: "/courses/english.jpg"
  },
  
  // Foundation Courses (Paid)
  {
    id: "foundation-math-2",
    title: "Mathematics for Data Science II",
    level: "foundation",
    type: "paid",
    weeks: 12,
    description: "Advanced mathematical concepts for data science",
    thumbnail: "/courses/math.jpg"
  },
  {
    id: "foundation-stats-2",
    title: "Statistics for Data Science II",
    level: "foundation",
    type: "paid",
    weeks: 12,
    description: "Comprehensive statistical methods and applications",
    thumbnail: "/courses/stats.jpg"
  },
  {
    id: "foundation-programming-python",
    title: "Programming in Python",
    level: "foundation",
    type: "paid",
    weeks: 12,
    description: "Python programming for data analysis and applications",
    thumbnail: "/courses/ct.jpg"
  },
  {
    id: "foundation-english-2",
    title: "English II",
    level: "foundation",
    type: "paid",
    weeks: 12,
    description: "Advanced English communication and writing skills",
    thumbnail: "/courses/english.jpg"
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

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Courses
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Master IITM BS curriculum with structured video courses
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search courses by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 text-lg bg-black/80 backdrop-blur-sm border-slate-700 focus:border-[#51b206] focus:ring-[#51b206] rounded-xl text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* LEFT SIDEBAR - FILTERS */}
            <div className="lg:col-span-1">
              <div className="bg-black/80 backdrop-blur-sm border border-slate-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">Filters</h2>

                {/* Program Level Filter */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Program Level</h3>
                  <div className="space-y-3">
                    {["qualifier", "foundation"].map(level => (
                      <label key={level} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={() => toggleFilter("level", level)}
                          className="border-slate-600 data-[state=checked]:bg-[#51b206] data-[state=checked]:border-[#51b206]"
                        />
                        <span className="text-slate-400 group-hover:text-white transition-colors capitalize">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Course Type Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Course Type</h3>
                  <div className="space-y-3">
                    {["free", "paid"].map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleFilter("type", type)}
                          className="border-slate-600 data-[state=checked]:bg-[#51b206] data-[state=checked]:border-[#51b206]"
                        />
                        <span className="text-slate-400 group-hover:text-white transition-colors capitalize">
                          {type}
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
                    className="w-full mt-6 px-4 py-2 text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                  >
                    Reset Filters
                  </button>
                )}

                {/* Clear Search */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="w-full mt-3 px-4 py-2 text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT SIDE - COURSE CARDS */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-slate-400">
                  Showing <span className="text-white font-semibold">{filteredCourses.length}</span> courses
                  {searchQuery && (
                    <span className="ml-2">
                      for "<span className="text-[#51b206]">{searchQuery}</span>"
                    </span>
                  )}
                </p>
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

                  return (
                    <Link
                      key={course.id}
                      href={isLocked ? "#" : `/courses/${course.id}`}
                      className={`group ${isLocked ? "cursor-not-allowed" : ""}`}
                    >
                      <Card className={`relative bg-black/80 backdrop-blur-sm border-slate-800 hover:border-[#51b206]/50 transition-all duration-300 overflow-hidden h-full ${
                        !isLocked ? "hover:scale-105 hover:shadow-xl hover:shadow-[#51b206]/10" : ""
                      }`}>
                        <CardContent className="p-0">
                          {/* Thumbnail */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className={`w-full h-full object-cover object-left ${isLocked ? "blur-sm" : "group-hover:scale-110 transition-transform duration-300"}`}
                            />
                            
                            {/* Overlay for locked courses */}
                            {isLocked && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <div className="text-center">
                                  <Lock className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                                  <p className="text-white font-semibold">Paid Course</p>
                                  <p className="text-sm text-slate-400">Coming Soon</p>
                                </div>
                              </div>
                            )}

                            {/* Play icon for free courses */}
                            {!isLocked && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-16 h-16 text-white" fill="white" />
                              </div>
                            )}

                            {/* Type Badge */}
                            <div className="absolute top-3 right-3">
                              <Badge className={`${
                                course.type === "free"
                                  ? "bg-[#51b206] hover:bg-[#51b206] text-white"
                                  : "bg-amber-500 hover:bg-amber-500 text-white"
                              } font-semibold`}>
                                {course.type === "free" ? "FREE" : "PAID"}
                              </Badge>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            {/* Level Badge */}
                            <Badge className={`${getLevelBadgeColor(course.level)} border mb-3`}>
                              {getLevelLabel(course.level)}
                            </Badge>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                              {course.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                              {course.description}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{course.weeks} weeks</span>
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
