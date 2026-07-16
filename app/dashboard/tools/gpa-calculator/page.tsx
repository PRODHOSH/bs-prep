"use client"

import { useState, useEffect } from "react"
import { courseData } from "@/lib/gpa/course-data"
import { calculateScore } from "@/lib/gpa/calculate-score"
import { assignGrade } from "@/lib/gpa/grade-utils"
import type { Course } from "@/lib/gpa/types"
import dynamic from "next/dynamic"
import { Calculator, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

const BeamsBackground = dynamic(() => import("@/components/beams-background").then(mod => ({ default: mod.BeamsBackground })), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-white -z-10" />
})

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

export default function DashboardGPACalculatorPage() {
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
  const [existingCGPA, setExistingCGPA] = useState<number | "">("")
  const [completedCredits, setCompletedCredits] = useState<number | "">("")

  const semesterResults = (() => {
    const validCourses = semesterCourses.filter((c) => c.credits > 0 && c.gradePoints > 0)
    const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0)
    const totalGradePoints = validCourses.reduce((sum, course) => sum + course.credits * course.gradePoints, 0)
    
    if (totalCredits === 0) return null

    const sgpa = totalGradePoints / totalCredits
    
    let updatedCGPA = null
    if (existingCGPA !== "" && completedCredits !== "") {
      const currentTotalPoints = Number(existingCGPA) * Number(completedCredits)
      const newTotalPoints = currentTotalPoints + totalGradePoints
      const newTotalCredits = Number(completedCredits) + totalCredits
      updatedCGPA = newTotalPoints / newTotalCredits
    }

    return { sgpa, totalCredits, totalGradePoints, updatedCGPA }
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
      const score = calculateScore(selectedCourse.id, formValues)
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
            
      <div id="tour-gpa-calc-page" className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-black/10 bg-black mb-6 shadow-md">
            <Calculator className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-black uppercase tracking-tight leading-none">
            GPA CALCULATOR
          </h1>
          <p className="text-black/70 font-bold text-lg max-w-2xl mx-auto uppercase">
            Calculate your course scores and semester GPA with precision
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div id="tour-gpa-calc" className="bg-white rounded-2xl border border-black/10 p-1 inline-flex gap-1 shadow-md">
            <button
              onClick={() => setActiveTab("course")}
              className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === "course" 
                  ? "bg-black text-white" 
                  : "text-black hover:bg-black/5"
              }`}
            >
              COURSE GRADE
            </button>
            <button
              onClick={() => setActiveTab("semester")}
              className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === "semester" 
                  ? "bg-black text-white" 
                  : "text-black hover:bg-black/5"
              }`}
            >
              SEMESTER GPA
            </button>
          </div>
        </div>

        {/* Course Grade Calculator */}
        {activeTab === "course" && (
          <Card className="bg-white border border-black/10 shadow-xl max-w-5xl mx-auto rounded-2xl">
            <CardHeader className="border-b-2 border-black pb-6 pt-8">
              <CardTitle className="text-3xl font-black text-black uppercase tracking-tight">CALCULATE COURSE GRADE</CardTitle>
              <p className="text-black/70 font-bold text-xs uppercase mt-2">Select your course and enter your scores to get your final grade</p>
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
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
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
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
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
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
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
                      ENTER YOUR SCORES
                    </h3>
                    <div className="bg-white border border-black/10 shadow-md p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedCourse.formFields.map((field) => (
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
                            <p className="text-[10px] font-bold text-black/60 uppercase">{field.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button onClick={handleCalculate} className="flex-1 h-14 border border-black/10 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white text-sm font-black transition-all rounded-2xl uppercase tracking-widest shadow-md ">
                      <Calculator className="w-5 h-5 mr-3" />
                      CALCULATE GRADE
                    </Button>
                    <Button onClick={() => {
                      setFormValues({})
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
                    }} variant="outline" className="h-14 px-10 border border-black/10 hover:bg-black hover:text-white transition-all text-sm font-black text-black rounded-2xl uppercase tracking-widest shadow-md bg-white">
                      RESET
                    </Button>
                  </div>

                  {/* Result */}
                  {calculatedScore !== null && calculatedGrade && (
                    <div className="bg-[#FDFBF7] border border-black/10 p-10 text-center shadow-md mt-8">
                      <p className="text-black/60 text-sm uppercase tracking-widest mb-6 font-black">YOUR FINAL SCORE</p>
                      <div className="flex items-center justify-center gap-12 flex-wrap">
                        <div>
                          <p className="text-7xl font-black text-black mb-1">
                            {calculatedScore.toFixed(2)}
                          </p>
                          <p className="text-black/60 text-sm font-bold uppercase tracking-widest">OUT OF 100</p>
                        </div>
                        <div className="h-24 w-1 bg-black/10"></div>
                        <div>
                          <p className="text-black/60 text-sm uppercase tracking-widest mb-1 font-black">GRADE</p>
                          <div className="text-7xl font-black text-black leading-none">
                            {calculatedGrade}
                          </div>
                          <p className="text-xs font-black text-[#1e3a8a] mt-4 uppercase tracking-widest bg-white border-2 border-[#1e3a8a] px-3 py-1 inline-block">
                            {calculatedGrade === 'S' && 'OUTSTANDING'}
                            {calculatedGrade === 'A' && 'EXCELLENT'}
                            {calculatedGrade === 'B' && 'GREAT JOB'}
                            {calculatedGrade === 'C' && 'GOOD WORK'}
                            {calculatedGrade === 'D' && 'KEEP GOING'}
                            {calculatedGrade === 'E' && 'IMPROVEMENT NEEDED'}
                            {calculatedGrade === 'U' && 'FAIL'}
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
          <Card className="bg-white border border-black/10 shadow-xl max-w-5xl mx-auto rounded-2xl">
            <CardHeader className="border-b-2 border-black pb-6 pt-8">
              <CardTitle className="text-3xl font-black text-black uppercase tracking-tight">CALCULATE SEMESTER GPA</CardTitle>
              <p className="text-black/70 font-bold text-xs uppercase mt-2">Add your courses and grades to calculate your GPA</p>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              {/* Existing History */}
              <div className="space-y-6 mb-10">
                <h3 className="text-lg font-black text-black flex items-center gap-3 uppercase tracking-wide">
                  <div className="w-8 h-8 rounded-2xl border border-black/10 bg-[#1e3a8a] text-white flex items-center justify-center text-sm font-black shadow-sm">1</div>
                  EXISTING ACADEMIC STANDING
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-black/10 shadow-md p-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-black uppercase tracking-widest">CURRENT CGPA</Label>
                    <Input
                      type="number"
                      placeholder="E.G., 8.5"
                      value={existingCGPA}
                      onChange={(e) => setExistingCGPA(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-14 text-sm font-bold bg-white border border-black/10 rounded-2xl shadow-sm text-black focus:ring-0 focus-visible:ring-0 focus:border-black uppercase placeholder:text-black/40"
                      step="0.01"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-black uppercase tracking-widest">TOTAL CREDITS COMPLETED</Label>
                    <Input
                      type="number"
                      placeholder="E.G., 48"
                      value={completedCredits}
                      onChange={(e) => setCompletedCredits(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-14 text-sm font-bold bg-white border border-black/10 rounded-2xl shadow-sm text-black focus:ring-0 focus-visible:ring-0 focus:border-black uppercase placeholder:text-black/40"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black text-black flex items-center gap-3 uppercase tracking-wide">
                  <div className="w-8 h-8 rounded-2xl border border-black/10 bg-[#1e3a8a] text-white flex items-center justify-center text-sm font-black shadow-sm">2</div>
                  CURRENT SEMESTER COURSES
                </h3>
              </div>

              {/* Table Header */}
              <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-12 gap-4 px-4 pb-4 border-b-2 border-black">
                <div className="col-span-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-black/60">COURSE NAME</Label>
                </div>
                <div className="col-span-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-black/60">CREDITS</Label>
                </div>
                <div className="col-span-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-black/60">GRADE</Label>
                </div>
                <div className="col-span-1"></div>
              </div>

              {/* Course Rows */}
              <div className="space-y-4 pt-2">
                {semesterCourses.map((course, index) => (
                  <div key={course.id} className="grid grid-cols-12 gap-4 p-4 bg-white border border-black/10 shadow-md items-center">
                    <div className="col-span-4">
                      <Input
                        placeholder="E.G., MATHEMATICS I"
                        value={course.name}
                        onChange={(e) => setSemesterCourses(semesterCourses.map(c => 
                          c.id === course.id ? { ...c, name: e.target.value } : c
                        ))}
                        className="h-12 text-sm font-bold bg-white border border-black/10 rounded-2xl shadow-sm text-black focus:ring-0 focus-visible:ring-0 focus:border-black uppercase placeholder:text-black/30"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="4"
                        value={course.credits || ""}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(Number(e.target.value), 20))
                          setSemesterCourses(semesterCourses.map(c => 
                            c.id === course.id ? { ...c, credits: val } : c
                          ))
                        }}
                        className="h-12 text-sm font-bold bg-white border border-black/10 rounded-2xl shadow-sm text-black focus:ring-0 focus-visible:ring-0 focus:border-black uppercase placeholder:text-black/30"
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
                        <SelectTrigger className="h-12 text-sm font-bold bg-white border border-black/10 rounded-2xl shadow-sm text-black focus:ring-0 focus-visible:ring-0 focus:border-black uppercase">
                          <SelectValue placeholder="SELECT GRADE" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-black/10 rounded-2xl shadow-md uppercase">
                          {gradePointsOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value.toString()} className="text-black font-bold text-xs uppercase">{opt.label}</SelectItem>
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
                          className="h-12 w-12 rounded-2xl border border-black/10 bg-white text-black hover:bg-black hover:text-white shadow-sm transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={addCourse} variant="outline" className="w-full h-14 border-2 border-dashed border-black bg-white hover:bg-black hover:text-white transition-all text-sm font-black text-black rounded-2xl uppercase tracking-widest mt-6">
                <Plus className="w-5 h-5 mr-3" />
                ADD ANOTHER COURSE
              </Button>

              {semesterResults !== null && (
                <div className="bg-[#FDFBF7] border border-black/10 p-10 shadow-md mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 divide-y-2 md:divide-y-0 md:divide-x-2 divide-black/10">
                    <div className="text-center pb-10 md:pb-0 md:pr-10">
                      <p className="text-black/60 text-sm uppercase tracking-widest mb-6 font-black">SEMESTER GPA (SGPA)</p>
                      <p className="text-8xl font-black text-black mb-6 tracking-tight leading-none">{semesterResults.sgpa.toFixed(2)}</p>
                      <div className="inline-flex items-center px-4 py-2 border border-black/10 bg-white">
                        <p className="text-sm font-black text-black uppercase tracking-widest">
                          {semesterResults.sgpa >= 9 ? "EXCELLENT" : semesterResults.sgpa >= 8 ? "VERY GOOD" : semesterResults.sgpa >= 7 ? "GOOD WORK" : "KEEP GOING"}
                        </p>
                      </div>
                    </div>
                    
                    {semesterResults.updatedCGPA !== null && (
                      <div className="text-center pt-10 md:pt-0 md:pl-10">
                        <p className="text-black/60 text-sm uppercase tracking-widest mb-6 font-black">UPDATED TOTAL CGPA</p>
                        <p className="text-8xl font-black text-black mb-6 tracking-tight leading-none">{semesterResults.updatedCGPA.toFixed(2)}</p>
                        <p className="text-xs font-bold text-black/50 uppercase tracking-widest">INCLUDES YOUR CURRENT SEMESTER PERFORMANCE</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 mt-10 border-t-2 border-black">
                    <div className="text-center bg-white border border-black/10 p-4 shadow-sm">
                      <p className="text-black/50 text-[10px] mb-2 font-black uppercase tracking-widest">COURSES</p>
                      <p className="text-3xl font-black text-black">{semesterResults.totalCredits > 0 ? semesterCourses.filter(c => c.credits > 0).length : 0}</p>
                    </div>
                    <div className="text-center bg-white border border-black/10 p-4 shadow-sm">
                      <p className="text-black/50 text-[10px] mb-2 font-black uppercase tracking-widest">CREDITS</p>
                      <p className="text-3xl font-black text-black">{semesterResults.totalCredits}</p>
                    </div>
                    <div className="text-center bg-white border border-black/10 p-4 shadow-sm">
                      <p className="text-black/50 text-[10px] mb-2 font-black uppercase tracking-widest">POINTS</p>
                      <p className="text-3xl font-black text-black">{semesterResults.totalGradePoints.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

          </div>
  )
}
