"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Lock, Play, Clock, Star } from "lucide-react"

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
  // Qualifier Courses (Always Free, 4 weeks)
  {
    id: "qualifier-python",
    title: "Python Programming Basics",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Learn Python fundamentals with hands-on examples",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400"
  },
  {
    id: "qualifier-math",
    title: "Mathematics Foundation",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Essential mathematical concepts for data science",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400"
  },
  {
    id: "qualifier-stats",
    title: "Statistics Primer",
    level: "qualifier",
    type: "free",
    weeks: 4,
    description: "Introduction to statistical thinking and analysis",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"
  },
  
  // Foundation Courses
  {
    id: "foundation-python-advanced",
    title: "Python for Data Science",
    level: "foundation",
    type: "free",
    weeks: 12,
    description: "Advanced Python programming for data analysis",
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400"
  },
  {
    id: "foundation-statistics",
    title: "Statistics for Data Science",
    level: "foundation",
    type: "paid",
    weeks: 12,
    description: "Comprehensive statistical methods and applications",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"
  },
  
  // Diploma Courses
  {
    id: "diploma-ml",
    title: "Machine Learning Fundamentals",
    level: "diploma",
    type: "paid",
    weeks: 12,
    description: "Core ML algorithms and practical implementations",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400"
  },
  {
    id: "diploma-database",
    title: "Database Management Systems",
    level: "diploma",
    type: "free",
    weeks: 12,
    description: "SQL, NoSQL, and database design principles",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400"
  },
  
  // Degree Courses
  {
    id: "degree-deep-learning",
    title: "Deep Learning",
    level: "degree",
    type: "paid",
    weeks: 12,
    description: "Neural networks, CNNs, RNNs, and transformers",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400"
  },
  {
    id: "degree-nlp",
    title: "Natural Language Processing",
    level: "degree",
    type: "paid",
    weeks: 12,
    description: "Text processing, sentiment analysis, and language models",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400"
  }
]

export default function CoursesPage() {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

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
    return levelMatch && typeMatch
  })

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "qualifier": return "bg-[#51b206]/20 text-[#51b206] border-[#51b206]/50"
      case "foundation": return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "diploma": return "bg-purple-500/20 text-purple-400 border-purple-500/50"
      case "degree": return "bg-orange-500/20 text-orange-400 border-orange-500/50"
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
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Master IITM BS curriculum with structured video courses
            </p>
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
                    {["qualifier", "foundation", "diploma", "degree"].map(level => (
                      <label key={level} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={() => toggleFilter("level", level)}
                          className="border-slate-600 data-[state=checked]:bg-[#51b206] data-[state=checked]:border-[#51b206]"
                        />
                        <span className="text-slate-400 group-hover:text-white transition-colors capitalize">
                          {level === "qualifier" && "Qualifier (Special)"}
                          {level === "foundation" && "Foundation"}
                          {level === "diploma" && "Diploma"}
                          {level === "degree" && "Degree"}
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
              </div>
            </div>

            {/* RIGHT SIDE - COURSE CARDS */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <p className="text-slate-400">
                  Showing <span className="text-white font-semibold">{filteredCourses.length}</span> courses
                </p>
              </div>

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
                              className={`w-full h-full object-cover ${isLocked ? "blur-sm" : "group-hover:scale-110 transition-transform duration-300"}`}
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
                              {course.level === "qualifier" && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-[#51b206]" fill="#51b206" />
                                  <span className="text-[#51b206]">Special</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-400 text-lg">No courses found matching your filters</p>
                  <button
                    onClick={() => {
                      setSelectedLevels([])
                      setSelectedTypes([])
                    }}
                    className="mt-4 px-6 py-2 bg-[#51b206] hover:bg-[#51b206]/90 text-white rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
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
