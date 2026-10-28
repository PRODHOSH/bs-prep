"use client"

import { useState, useEffect } from "react"
import { getUserCached } from "@/lib/supabase/cached-user"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/ui"
import { FormPageSkeleton } from "@/components/dashboard/skeleton"
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

export default function DashboardGPAPredictorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    getUserCached().then(({ data }) => {
      setIsAuthenticated(!!data.user)
      setLoading(false)
    })
  }, [])

  const [selectedDegree, setSelectedDegree] = useState<"data-science" | "electronic-systems" | "aeronautics" | "management" | "">("")
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
    return (
      <div className="mx-auto max-w-4xl">
        <FormPageSkeleton fields={5} />
      </div>
    )
  }

  return (
    <div>
            
      <div id="tour-gpa-predictor-page" className="space-y-6">
        <PageHeader title="GPA predictor" description="Find the final exam score you need for your target grade." />

        <Card id="tour-gpa-predictor" className="bg-card border border-border max-w-4xl rounded-2xl">
          <CardHeader className="border-b pb-6 pt-8">
            <CardTitle className="text-3xl font-bold text-foreground tracking-tight">Predict your required scores</CardTitle>
            <p className="text-muted-foreground font-bold text-xs mt-2">Find out what you need in your final exam to achieve your target grade</p>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {/* Course Selection */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                Select course
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-foreground">Degree program</Label>
                  <Select value={selectedDegree || undefined} onValueChange={(v) => {
                    setSelectedDegree(v as any)
                    setSelectedLevel("")
                    setSelectedCourse(null)
                    setPredictions([])
                  }}>
                    <SelectTrigger className="w-full h-11 px-5 text-sm font-bold bg-card border border-border hover:border-primary/50 rounded-2xl text-foreground focus:ring-0 focus-visible:ring-0 focus:border-foreground transition-all">
                      <SelectValue placeholder="Choose degree" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border rounded-2xl max-h-80 overflow-y-auto">
                      <SelectItem value="data-science" className="text-foreground font-bold text-xs py-3 cursor-pointer">Data science</SelectItem>
                      <SelectItem value="electronic-systems" className="text-foreground font-bold text-xs py-3 cursor-pointer">Electronic systems</SelectItem>
                      <SelectItem value="aeronautics" className="text-foreground font-bold text-xs py-3 cursor-pointer">Aeronautics & space tech</SelectItem>
                      <SelectItem value="management" className="text-foreground font-bold text-xs py-3 cursor-pointer">Management & data science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-foreground">Level</Label>
                  <Select value={selectedLevel || undefined} onValueChange={(v) => {
                    setSelectedLevel(v as any)
                    setSelectedCourse(null)
                    setPredictions([])
                  }} disabled={!selectedDegree}>
                    <SelectTrigger className="w-full h-11 px-5 text-sm font-bold bg-card border border-border hover:border-primary/50 rounded-2xl text-foreground focus:ring-0 focus-visible:ring-0 focus:border-foreground transition-all disabled:opacity-40 disabled:bg-neutral-50 disabled:cursor-not-allowed">
                      <SelectValue placeholder="Choose level" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border rounded-2xl max-h-80 overflow-y-auto">
                      {availableLevels.map((level) => (
                        <SelectItem key={level} value={level} className="text-foreground font-bold text-xs py-3 cursor-pointer">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-foreground">Course</Label>
                  <Select value={selectedCourse?.id || undefined} onValueChange={(id) => {
                    const course = availableCourses.find((c) => c.id === id)
                    setSelectedCourse(course || null)
                    setFormValues({})
                    setPredictions([])
                  }} disabled={!selectedLevel}>
                    <SelectTrigger className="w-full h-11 px-5 text-sm font-bold bg-card border border-border hover:border-primary/50 rounded-2xl text-foreground focus:ring-0 focus-visible:ring-0 focus:border-foreground transition-all disabled:opacity-40 disabled:bg-neutral-50 disabled:cursor-not-allowed">
                      <SelectValue placeholder="Choose course" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border rounded-2xl max-h-80 overflow-y-auto">
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id} className="text-foreground font-bold text-xs py-3 cursor-pointer">
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
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                    Enter current scores
                  </h3>
                  <div className="bg-card border border-border p-6">
                    <p className="text-[11px] font-bold text-muted-foreground mb-6">Enter all your scores excluding the final exam (F):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCourse.formFields.filter(f => f.id !== 'F').map((field) => (
                        <div key={field.id} className="space-y-3">
                          <Label className="text-xs font-bold text-foreground flex justify-between">
                            <span>{field.label}</span>
                            <span className="text-muted-foreground/70">MAX: {field.max}</span>
                          </Label>
                          <Input
                            type="number"
                            placeholder={`ENTER SCORE (0 - ${field.max})`}
                            value={formValues[field.id] || ""}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(Number(e.target.value), field.max))
                              setFormValues({ ...formValues, [field.id]: val })
                            }}
                            className="h-11 text-sm font-bold bg-card border border-border rounded-2xl text-foreground focus:ring-0 focus-visible:ring-0 focus:border-foreground placeholder:text-muted-foreground/70"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Predict Button */}
                <Button onClick={handlePredict} className="w-full h-11 border border-border bg-primary hover:opacity-90 text-white text-sm font-bold transition-all rounded-2xl">
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Predict required scores
                </Button>

                {predictions.length > 0 && (
                  <div className="space-y-6 pt-6 border-t">
                    <div className="text-center space-y-2 mb-8">
                      <h3 className="text-3xl font-bold text-foreground tracking-tight">Required final exam scores</h3>
                      <p className="text-muted-foreground font-bold text-sm">Based on your current scores, here's what you need in the final exam</p>
                    </div>
                    
                    {/* Table */}
                    {/* Table */}
                    <div className="overflow-hidden bg-card border border-border rounded-2xl overflow-x-auto mx-0 px-0">
                      <div className="min-w-[600px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 gap-4 bg-muted/40 p-4 border-b border-border">
                        <div className="text-center">
                          <p className="text-muted-foreground font-bold text-[11px]">Target grade</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground font-bold text-[11px]">Grade points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground font-bold text-[11px]">Required score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground font-bold text-[11px]">Status</p>
                        </div>
                      </div>
                      
                      {/* Table Rows */}
                      <div className="bg-card">
                        {predictions.map((pred, index) => (
                          <div
                            key={pred.grade}
                            className={`grid grid-cols-4 gap-4 p-4 border-b border-border bg-card hover:bg-black/[0.02] transition-colors ${
                              index === predictions.length - 1 ? 'border-b-0' : ''
                            }`}
                          >
                            <div className="text-center flex items-center justify-center">
                              <span className="text-3xl font-bold text-foreground">{pred.grade}</span>
                            </div>
                            <div className="text-center flex items-center justify-center">
                              <div>
                                <p className="text-xl font-bold text-foreground leading-none mb-1">{pred.gradePoints}</p>
                                <p className="text-[11px] font-semibold text-muted-foreground/70">Points</p>
                              </div>
                            </div>
                            <div className="text-center flex items-center justify-center">
                              {pred.possible ? (
                                <div>
                                  <p className="text-2xl font-bold text-foreground leading-none mb-1">{pred.requiredScore.toFixed(1)}%</p>
                                  <p className="text-[11px] font-semibold text-muted-foreground/70">Out of 100</p>
                                </div>
                              ) : (
                                <p className="text-2xl font-bold text-muted-foreground/70">---</p>
                              )}
                            </div>
                            <div className="text-center flex items-center justify-center">
                              {pred.possible ? (
                                pred.requiredScore <= 40 ? (
                                  <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-[11px] font-bold">
                                    Highly achievable
                                  </span>
                                ) : pred.requiredScore <= 70 ? (
                                  <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[11px] font-bold">
                                    Achievable
                                  </span>
                                ) : pred.requiredScore <= 90 ? (
                                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[11px] font-bold">
                                    Needs focus
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[11px] font-bold">
                                    Outstanding
                                  </span>
                                )
                              ) : (
                                <span className="px-3 py-1 bg-muted text-muted-foreground/70 border border-border rounded-md text-[11px] font-bold">
                                  Not possible
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-card border border-border rounded-2xl p-6 mt-8">
                      <p className="text-xs font-bold text-muted-foreground mb-4">
                        Score difficulty legend
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] font-bold">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                          <span className="text-muted-foreground">0-40%: highly achievable</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          <span className="text-muted-foreground">41-70%: achievable</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                          <span className="text-muted-foreground">71-90%: needs focus</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                          <span className="text-muted-foreground">91-100%: outstanding</span>
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

          </div>
  )
}
