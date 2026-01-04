"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, TrendingUp, AlertCircle } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { courseData } from "@/lib/gpa/course-data"
import { Course } from "@/lib/gpa/types"
import { assignGrade } from "@/lib/gpa/grade-utils"

interface GradePrediction {
  grade: string
  gradePoints: number
  requiredScore: number
  possible: boolean
}

export default function GPAPredictor() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedDegree, setSelectedDegree] = useState<"data-science" | "electronic-systems" | "">("")
  const [selectedLevel, setSelectedLevel] = useState<"foundation" | "diploma" | "degree" | "">("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formValues, setFormValues] = useState<Record<string, number>>({})
  const [predictions, setPredictions] = useState<GradePrediction[]>([])

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
    setPredictions([])
  }

  const handleLevelChange = (level: "foundation" | "diploma" | "degree") => {
    setSelectedLevel(level)
    setSelectedCourse(null)
    setFormValues({})
    setPredictions([])
  }

  const handleCourseChange = (courseId: string) => {
    const course = availableCourses.find((c) => c.id === courseId)
    setSelectedCourse(course || null)
    setFormValues({})
    setPredictions([])
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

  const calculateRequiredScore = (targetScore: number): number | null => {
    if (!selectedCourse) return null

    // Get the course formula structure
    const courseId = selectedCourse.id

    // Try to solve for F (Final exam score)
    // We'll use a numerical approach: try F values from 0 to 100
    for (let f = 0; f <= 100; f += 0.1) {
      const testValues = { ...formValues, F: f }
      const calculatedScore = calculateScoreWithFormula(courseId, testValues)
      
      if (calculatedScore >= targetScore) {
        return Math.ceil(f * 10) / 10 // Round up to 1 decimal
      }
    }

    return null // Not possible with F <= 100
  }

  const calculateScoreWithFormula = (courseId: string, values: Record<string, number>): number => {
    // Import the actual calculation logic from calculate-score.ts
    // For now, we'll implement a simplified version based on common patterns

    switch (courseId) {
      // Foundation Level
      case "mds1":
      case "eng1":
      case "ct":
      case "mds2":
        return Math.min(
          (0.1 * values.GAA +
            Math.max(
              0.6 * values.F + 0.2 * Math.max(values.Qz1 || 0, values.Qz2 || 0),
              0.4 * values.F + 0.2 * (values.Qz1 || 0) + 0.3 * (values.Qz2 || 0),
            )) *
            (1 + 0.01 * (values.Extra || 0)),
          100,
        )

      case "eng2":
        return (
          0.1 * values.GAA +
          Math.max(
            0.6 * values.F + 0.2 * Math.max(values.Qz1 || 0, values.Qz2 || 0),
            0.4 * values.F + 0.2 * (values.Qz1 || 0) + 0.3 * (values.Qz2 || 0),
          )
        )

      case "stats1":
      case "stats2":
        return (
          0.1 * values.GAA +
          Math.max(
            0.6 * values.F + 0.2 * Math.max(values.Qz1 || 0, values.Qz2 || 0),
            0.4 * values.F + 0.2 * (values.Qz1 || 0) + 0.3 * (values.Qz2 || 0),
          ) +
          (values.Extra || 0)
        )

      // Diploma Level
      case "mlf":
        return (
          0.1 * values.GAA +
          Math.max(
            0.6 * values.F + 0.2 * Math.max(values.Qz1 || 0, values.Qz2 || 0),
            0.4 * values.F + 0.2 * (values.Qz1 || 0) + 0.3 * (values.Qz2 || 0),
          )
        )

      case "mlt":
        return (
          0.1 * values.GAA +
          0.4 * values.F +
          Math.max(0.25 * (values.Qz1 || 0) + 0.25 * (values.Qz2 || 0), 0.4 * Math.max(values.Qz1 || 0, values.Qz2 || 0))
        )

      // Degree Level
      case "st":
        return 0.1 * values.GAA + 0.4 * values.F + 0.25 * (values.Qz1 || 0) + 0.25 * (values.Qz2 || 0)

      case "dl":
        return (
          0.1 * values.GAA +
          Math.max(
            0.4 * values.F + 0.25 * (values.Qz1 || 0) + 0.25 * (values.Qz2 || 0),
            0.5 * values.F + 0.3 * Math.max(values.Qz1 || 0, values.Qz2 || 0),
          )
        )

      default:
        // Fallback to a common formula
        return 0.1 * (values.GAA || 0) + 0.5 * values.F + 0.2 * (values.Qz1 || 0) + 0.2 * (values.Qz2 || 0)
    }
  }

  const handlePredict = () => {
    if (!selectedCourse) return

    const gradeThresholds = [
      { grade: "S", gradePoints: 10, minScore: 90 },
      { grade: "A", gradePoints: 9, minScore: 80 },
      { grade: "B", gradePoints: 8, minScore: 70 },
      { grade: "C", gradePoints: 7, minScore: 60 },
      { grade: "D", gradePoints: 6, minScore: 50 },
      { grade: "E", gradePoints: 4, minScore: 40 },
    ]

    const results: GradePrediction[] = gradeThresholds.map(({ grade, gradePoints, minScore }) => {
      const required = calculateRequiredScore(minScore)
      return {
        grade,
        gradePoints,
        requiredScore: required ?? 101,
        possible: required !== null && required <= 100,
      }
    })

    setPredictions(results)
  }

  const handleReset = () => {
    setFormValues({})
    setPredictions([])
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
              <TrendingUp className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              GPA <span className="text-primary">Predictor</span>
            </h1>
            <p className="text-white/70 text-lg">Predict what you need to score in final exam to achieve your target grade</p>
          </div>

          {/* Selection Cards */}
          <div className="glass-dark rounded-xl p-8 border border-primary/30 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Degree Selection */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Degree Program</label>
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
                  <option value="data-science" style={{backgroundColor: '#000', color: '#fff'}}>BS Data Science</option>
                  <option value="electronic-systems" style={{backgroundColor: '#000', color: '#fff'}}>BS Electronic Systems</option>
                </select>
              </div>

              {/* Level Selection */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Course Level</label>
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

              {/* Course Selection */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Course Name</label>
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

          {/* Course Info & Input Fields */}
          {selectedCourse && (
            <>
              {/* Course Info Card */}
              <div className="glass-dark rounded-xl p-8 border border-primary/30 mb-6">
                <h3 className="text-white font-semibold text-xl mb-4">{selectedCourse.name}</h3>
                <div className="bg-black/50 rounded-lg p-4 border border-primary/20">
                  <p className="text-white/70 text-sm mb-2">Formula:</p>
                  <p className="text-primary font-mono text-sm">{selectedCourse.formula}</p>
                </div>
                <div className="mt-4 flex items-start gap-2 bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-white/80 text-sm">
                    Enter all your marks EXCEPT the final exam. We'll predict what you need to score in the final exam to achieve each grade.
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <div className="glass-dark rounded-xl p-8 border border-primary/30 mb-6">
                <h3 className="text-white font-semibold text-lg mb-6">Enter Your Current Marks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedCourse.formFields
                    .filter((field) => field.id !== "F") // Exclude Final exam
                    .map((field) => (
                      <div key={field.id}>
                        <label className="block text-white/70 text-sm mb-2">
                          {field.label}
                          <span className="text-white/50 text-xs ml-2">(Max: {field.max})</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={field.max}
                          step="0.1"
                          value={formValues[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value, field.max)}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value) || 0
                            if (val > field.max) handleInputChange(field.id, field.max.toString(), field.max)
                            if (val < 0) handleInputChange(field.id, "0", field.max)
                          }}
                          placeholder={field.description}
                          className="w-full p-3 rounded-lg bg-black/50 border border-primary/30 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handlePredict}
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-4 px-8 rounded-lg transition-colors"
                >
                  Predict Required Scores
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-4 rounded-lg border border-primary/30 text-white hover:border-primary transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Predictions Results */}
              {predictions.length > 0 && (
                <div className="relative glass-dark rounded-2xl p-8 border-2 border-primary/50 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl"></div>
                  <div className="relative">
                    <h3 className="text-white font-semibold text-xl mb-6 text-center">
                      Final Exam Score Predictions
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {predictions.map((pred) => (
                        <div
                          key={pred.grade}
                          className={`glass-dark p-6 rounded-xl border-2 transition-all ${
                            pred.possible
                              ? "border-primary/30 hover:border-primary/50"
                              : "border-red-500/30 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center flex-1">
                              <div className={`text-4xl font-bold ${pred.possible ? "text-primary" : "text-red-400"}`}>
                                {pred.grade}
                              </div>
                              <div className="text-white/50 text-xs mt-1">Grade ({pred.gradePoints} points)</div>
                            </div>
                          </div>
                          
                          <div className="text-center pt-3 border-t border-white/10">
                            {pred.possible ? (
                              <>
                                <p className="text-white/70 text-sm mb-1">Need to score</p>
                                <p className="text-2xl font-bold text-white">
                                  {pred.requiredScore.toFixed(1)}
                                </p>
                                <p className="text-white/50 text-xs mt-1">marks in final exam</p>
                              </>
                            ) : (
                              <>
                                <p className="text-red-400 font-semibold">Not Possible</p>
                                <p className="text-white/50 text-xs mt-1">Even with 100 in final</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-primary/20">
                      <div className="bg-black/30 rounded-lg p-4 border border-primary/20">
                        <p className="text-white/70 text-sm text-center">
                          💡 <span className="text-white">Tip:</span> Focus on achieving the highest possible grade that's within reach!
                        </p>
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
