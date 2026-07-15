"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { TrendingUp } from "lucide-react"
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

export default function DashboardGPAPredictorPage() {
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
                <div className="container mx-auto px-4 py-20 flex items-center justify-center relative z-10">
          <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      <BeamsBackground />
            
      <div id="tour-gpa-predictor-page" className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-black/10 bg-black mb-6 shadow-md">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-black uppercase tracking-tight leading-none">
            GPA PREDICTOR
          </h1>
          <p className="text-black/70 font-bold text-lg max-w-2xl mx-auto uppercase">
            Predict what you need in your final exam to achieve your target grade
          </p>
        </div>

        <Card id="tour-gpa-predictor" className="bg-white border border-black/10 shadow-xl max-w-5xl mx-auto rounded-2xl">
          <CardHeader className="border-b-2 border-black pb-6 pt-8">
            <CardTitle className="text-3xl font-black text-black uppercase tracking-tight">PREDICT YOUR REQUIRED SCORES</CardTitle>
            <p className="text-black/70 font-bold text-xs uppercase mt-2">Find out what you need in your final exam to achieve your target grade</p>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {/* Course Selection */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-black flex items-center gap-3 uppercase tracking-wide">
                <div className="w-8 h-8 rounded-2xl border border-black/10 bg-[#1e3a8a] text-white flex items-center justify-center text-sm font-black shadow-sm">1</div>
                SELECT COURSE
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-black uppercase tracking-widest">DEGREE PROGRAM</Label>
                  <Select value={selectedDegree} onValueChange={(v) => {
                    setSelectedDegree(v as any)
                    setSelectedLevel("")
                    setSelectedCourse(null)
                    setPredictions([])
                  }}>
                    <SelectTrigger className="h-14 text-sm font-bold bg-white border border-black/10 rounded-2xl shadow-sm text-black focus:ring-0 focus-visible:ring-0 focus:border-black uppercase">
                      <SelectValue placeholder="CHOOSE DEGREE" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-black/10 rounded-2xl shadow-md uppercase">
                      <SelectItem value="data-science" className="text-black font-bold text-xs uppercase">DATA SCIENCE</SelectItem>
                      <SelectItem value="electronic-systems" className="text-black font-bold text-xs uppercase">ELECTRONIC SYSTEMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-black uppercase tracking-widest">LEVEL</Label>
                  <Select value={selectedLevel} onValueChange={(v) => {
                    setSelectedLevel(v as any)
                    setSelectedCourse(null)
                    setPredictions([])
                  }} disabled={!selectedDegree}>
                    <SelectTrigger className="h-14 text-sm font-bold bg-white border border-black/10 rounded-2xl shadow-sm text-black focus:ring-0 focus-visible:ring-0 focus:border-black uppercase disabled:opacity-50">
                      <SelectValue placeholder="CHOOSE LEVEL" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-black/10 rounded-2xl shadow-md uppercase">
                      {availableLevels.map((level) => (
                        <SelectItem key={level} value={level} className="text-black font-bold text-xs uppercase">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-black uppercase tracking-widest">COURSE</Label>
                  <Select value={selectedCourse?.id || ""} onValueChange={(id) => {
                    const course = availableCourses.find((c) => c.id === id)
                    setSelectedCourse(course || null)
                    setFormValues({})
                    setPredictions([])
                  }} disabled={!selectedLevel}>
                    <SelectTrigger className="h-14 text-sm font-bold bg-white border border-black/10 rounded-2xl shadow-sm text-black focus:ring-0 focus-visible:ring-0 focus:border-black uppercase disabled:opacity-50">
                      <SelectValue placeholder="CHOOSE COURSE" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-black/10 rounded-2xl shadow-md uppercase">
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id} className="text-black font-bold text-xs uppercase">
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
                  <h3 className="text-lg font-black text-black flex items-center gap-3 uppercase tracking-wide">
                    <div className="w-8 h-8 rounded-2xl border border-black/10 bg-[#1e3a8a] text-white flex items-center justify-center text-sm font-black shadow-sm">2</div>
                    ENTER CURRENT SCORES
                  </h3>
                  <div className="bg-white border border-black/10 shadow-md p-6">
                    <p className="text-[10px] font-bold text-black/60 uppercase mb-6">Enter all your scores excluding the final exam (F):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCourse.formFields.filter(f => f.id !== 'F').map((field) => (
                        <div key={field.id} className="space-y-3">
                          <Label className="text-xs font-black text-black flex justify-between uppercase tracking-widest">
                            <span>{field.label}</span>
                            <span className="text-black/50">MAX: {field.max}</span>
                          </Label>
                          <Input
                            type="number"
                            placeholder={`ENTER SCORE (0 - ${field.max})`}
                            value={formValues[field.id] || ""}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(Number(e.target.value), field.max))
                              setFormValues({ ...formValues, [field.id]: val })
                            }}
                            className="h-14 text-sm font-bold bg-white border border-black/10 rounded-2xl shadow-sm text-black focus:ring-0 focus-visible:ring-0 focus:border-black uppercase placeholder:text-black/40"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Predict Button */}
                <Button onClick={handlePredict} className="w-full h-14 border border-black/10 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white text-sm font-black transition-all rounded-2xl uppercase tracking-widest shadow-md ">
                  <TrendingUp className="w-5 h-5 mr-3" />
                  PREDICT REQUIRED SCORES
                </Button>

                {predictions.length > 0 && (
                  <div className="space-y-6 pt-6 border-t-2 border-black">
                    <div className="text-center space-y-2 mb-8">
                      <h3 className="text-3xl font-black text-black uppercase tracking-tight">REQUIRED FINAL EXAM SCORES</h3>
                      <p className="text-black/60 font-bold text-sm uppercase">BASED ON YOUR CURRENT SCORES, HERE'S WHAT YOU NEED IN THE FINAL EXAM</p>
                    </div>
                    
                    {/* Table */}
                    <div className="overflow-hidden bg-white border border-black/10 shadow-xl overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                      <div className="min-w-[600px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 gap-4 bg-black p-4 border-b-2 border-black">
                        <div className="text-center">
                          <p className="text-white font-black text-[10px] uppercase tracking-widest">TARGET GRADE</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-black text-[10px] uppercase tracking-widest">GRADE POINTS</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-black text-[10px] uppercase tracking-widest">REQUIRED SCORE</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-black text-[10px] uppercase tracking-widest">STATUS</p>
                        </div>
                      </div>
                      
                      {/* Table Rows */}
                      <div className="bg-white">
                        {predictions.map((pred, index) => (
                          <div
                            key={pred.grade}
                            className={`grid grid-cols-4 gap-4 p-4 border-b-2 border-black bg-white hover:bg-[#FDFBF7] transition-colors ${
                              index === predictions.length - 1 ? 'border-b-0' : ''
                            }`}
                          >
                            <div className="text-center flex items-center justify-center border-r-2 border-black/10">
                              <span className="text-4xl font-black text-black">{pred.grade}</span>
                            </div>
                            <div className="text-center flex items-center justify-center border-r-2 border-black/10">
                              <div>
                                <p className="text-2xl font-black text-black leading-none mb-1">{pred.gradePoints}</p>
                                <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest">POINTS</p>
                              </div>
                            </div>
                            <div className="text-center flex items-center justify-center border-r-2 border-black/10">
                              {pred.possible ? (
                                <div>
                                  <p className="text-3xl font-black text-black leading-none mb-1">{pred.requiredScore.toFixed(1)}%</p>
                                  <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest">OUT OF 100</p>
                                </div>
                              ) : (
                                <p className="text-3xl font-black text-black/20">---</p>
                              )}
                            </div>
                            <div className="text-center flex items-center justify-center">
                              {pred.possible ? (
                                pred.requiredScore <= 40 ? (
                                  <span className="px-3 py-1 bg-white border border-black/10 text-black text-xs font-black uppercase tracking-widest shadow-sm">
                                    EASY
                                  </span>
                                ) : pred.requiredScore <= 70 ? (
                                  <span className="px-3 py-1 bg-[#1e3a8a] border border-black/10 text-white text-xs font-black uppercase tracking-widest shadow-sm">
                                    MODERATE
                                  </span>
                                ) : pred.requiredScore <= 90 ? (
                                  <span className="px-3 py-1 bg-[#f59e0b] border border-black/10 text-black text-xs font-black uppercase tracking-widest shadow-sm">
                                    CHALLENGING
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-red-600 border border-black/10 text-white text-xs font-black uppercase tracking-widest shadow-sm">
                                    VERY HARD
                                  </span>
                                )
                              ) : (
                                <span className="px-3 py-1 bg-black border border-black/10 text-white text-xs font-black uppercase tracking-widest shadow-sm">
                                  NOT POSSIBLE
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-white border border-black/10 shadow-md p-6 mt-8">
                      <p className="text-xs font-black text-black mb-4 uppercase tracking-widest">
                        SCORE DIFFICULTY LEGEND
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-3 bg-white border border-black/10 p-3">
                          <span className="w-4 h-4 border border-black/10 bg-white"></span>
                          <span className="text-black">0-40%: EASY</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-black/10 p-3">
                          <span className="w-4 h-4 border border-black/10 bg-[#1e3a8a]"></span>
                          <span className="text-black">41-70%: MODERATE</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-black/10 p-3">
                          <span className="w-4 h-4 border border-black/10 bg-[#f59e0b]"></span>
                          <span className="text-black">71-90%: CHALLENGING</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-black/10 p-3">
                          <span className="w-4 h-4 border border-black/10 bg-red-600"></span>
                          <span className="text-black">91-100%: VERY HARD</span>
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
