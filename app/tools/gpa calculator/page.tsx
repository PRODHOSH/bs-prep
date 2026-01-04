"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { courseData } from "@/lib/gpa/course-data"
import { calculateScore } from "@/lib/gpa/calculate-score"
import { assignGrade } from "@/lib/gpa/grade-utils"
import type { Course } from "@/lib/gpa/types"
import { Calculator, BookOpen, GraduationCap, ArrowLeft, Plus, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface SemesterCourse {
  id: string
  name: string
  credits: number
  gradePoints: number
}

const gradePointsOptions = [
  { label: "S (10)", value: 10 },
  { label: "A (9)", value: 9 },
  { label: "B (8)", value: 8 },
  { label: "C (7)", value: 7 },
  { label: "D (6)", value: 6 },
  { label: "E (4)", value: 4 },
  { label: "U (0)", value: 0 },
]

export default function GPACalculator() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<"course" | "semester">("course")
  
  // Course Grade Calculator State
  const [selectedDegree, setSelectedDegree] = useState<"data-science" | "electronic-systems" | "">("")
  const [selectedLevel, setSelectedLevel] = useState<"foundation" | "diploma" | "degree" | "">("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formValues, setFormValues] = useState<Record<string, number>>({})
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null)
  const [calculatedGrade, setCalculatedGrade] = useState<string | null>(null)

  // Semester GPA Calculator State
  const [semesterCourses, setSemesterCourses] = useState<SemesterCourse[]>([
    { id: "1", name: "", credits: 0, gradePoints: 0 },
  ])

  // Auto-calculate GPA whenever courses change
  const semesterGPA = (() => {
    const validCourses = semesterCourses.filter((c) => c.credits > 0 && c.gradePoints > 0)
    
    if (validCourses.length === 0) {
      return null
    }

    const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0)
    const totalGradePoints = validCourses.reduce(
      (sum, course) => sum + course.credits * course.gradePoints,
      0
    )

    return totalGradePoints / totalCredits
  })()

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true'
    setIsAuthenticated(authStatus)
    if (!authStatus) {
      router.push('/signin')
    }
  }, [router])

  // Filter courses based on degree and level
  const availableLevels = selectedDegree
    ? Array.from(new Set(courseData.filter((c) => c.degree === selectedDegree).map((c) => c.level)))
    : []

  const availableCourses =
    selectedDegree && selectedLevel
      ? courseData.filter((c) => c.degree === selectedDegree && c.level === selectedLevel)
      : []

  const handleDegreeChange = (degree: "data-science" | "electronic-systems") => {
    setSelectedDegree(degree)
    setSelectedLevel("")
    setSelectedCourse(null)
    setFormValues({})
    setCalculatedScore(null)
    setCalculatedGrade(null)
  }

  const handleLevelChange = (level: "foundation" | "diploma" | "degree") => {
    setSelectedLevel(level)
    setSelectedCourse(null)
    setFormValues({})
    setCalculatedScore(null)
    setCalculatedGrade(null)
  }

  const handleCourseChange = (courseId: string) => {
    const course = availableCourses.find((c) => c.id === courseId)
    setSelectedCourse(course || null)
    setFormValues({})
    setCalculatedScore(null)
    setCalculatedGrade(null)
  }

  const handleInputChange = (fieldId: string, value: string, maxValue: number) => {
    const numValue = parseFloat(value) || 0
    // Clamp value between 0 and max
    const clampedValue = Math.max(0, Math.min(numValue, maxValue))
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: clampedValue,
    }))
  }

  const handleCalculate = () => {
    if (!selectedCourse) return

    try {
      let score = calculateScore(selectedCourse.id, formValues)
      
      // Add bonus marks only if base score is >= 40
      const bonusMarks = formValues.Bonus || 0
      if (score >= 40 && bonusMarks > 0) {
        score = Math.min(score + bonusMarks, 100)
      }
      
      const grade = assignGrade(score)
      setCalculatedScore(score)
      setCalculatedGrade(grade)

      // Convert grade to grade points and add to semester courses
      const gradeToPoints: Record<string, number> = {
        'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 4, 'U': 0, 'F': 0
      }
      const gradePoints = gradeToPoints[grade] || 0

      // Default credits to 4 (standard for most courses)
      const credits = 4

      // Check if course already exists in semester courses
      const existingCourseIndex = semesterCourses.findIndex(
        c => c.name.toLowerCase() === selectedCourse.name.toLowerCase()
      )

      if (existingCourseIndex !== -1) {
        // Update existing course
        const updatedCourses = [...semesterCourses]
        updatedCourses[existingCourseIndex] = {
          ...updatedCourses[existingCourseIndex],
          credits: credits,
          gradePoints: gradePoints
        }
        setSemesterCourses(updatedCourses)
      } else {
        // Add new course
        const newCourse: SemesterCourse = {
          id: Date.now().toString(),
          name: selectedCourse.name,
          credits: credits,
          gradePoints: gradePoints
        }
        
        // Remove empty placeholder course if it exists
        const filteredCourses = semesterCourses.filter(c => c.name.trim() !== "" || c.credits > 0 || c.gradePoints > 0)
        setSemesterCourses([...filteredCourses, newCourse])
      }
    } catch (error) {
      console.error("Error calculating score:", error)
      alert("Error calculating score. Please check your inputs.")
    }
  }

  const handleReset = () => {
    setFormValues({})
    setCalculatedScore(null)
    setCalculatedGrade(null)
  }

  // Semester GPA Calculator Functions
  const addCourse = () => {
    const newCourse: SemesterCourse = {
      id: Date.now().toString(),
      name: "",
      credits: 0,
      gradePoints: 0,
    }
    setSemesterCourses([...semesterCourses, newCourse])
  }

  const removeCourse = (id: string) => {
    if (semesterCourses.length > 1) {
      setSemesterCourses(semesterCourses.filter((course) => course.id !== id))
    }
  }

  const updateCourse = (id: string, field: keyof SemesterCourse, value: string | number) => {
    setSemesterCourses(
      semesterCourses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    )
  }

  const resetSemesterCalculator = () => {
    setSemesterCourses([{ id: "1", name: "", credits: 0, gradePoints: 0 }])
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <div className="flex-1 py-20 px-4 sm:px-6 lg:px-8">
        {/* Background animations */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/tools"
            className="inline-flex items-center gap-2 text-white/70 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tools
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              GPA <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-white/70 text-lg">Calculate your course scores and semester GPA</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="glass-dark rounded-xl p-2 border border-primary/30 inline-flex gap-2 w-full max-w-md">
              <button
                onClick={() => setActiveTab("course")}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === "course"
                    ? "bg-primary text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Course Grade
              </button>
              <button
                onClick={() => setActiveTab("semester")}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === "semester"
                    ? "bg-primary text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Semester GPA
              </button>
            </div>
          </div>

          {/* Course Grade Calculator */}
          {activeTab === "course" && (
            <>

          {/* Selection Cards */}
          <div className="glass-dark rounded-xl p-8 border border-primary/30 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Degree Program */}
              <div>
                <label className="block text-white/70 text-sm mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Degree Program
                </label>
                <select
                  value={selectedDegree}
                  onChange={(e) => handleDegreeChange(e.target.value as "data-science" | "electronic-systems")}
                  className="w-full p-4 rounded-lg bg-black/50 border border-primary/30 text-white focus:outline-none focus:border-primary hover:border-primary/60 transition-all duration-300 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem',
                  }}
                >
                  <option value="" style={{backgroundColor: '#000', color: '#fff'}}>Select Degree</option>
                  <option value="data-science" style={{backgroundColor: '#000', color: '#fff'}}>Data Science</option>
                  <option value="electronic-systems" style={{backgroundColor: '#000', color: '#fff'}}>Electronic Systems</option>
                </select>
              </div>

              {/* Course Level */}
              <div>
                <label className="block text-white/70 text-sm mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Course Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => handleLevelChange(e.target.value as "foundation" | "diploma" | "degree")}
                  disabled={!selectedDegree}
                  className="w-full p-4 rounded-lg bg-black/50 border border-primary/30 text-white focus:outline-none focus:border-primary hover:border-primary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem',
                  }}
                >
                  <option value="" style={{backgroundColor: '#000', color: '#fff'}}>Select Level</option>
                  {availableLevels.map((level) => (
                    <option key={level} value={level} className="capitalize" style={{backgroundColor: '#000', color: '#fff'}}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-white/70 text-sm mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  Course Name
                </label>
                <select
                  value={selectedCourse?.id || ""}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  disabled={!selectedLevel || availableCourses.length === 0}
                  className="w-full p-4 rounded-lg bg-black/50 border border-primary/30 text-white focus:outline-none focus:border-primary hover:border-primary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem',
                  }}
                >
                  <option value="" style={{backgroundColor: '#000', color: '#fff'}}>Select Course</option>
                  {availableCourses.map((course) => (
                    <option key={course.id} value={course.id} style={{backgroundColor: '#000', color: '#fff'}}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Course Formula & Input Fields */}
          {selectedCourse && (
            <>
              {/* Course Info Card */}
              <div className="glass-dark rounded-xl p-8 border border-primary/30 mb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-2xl mb-2">{selectedCourse.name}</h3>
                    <p className="text-white/60">
                      Enter your scores below to calculate your final grade. All fields are optional - leave empty for 0.
                    </p>
                  </div>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-primary/20">
                  <p className="text-white/50 text-xs mb-2">Grading Formula</p>
                  <p className="text-primary font-mono text-sm">{selectedCourse.formula}</p>
                </div>
              </div>

              {/* Input Fields */}
              <div className="glass-dark rounded-xl p-8 border border-primary/30 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedCourse.formFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-white/70 text-sm mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {field.label}
                        <svg className="w-3 h-3 text-white/40 ml-auto cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" title={field.description}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={field.max}
                          step="0.01"
                          value={formValues[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value, field.max)}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value) || 0
                            if (val > field.max) handleInputChange(field.id, field.max.toString(), field.max)
                            if (val < 0) handleInputChange(field.id, "0", field.max)
                          }}
                          placeholder={`0-${field.max}`}
                          className="w-full p-3 pr-12 rounded-lg bg-black/50 border border-primary/30 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {formValues[field.id] ? (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-white/20"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bonus Marks Field - Common for all courses */}
                <div className="mt-6 pt-6 border-t border-primary/20">
                  <label className="block text-white/70 text-sm mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    Bonus Marks
                    <svg className="w-3 h-3 text-white/40 ml-auto cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Bonus marks (0-5) are added only if base score is 40 or above">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </label>
                  <div className="relative max-w-md">
                    <input
                      type="number"
                      min="0"
                      max={5}
                      step="0.5"
                      value={formValues.Bonus || ""}
                      onChange={(e) => handleInputChange("Bonus", e.target.value, 5)}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        if (val > 5) handleInputChange("Bonus", "5", 5)
                        if (val < 0) handleInputChange("Bonus", "0", 5)
                      }}
                      placeholder="0-5"
                      className="w-full p-3 pr-12 rounded-lg bg-black/50 border border-primary/30 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">/5</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleCalculate}
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Calculate Score & Add to Semester
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-lg border border-primary/30 text-white hover:border-primary transition-all duration-300"
                >
                  Reset
                </button>
              </div>

              {/* Results */}
              {calculatedScore !== null && calculatedGrade !== null && (
                <div className="glass-dark rounded-xl p-8 border border-primary/30">
                  <h3 className="text-white font-semibold text-xl mb-4 text-center">Your Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-white/70 mb-2">Total Score</p>
                      <p className="text-5xl font-bold text-primary">{calculatedScore.toFixed(2)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 mb-2">Grade</p>
                      <p className="text-5xl font-bold text-primary">{calculatedGrade}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          </>
          )}

          {/* Semester GPA Calculator */}
          {activeTab === "semester" && (
            <>
              {/* Formula Card */}
              <div className="glass-dark rounded-xl p-6 border border-primary/30 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-white font-semibold">GPA Formula</h3>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-primary/20">
                  <p className="text-primary font-mono text-sm">
                    GPA = Σ(Credits × Grade Points) / Σ(Credits)
                  </p>
                </div>
              </div>

              {/* Courses Input */}
              <div className="glass-dark rounded-xl p-8 border border-primary/30 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-xl">Your Courses</h3>
                  <button
                    onClick={addCourse}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Course
                  </button>
                </div>

                <div className="space-y-4">
                  {semesterCourses.map((course, index) => (
                    <div
                      key={course.id}
                      className="bg-black/30 rounded-lg p-4 border border-primary/20"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Course Name */}
                        <div className="md:col-span-5">
                          <label className="block text-white/70 text-sm mb-2">
                            Course Name
                          </label>
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) =>
                              updateCourse(course.id, "name", e.target.value)
                            }
                            placeholder="e.g., Mathematics I"
                            className="w-full p-3 rounded-lg bg-black/50 border border-primary/30 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        {/* Credits */}
                        <div className="md:col-span-3">
                          <label className="block text-white/70 text-sm mb-2">
                            Credits
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={course.credits || ""}
                            onChange={(e) =>
                              updateCourse(
                                course.id,
                                "credits",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            className="w-full p-3 rounded-lg bg-black/50 border border-primary/30 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        {/* Grade Points */}
                        <div className="md:col-span-3">
                          <label className="block text-white/70 text-sm mb-2">
                            Grade
                          </label>
                          <select
                            value={course.gradePoints}
                            onChange={(e) =>
                              updateCourse(
                                course.id,
                                "gradePoints",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full p-3 rounded-lg bg-black/50 border border-primary/30 text-white focus:outline-none focus:border-primary hover:border-primary/60 transition-all duration-300 appearance-none cursor-pointer"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.5rem center',
                              backgroundSize: '1.25rem',
                            }}
                          >
                            <option value={0} style={{backgroundColor: '#000', color: '#fff'}}>Select Grade</option>
                            {gradePointsOptions.map((option) => (
                              <option key={option.value} value={option.value} style={{backgroundColor: '#000', color: '#fff'}}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Delete Button */}
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            onClick={() => removeCourse(course.id)}
                            disabled={semesterCourses.length === 1}
                            className="p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Remove course"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={resetSemesterCalculator}
                  className="px-6 py-3 rounded-lg border border-primary/30 text-white hover:border-primary transition-all duration-300"
                >
                  Reset All
                </button>
              </div>

              {/* Results - Always visible when there are valid courses */}
              {semesterGPA !== null && (
                <div className="relative glass-dark rounded-2xl p-8 border-2 border-primary/50 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl"></div>
                  <div className="relative">
                    <h3 className="text-white font-semibold text-xl mb-6 text-center">
                      Your Semester GPA
                    </h3>
                    <div className="text-center mb-8">
                      <div className="inline-block bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-2xl border border-primary/30">
                        <p className="text-7xl font-bold text-primary mb-2 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                          {semesterGPA.toFixed(2)}
                        </p>
                        <p className="text-white/60 text-sm">out of 10.00</p>
                      </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-6 pt-6 border-t border-primary/20">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center glass-dark p-4 rounded-xl border border-primary/20">
                          <p className="text-white/70 text-sm mb-1">Total Courses</p>
                          <p className="text-2xl font-semibold text-white">
                            {semesterCourses.filter((c) => c.credits > 0 && c.gradePoints > 0).length}
                          </p>
                        </div>
                        <div className="text-center glass-dark p-4 rounded-xl border border-primary/20">
                          <p className="text-white/70 text-sm mb-1">Total Credits</p>
                          <p className="text-2xl font-semibold text-white">
                            {semesterCourses.filter((c) => c.credits > 0 && c.gradePoints > 0).reduce((sum, c) => sum + c.credits, 0).toFixed(1)}
                          </p>
                        </div>
                        <div className="text-center glass-dark p-4 rounded-xl border border-primary/20">
                          <p className="text-white/70 text-sm mb-1">Performance</p>
                          <p className="text-2xl font-semibold text-primary">
                            {semesterGPA >= 9 ? "Excellent" : semesterGPA >= 8 ? "Very Good" : semesterGPA >= 7 ? "Good" : semesterGPA >= 6 ? "Average" : "Needs Improvement"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
