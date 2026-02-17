"use client"

import { useState, useEffect } from "react"
import { courseData } from "@/lib/gpa/course-data"
import { calculateScore } from "@/lib/gpa/calculate-score"
import { assignGrade } from "@/lib/gpa/grade-utils"
import type { Course } from "@/lib/gpa/types"
import { Calculator, Plus, Trash2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
      setLoading(false)
    })
  }, [])

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

  const semesterGPA = (() => {
    const validCourses = semesterCourses.filter((c) => c.credits > 0 && c.gradePoints > 0)
    if (validCourses.length === 0) return null
    const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0)
    const totalGradePoints = validCourses.reduce((sum, course) => sum + course.credits * course.gradePoints, 0)
    return totalGradePoints / totalCredits
  })()

  const availableLevels = selectedDegree
    ? Array.from(new Set(courseData.filter((c) => c.degree === selectedDegree).map((c) => c.level)))
    : []

  const availableCourses = selectedDegree && selectedLevel
      ? courseData.filter((c) => c.degree === selectedDegree && c.level === selectedLevel)
      : []

  const handleCalculate = () => {
    if (!selectedCourse) return
    try {
      let score = calculateScore(selectedCourse.id, formValues)
      const bonusMarks = formValues.Bonus || 0
      if (score >= 40 && bonusMarks > 0) {
        score = Math.min(score + bonusMarks, 100)
      }
      const grade = assignGrade(score)
      setCalculatedScore(score)
      setCalculatedGrade(grade)
    } catch (error) {
      console.error("Error calculating score:", error)
    }
  }

  const addCourse = () => {
    setSemesterCourses([...semesterCourses, { id: Date.now().toString(), name: "", credits: 0, gradePoints: 0 }])
  }

  const removeCourse = (id: string) => {
    if (semesterCourses.length > 1) {
      setSemesterCourses(semesterCourses.filter((course) => course.id !== id))
    }
  }

  // Show navbar even during loading to prevent blank page flash
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3e3098] to-[#5842c3] mb-6 shadow-xl">
            <Calculator className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900 dark:text-white">
            GPA Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Calculate your course scores and semester GPA with precision
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 inline-flex gap-2 shadow-lg">
            <button
              onClick={() => setActiveTab("course")}
              className={`px-8 py-3 rounded-xl font-semibol transition-all duration-300 ${
                activeTab === "course" 
                  ? "bg-gradient-to-r from-[#3e3098] to-[#5842c3] text-white shadow-lg" 
                  : "text-slate-600 dark:text-slate-400 hover:text-[#3e3098] dark:hover:text-white"
              }`}
            >
              Course Grade
            </button>
            <button
              onClick={() => setActiveTab("semester")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "semester" 
                  ? "bg-gradient-to-r from-[#3e3098] to-[#5842c3] text-white shadow-lg" 
                  : "text-slate-600 dark:text-slate-400 hover:text-[#3e3098] dark:hover:text-white"
              }`}
            >
              Semester GPA
            </button>
          </div>
        </div>

        {/* Course Grade Calculator */}
        {activeTab === "course" && (
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-5xl mx-auto overflow-hidden">
            {/* Colored Header */}
            <div className="h-2 bg-gradient-to-r from-[#3e3098] to-[#5842c3]"></div>
            
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6 bg-slate-50 dark:bg-slate-800/50">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Calculate Course Grade</CardTitle>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Select your course and enter your scores to get your final grade</p>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              {/* Course Selection */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#3e3098] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3e3098]/10 flex items-center justify-center text-sm font-bold">1</div>
                  Select Course
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Degree Program</Label>
                    <Select value={selectedDegree} onValueChange={(v) => {
                      setSelectedDegree(v as any)
                      setSelectedLevel("")
                      setSelectedCourse(null)
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
                    }}>
                      <SelectTrigger className="h-14 text-base bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-[#3e3098] transition-colors">
                        <SelectValue placeholder="Choose degree" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        <SelectItem value="data-science">Data Science</SelectItem>
                        <SelectItem value="electronic-systems">Electronic Systems</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Level</Label>
                    <Select value={selectedLevel} onValueChange={(v) => {
                      setSelectedLevel(v as any)
                      setSelectedCourse(null)
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
                    }} disabled={!selectedDegree}>
                      <SelectTrigger className="h-14 text-base bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-[#3e3098] transition-colors">
                        <SelectValue placeholder="Choose level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        {availableLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Course</Label>
                    <Select value={selectedCourse?.id || ""} onValueChange={(id) => {
                      const course = availableCourses.find((c) => c.id === id)
                      setSelectedCourse(course || null)
                      setFormValues({})
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
                    }} disabled={!selectedLevel}>
                      <SelectTrigger className="h-14 text-base bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-[#3e3098] transition-colors">
                        <SelectValue placeholder="Choose course" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                        {availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {selectedCourse && (
                <>
                  {/* Score Entry */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[#3e3098] dark:text-[#5842c3] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#3e3098]/10 dark:bg-[#5842c3]/10 flex items-center justify-center text-sm font-bold">2</div>
                      Enter Your Scores
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedCourse.formFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                              <span>{field.label}</span>
                              <span className="text-slate-500 dark:text-slate-400 text-xs">Max: {field.max}</span>
                            </Label>
                            <Input
                              type="number"
                              placeholder={`Enter score (0 - ${field.max})`}
                              value={formValues[field.id] || ""}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(Number(e.target.value), field.max))
                                setFormValues({ ...formValues, [field.id]: val })
                              }}
                              className="h-14 text-base bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:border-[#3e3098] transition-colors"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">{field.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button onClick={handleCalculate} className="flex-1 h-14 bg-gradient-to-r from-[#3e3098] to-[#5842c3] hover:from-[#5842c3] hover:to-[#3e3098] text-white text-base font-bold shadow-lg hover:shadow-xl transition-all">
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Grade
                    </Button>
                    <Button onClick={() => {
                      setFormValues({})
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
                    }} variant="outline" className="h-14 px-8 border-slate-300 dark:border-slate-700 hover:border-[#3e3098] transition-colors font-semibold">
                      Reset
                    </Button>
                  </div>

                  {/* Result */}
                  {calculatedScore !== null && calculatedGrade && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center shadow-2xl">
                      <p className="text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide mb-6 font-bold">✨ Your Final Score</p>
                      <div className="flex items-center justify-center gap-12 flex-wrap">
                        <div>
                          <p className="text-7xl font-black bg-gradient-to-r from-[#3e3098] to-[#5842c3] bg-clip-text text-transparent mb-2">
                            {calculatedScore.toFixed(2)}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">out of 100</p>
                        </div>
                        <div className="h-24 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm mb-2 font-semibold">Grade</p>
                          <div className="text-6xl font-black bg-gradient-to-r from-[#3e3098] to-[#5842c3] bg-clip-text text-transparent">
                            {calculatedGrade}
                          </div>
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
                            {calculatedGrade === 'S' && '🏆 Outstanding!'}
                            {calculatedGrade === 'A' && '⭐ Excellent!'}
                            {calculatedGrade === 'B' && '👍 Great Job!'}
                            {calculatedGrade === 'C' && '✓ Good Work!'}
                            {calculatedGrade === 'D' && '📚 Keep Going!'}
                            {calculatedGrade === 'E' && '💪 Improvement Needed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Semester GPA Calculator */}
        {activeTab === "semester" && (
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-5xl mx-auto overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#3e3098] to-[#5842c3]"></div>
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6 bg-slate-50 dark:bg-slate-800/50">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Calculate Semester GPA</CardTitle>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Add your courses and grades to calculate your GPA</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="col-span-5">
                  <Label className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 font-bold">Course Name</Label>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 font-bold">Credits</Label>
                </div>
                <div className="col-span-4">
                  <Label className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 font-bold">Grade</Label>
                </div>
                <div className="col-span-1"></div>
              </div>

              {/* Course Rows */}
              <div className="space-y-3">
                {semesterCourses.map((course, index) => (
                  <div key={course.id} className="grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <div className="col-span-5">
                      <Input
                        placeholder="e.g., Mathematics I"
                        value={course.name}
                        onChange={(e) => setSemesterCourses(semesterCourses.map(c => 
                          c.id === course.id ? { ...c, name: e.target.value } : c
                        ))}
                        className="h-14 text-base bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:border-[#3e3098] transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="4"
                        value={course.credits || ""}
                        onChange={(e) => setSemesterCourses(semesterCourses.map(c => 
                          c.id === course.id ? { ...c, credits: Number(e.target.value) } : c
                        ))}
                        className="h-14 text-base bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:border-[#3e3098] transition-colors"
                        min="0"
                        max="10"
                      />
                    </div>
                    <div className="col-span-4">
                      <Select value={course.gradePoints.toString()} onValueChange={(v) => 
                        setSemesterCourses(semesterCourses.map(c => 
                          c.id === course.id ? { ...c, gradePoints: Number(v) } : c
                        ))
                      }>
                        <SelectTrigger className="h-14 text-base bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-[#3e3098] transition-colors">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          {gradePointsOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {semesterCourses.length > 1 && (
                        <Button 
                          onClick={() => removeCourse(course.id)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-11 w-11 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={addCourse} variant="outline" className="w-full h-14 border-slate-300 dark:border-slate-700 border-2 border-dashed hover:border-[#3e3098] hover:bg-[#3e3098]/10 hover:text-[#3e3098] transition-all font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Add Another Course
              </Button>

              {semesterGPA !== null && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-10 shadow-2xl">
                  <div className="text-center mb-8">
                    <p className="text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide mb-6 font-bold">✨ Your Semester GPA</p>
                    <p className="text-8xl font-black bg-gradient-to-r from-[#51b206] to-[#3e3098] bg-clip-text text-transparent mb-4">{semesterGPA.toFixed(2)}</p>
                    <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                      {semesterGPA >= 9 ? "🌟 Excellent Performance!" : semesterGPA >= 8 ? "✨ Very Good Work!" : semesterGPA >= 7 ? "👍 Good Progress!" : "📚 Keep Improving!"}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 font-semibold">Total Courses</p>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white">{semesterCourses.filter(c => c.credits > 0).length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 font-semibold">Total Credits</p>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white">{semesterCourses.filter(c => c.credits > 0).reduce((sum, c) => sum + c.credits, 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 font-semibold">Total Points</p>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white">{(semesterCourses.filter(c => c.credits > 0).reduce((sum, c) => sum + c.credits * c.gradePoints, 0)).toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  )
}
