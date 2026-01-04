"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calculator, Plus, Trash2, ArrowLeft, BookOpen } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface Course {
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
  { label: "E (5)", value: 5 },
  { label: "U (0)", value: 0 },
]

export default function SemesterGPACalculator() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "", credits: 0, gradePoints: 0 },
  ])
  const [gpa, setGpa] = useState<number | null>(null)

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true'
    setIsAuthenticated(authStatus)
    if (!authStatus) {
      router.push('/signin')
    }
  }, [router])

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: "",
      credits: 0,
      gradePoints: 0,
    }
    setCourses([...courses, newCourse])
  }

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter((course) => course.id !== id))
    }
  }

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    )
  }

  const calculateGPA = () => {
    const validCourses = courses.filter((c) => c.credits > 0 && c.name.trim() !== "")
    
    if (validCourses.length === 0) {
      alert("Please add at least one course with valid credits and name.")
      return
    }

    const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0)
    const totalGradePoints = validCourses.reduce(
      (sum, course) => sum + course.credits * course.gradePoints,
      0
    )

    const calculatedGPA = totalGradePoints / totalCredits
    setGpa(calculatedGPA)
  }

  const resetCalculator = () => {
    setCourses([{ id: "1", name: "", credits: 0, gradePoints: 0 }])
    setGpa(null)
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
              Semester <span className="text-primary">GPA Calculator</span>
            </h1>
            <p className="text-white/70 text-lg">Calculate your semester GPA based on course credits and grades</p>
          </div>

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
              {courses.map((course, index) => (
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
                        className="w-full p-3 rounded-lg bg-black/50 border border-primary/30 text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.25rem',
                        }}
                      >
                        <option value={0}>Select Grade</option>
                        {gradePointsOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delete Button */}
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        onClick={() => removeCourse(course.id)}
                        disabled={courses.length === 1}
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

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={calculateGPA}
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calculate GPA
            </button>
            <button
              onClick={resetCalculator}
              className="px-6 py-3 rounded-lg border border-primary/30 text-white hover:border-primary transition-all duration-300"
            >
              Reset
            </button>
          </div>

          {/* Results */}
          {gpa !== null && (
            <div className="glass-dark rounded-xl p-8 border border-primary/30">
              <h3 className="text-white font-semibold text-xl mb-6 text-center">
                Your Semester GPA
              </h3>
              <div className="text-center">
                <div className="inline-block">
                  <p className="text-7xl font-bold text-primary mb-2">
                    {gpa.toFixed(2)}
                  </p>
                  <p className="text-white/60 text-sm">out of 10.00</p>
                </div>
              </div>
              
              {/* Summary */}
              <div className="mt-8 pt-6 border-t border-primary/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-1">Total Courses</p>
                    <p className="text-2xl font-semibold text-white">
                      {courses.filter((c) => c.credits > 0 && c.name.trim() !== "").length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-1">Total Credits</p>
                    <p className="text-2xl font-semibold text-white">
                      {courses.reduce((sum, c) => sum + c.credits, 0).toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-1">Performance</p>
                    <p className="text-2xl font-semibold text-primary">
                      {gpa >= 9 ? "Excellent" : gpa >= 8 ? "Very Good" : gpa >= 7 ? "Good" : gpa >= 6 ? "Average" : "Needs Improvement"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
