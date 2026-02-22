"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
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

const BeamsBackground = dynamic(() => import("@/components/beams-background").then(mod => ({ default: mod.BeamsBackground })), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-white -z-10" />
})

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

  // Show navbar even during loading to prevent blank page flash
  if (loading) {
    return (
      <div className="min-h-screen bg-white relative">
        <BeamsBackground />
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center relative z-10">
          <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      <BeamsBackground />
      <Navbar isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-black mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-black">
            GPA Predictor
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Predict what you need in your final exam to achieve your target grade
          </p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm max-w-5xl mx-auto rounded-lg">
          <CardHeader className="border-b border-gray-200 pb-4 pt-6">
            <CardTitle className="text-2xl font-bold text-black">Predict Your Required Scores</CardTitle>
            <p className="text-gray-600 text-sm mt-1">Find out what you need in your final exam to achieve your target grade</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Course Selection */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gray-100 text-black flex items-center justify-center text-xs font-bold">1</div>
                Select Course
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-black">Degree Program</Label>
                  <Select value={selectedDegree} onValueChange={(v) => {
                    setSelectedDegree(v as any)
                    setSelectedLevel("")
                    setSelectedCourse(null)
                    setPredictions([])
                  }}>
                    <SelectTrigger className="h-12 text-base bg-white border-gray-300 hover:border-black transition-colors text-black">
                      <SelectValue placeholder="Choose degree" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="data-science" className="text-black">Data Science</SelectItem>
                      <SelectItem value="electronic-systems" className="text-black">Electronic Systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-black">Level</Label>
                  <Select value={selectedLevel} onValueChange={(v) => {
                    setSelectedLevel(v as any)
                    setSelectedCourse(null)
                    setPredictions([])
                  }} disabled={!selectedDegree}>
                    <SelectTrigger className="h-12 text-base bg-white border-gray-300 hover:border-black transition-colors text-black">
                      <SelectValue placeholder="Choose level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {availableLevels.map((level) => (
                        <SelectItem key={level} value={level} className="text-black">
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-black">Course</Label>
                  <Select value={selectedCourse?.id || ""} onValueChange={(id) => {
                    const course = availableCourses.find((c) => c.id === id)
                    setSelectedCourse(course || null)
                    setFormValues({})
                    setPredictions([])
                  }} disabled={!selectedLevel}>
                    <SelectTrigger className="h-12 text-base bg-white border-gray-300 hover:border-black transition-colors text-black">
                      <SelectValue placeholder="Choose course" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id} className="text-black">
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
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-black flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gray-100 text-black flex items-center justify-center text-xs font-bold">2</div>
                    Enter Current Scores
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-600 mb-4 font-medium">Enter all your scores excluding the final exam (F):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCourse.formFields.filter(f => f.id !== 'F').map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="text-sm font-semibold text-black flex justify-between">
                            <span>{field.label}</span>
                            <span className="text-gray-600 text-xs">Max: {field.max}</span>
                          </Label>
                          <Input
                            type="number"
                            placeholder={`Enter score (0 - ${field.max})`}
                            value={formValues[field.id] || ""}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(Number(e.target.value), field.max))
                              setFormValues({ ...formValues, [field.id]: val })
                            }}
                            className="h-12 text-base bg-white border-gray-300 focus:border-black transition-colors text-black"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Predict Button */}
                <Button onClick={handlePredict} className="w-full h-12 bg-black hover:bg-black/80 text-white text-base font-bold transition-all">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Predict Required Scores
                </Button>

                {predictions.length > 0 && (
                  <div className="space-y-5">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-black">Required Final Exam Scores</h3>
                      <p className="text-gray-600 text-sm">Based on your current scores, here's what you need in the final exam</p>
                    </div>
                    
                    {/* Table */}
                    <div className="overflow-hidden rounded-lg border-2 border-gray-200">
                      {/* Table Header */}
                      <div className="grid grid-cols-4 gap-4 bg-black p-4">
                        <div className="text-center">
                          <p className="text-white font-bold text-xs uppercase tracking-wider">Target Grade</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-xs uppercase tracking-wider">Grade Points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-xs uppercase tracking-wider">Required Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-xs uppercase tracking-wider">Status</p>
                        </div>
                      </div>
                      
                      {/* Table Rows */}
                      <div className="bg-white">
                        {predictions.map((pred, index) => (
                          <div
                            key={pred.grade}
                            className={`grid grid-cols-4 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                              index === predictions.length - 1 ? 'border-b-0' : ''
                            }`}
                          >
                            <div className="text-center flex items-center justify-center">
                              <span className="text-3xl font-bold text-black">{pred.grade}</span>
                            </div>
                            <div className="text-center flex items-center justify-center">
                              <div>
                                <p className="text-xl font-bold text-black">{pred.gradePoints}</p>
                                <p className="text-xs text-gray-600 font-medium">points</p>
                              </div>
                            </div>
                            <div className="text-center flex items-center justify-center">
                              {pred.possible ? (
                                <div>
                                  <p className="text-3xl font-bold text-black">{pred.requiredScore.toFixed(1)}%</p>
                                  <p className="text-xs text-gray-600 font-medium">out of 100</p>
                                </div>
                              ) : (
                                <p className="text-xl font-semibold text-gray-400">---</p>
                              )}
                            </div>
                            <div className="text-center flex items-center justify-center">
                              {pred.possible ? (
                                pred.requiredScore <= 40 ? (
                                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-black rounded-full text-xs font-semibold">
                                    ✓ Easy
                                  </span>
                                ) : pred.requiredScore <= 70 ? (
                                  <span className="px-3 py-1.5 bg-gray-200 border border-gray-400 text-black rounded-full text-xs font-semibold">
                                    ⚡ Moderate
                                  </span>
                                ) : pred.requiredScore <= 90 ? (
                                  <span className="px-3 py-1.5 bg-gray-300 border border-gray-500 text-black rounded-full text-xs font-semibold">
                                    ⚠️ Challenging
                                  </span>
                                ) : (
                                  <span className="px-3 py-1.5 bg-gray-400 border border-gray-600 text-white rounded-full text-xs font-semibold">
                                    🔥 Very Hard
                                  </span>
                                )
                              ) : (
                                <span className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-500 rounded-full text-xs font-semibold">
                                  ✗ Not Possible
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5">
                      <p className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                        📊 Score Difficulty Legend
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
                          <span className="w-3 h-3 rounded-full bg-gray-200"></span>
                          <span className="text-black font-semibold">0-40%: Easy</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
                          <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                          <span className="text-black font-semibold">41-70%: Moderate</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
                          <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                          <span className="text-black font-semibold">71-90%: Challenging</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
                          <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                          <span className="text-black font-semibold">91-100%: Very Hard</span>
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
