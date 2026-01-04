"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp } from "lucide-react"
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

interface GradePrediction {
  grade: string
  gradePoints: number
  requiredScore: number
  possible: boolean
}

export default function GPAPredictor() {
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

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />
      
      <div className="container mx-auto px-4 py-20">
        <Link 
          href="/tools"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#51b206] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tools
        </Link>

        <div className="text-center mb-12">
          <TrendingUp className="w-12 h-12 text-[#51b206] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">GPA Predictor</h1>
          <p className="text-slate-400 text-lg">Predict what you need in your final exam</p>
        </div>

        <Card className="bg-black/80 backdrop-blur-sm border-0 shadow-2xl max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Predict Your Required Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Select Degree</Label>
                <Select value={selectedDegree} onValueChange={(v) => {
                  setSelectedDegree(v as any)
                  setSelectedLevel("")
                  setSelectedCourse(null)
                  setPredictions([])
                }}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose degree" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-slate-700">
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="electronic-systems">Electronic Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Level</Label>
                <Select value={selectedLevel} onValueChange={(v) => {
                  setSelectedLevel(v as any)
                  setSelectedCourse(null)
                  setPredictions([])
                }} disabled={!selectedDegree}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose level" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-slate-700">
                    {availableLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select value={selectedCourse?.id || ""} onValueChange={(id) => {
                const course = availableCourses.find((c) => c.id === id)
                setSelectedCourse(course || null)
                setFormValues({})
                setPredictions([])
              }} disabled={!selectedLevel}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose course" />
                </SelectTrigger>
                <SelectContent className="bg-black border-slate-700">
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <>
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm text-slate-400 mb-4">Enter your current scores (excluding final exam):</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCourse.formFields.filter(f => f.id !== 'F').map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label>{field.label} (Max: {field.max})</Label>
                        <Input
                          type="number"
                          placeholder={`0 - ${field.max}`}
                          value={formValues[field.id] || ""}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(Number(e.target.value), field.max))
                            setFormValues({ ...formValues, [field.id]: val })
                          }}
                          className="h-12"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handlePredict} className="w-full h-12 bg-[#51b206] hover:bg-[#51b206]/90">
                  Predict Required Scores
                </Button>

                {predictions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-center mb-4">Required Final Exam Scores</h3>
                    {predictions.map((pred) => (
                      <div
                        key={pred.grade}
                        className={`p-4 rounded-lg border ${
                          pred.possible
                            ? "bg-[#51b206]/10 border-[#51b206]/50"
                            : "bg-red-500/10 border-red-500/50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-2xl font-bold">Grade {pred.grade}</span>
                            <span className="text-slate-400 ml-2">({pred.gradePoints} points)</span>
                          </div>
                          <div className="text-right">
                            {pred.possible ? (
                              <>
                                <p className="text-sm text-slate-400">Required in Final:</p>
                                <p className="text-3xl font-bold text-[#51b206]">{pred.requiredScore.toFixed(1)}%</p>
                              </>
                            ) : (
                              <p className="text-red-400 font-semibold">Not Achievable</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
