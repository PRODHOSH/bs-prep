"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { courseData } from "@/lib/gpa/course-data"
import { Course } from "@/lib/gpa/types"
import { calculateScore } from "@/lib/gpa/calculate-score"
import { createClient } from "@/lib/supabase/client"

interface GradePrediction {
  grade: string
  gradePoints: number
  requiredScore: number
  possible: boolean
}

export default function GPAPredictor() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
      setLoading(false)
    })
  }, [])

  const [selectedDegree, setSelectedDegree] = useState<"data-science" | "electronic-systems" | "">("")
  const [selectedLevel, setSelectedLevel] = useState<"foundation" | "diploma" | "degree" | "">("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formValues, setFormValues] = useState<Record<string, number>>({})
  const [predictions, setPredictions] = useState<GradePrediction[]>([])

  const availableLevels = selectedDegree
    ? Array.from(new Set(courseData.filter((c) => c.degree === selectedDegree).map((c) => c.level)))
    : []

  const availableCourses = selectedDegree && selectedLevel
      ? courseData.filter((c) => c.degree === selectedDegree && c.level === selectedLevel)
      : []

  const calculateRequiredScore = (targetScore: number): number | null => {
    if (!selectedCourse) return null
    
    for (let f = 0; f <= 100; f += 0.1) {
      const testValues = { ...formValues, F: f }
      try {
        const calculatedScore = calculateScore(selectedCourse.id, testValues)
        if (calculatedScore >= targetScore) {
          return Math.ceil(f * 10) / 10
        }
      } catch {
        return null
      }
    }
    return null
  }

  const handlePredict = () => {
    if (!selectedCourse) return

    const gradeBoundaries = [
      { grade: "S", points: 10, minScore: 90 },
      { grade: "A", points: 9, minScore: 80 },
      { grade: "B", points: 8, minScore: 70 },
      { grade: "C", points: 7, minScore: 60 },
      { grade: "D", points: 6, minScore: 50 },
      { grade: "E", points: 4, minScore: 40 },
    ]

    const newPredictions: GradePrediction[] = gradeBoundaries.map((boundary) => {
      const required = calculateRequiredScore(boundary.minScore)
      return {
        grade: boundary.grade,
        gradePoints: boundary.points,
        requiredScore: required !== null ? required : 101,
        possible: required !== null && required <= 100,
      }
    })

    setPredictions(newPredictions)
  }

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3e3098] to-[#5842c3] mb-6 shadow-xl">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900 dark:text-white">
            GPA Predictor
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Predict what you need in your final exam to achieve your target grade
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-5xl mx-auto overflow-hidden">
          {/* Colored Header */}
          <div className="h-2 bg-gradient-to-r from-[#3e3098] to-[#5842c3]"></div>
          
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6 bg-slate-50 dark:bg-slate-800/50">
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Predict Your Required Scores</CardTitle>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Find out what you need in your final exam to achieve your target grade</p>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {/* Course Selection */}
            <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[#3e3098] dark:text-[#5842c3] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3e3098]/10 dark:bg-[#5842c3]/10 flex items-center justify-center text-sm font-bold">1</div>
                Select Course
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Degree Program</Label>
                  <Select value={selectedDegree} onValueChange={(v) => {
                    setSelectedDegree(v as any)
                    setSelectedLevel("")
                    setSelectedCourse(null)
                    setPredictions([])
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
                    setPredictions([])
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
                    setPredictions([])
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
                  <h3 className="text-lg font-bold text-[#3e3098] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#3e3098]/10 flex items-center justify-center text-sm font-bold">2</div>
                    Enter Current Scores
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">Enter all your scores excluding the final exam (F):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCourse.formFields.filter(f => f.id !== 'F').map((field) => (
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Predict Button */}
                <Button onClick={handlePredict} className="w-full h-14 bg-gradient-to-r from-[#3e3098] to-[#5842c3] hover:from-[#3e3098]/90 hover:to-[#5842c3]/90 text-white text-lg font-bold shadow-lg transition-all">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Predict Required Scores
                </Button>

                {predictions.length > 0 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-[#3e3098] to-[#5842c3] bg-clip-text text-transparent">Required Final Exam Scores</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-base">Based on your current scores, here's what you need in the final exam</p>
                    </div>
                    
                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl">
                      {/* Table Header */}
                      <div className="grid grid-cols-4 gap-4 bg-gradient-to-r from-[#3e3098] to-[#5842c3] p-5">
                        <div className="text-center">
                          <p className="text-white font-bold text-sm uppercase tracking-wider">Target Grade</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-sm uppercase tracking-wider">Grade Points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-sm uppercase tracking-wider">Required Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-sm uppercase tracking-wider">Status</p>
                        </div>
                      </div>
                      
                      {/* Table Rows */}
                      <div className="bg-white dark:bg-slate-900">
                        {predictions.map((pred, index) => (
                          <div
                            key={pred.grade}
                            className={`grid grid-cols-4 gap-4 p-5 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                              index === predictions.length - 1 ? 'border-b-0' : ''
                            }`}
                          >
                            <div className="text-center flex items-center justify-center">
                              <span className="text-4xl font-bold text-slate-900 dark:text-white">{pred.grade}</span>
                            </div>
                            <div className="text-center flex items-center justify-center">
                              <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{pred.gradePoints}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">points</p>
                              </div>
                            </div>
                            <div className="text-center flex items-center justify-center">
                              {pred.possible ? (
                                <div>
                                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{pred.requiredScore.toFixed(1)}%</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">out of 100</p>
                                </div>
                              ) : (
                                <p className="text-2xl font-semibold text-slate-400 dark:text-slate-600">---</p>
                              )}
                            </div>
                            <div className="text-center flex items-center justify-center">
                              {pred.possible ? (
                                pred.requiredScore <= 40 ? (
                                  <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold">
                                    ✓ Easy
                                  </span>
                                ) : pred.requiredScore <= 70 ? (
                                  <span className="px-4 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-400 dark:border-slate-500 text-slate-800 dark:text-slate-200 rounded-full text-sm font-semibold">
                                    ⚡ Moderate
                                  </span>
                                ) : pred.requiredScore <= 90 ? (
                                  <span className="px-4 py-2 bg-slate-300 dark:bg-slate-600 border border-slate-500 dark:border-slate-400 text-slate-900 dark:text-slate-100 rounded-full text-sm font-semibold">
                                    ⚠️ Challenging
                                  </span>
                                ) : (
                                  <span className="px-4 py-2 bg-slate-400 dark:bg-slate-500 border border-slate-600 dark:border-slate-300 text-white dark:text-slate-900 rounded-full text-sm font-semibold">
                                    🔥 Very Hard
                                  </span>
                                )
                              ) : (
                                <span className="px-4 py-2 bg-slate-700/20 border border-slate-700 text-slate-400 rounded-full text-sm font-semibold">
                                  ✗ Not Possible
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
                      <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        📊 Score Difficulty Legend
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <span className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 shadow-lg"></span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">0-40%: Easy</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <span className="w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-500 shadow-lg"></span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">41-70%: Moderate</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <span className="w-4 h-4 rounded-full bg-slate-500 dark:bg-slate-400 shadow-lg"></span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">71-90%: Challenging</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <span className="w-4 h-4 rounded-full bg-slate-600 dark:bg-slate-300 shadow-lg"></span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">91-100%: Very Hard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
