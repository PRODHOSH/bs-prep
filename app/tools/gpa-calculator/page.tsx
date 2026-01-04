"use client"

import { useState } from "react"
import Link from "next/link"
import { courseData } from "@/lib/gpa/course-data"
import { calculateScore } from "@/lib/gpa/calculate-score"
import { assignGrade } from "@/lib/gpa/grade-utils"
import type { Course } from "@/lib/gpa/types"
import { Calculator, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
          <Calculator className="w-12 h-12 text-[#3e3098] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">GPA Calculator</h1>
          <p className="text-slate-400 text-lg">Calculate your course scores and semester GPA</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/80 rounded-xl p-2 border border-slate-700 inline-flex gap-2">
            <button
              onClick={() => setActiveTab("course")}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === "course" ? "bg-[#3e3098] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Course Grade
            </button>
            <button
              onClick={() => setActiveTab("semester")}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === "semester" ? "bg-[#51b206] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Semester GPA
            </button>
          </div>
        </div>

        {/* Course Grade Calculator */}
        {activeTab === "course" && (
          <Card className="bg-black/80 backdrop-blur-sm border-0 shadow-2xl max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Calculate Course Grade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Select Degree</Label>
                  <Select value={selectedDegree} onValueChange={(v) => {
                    setSelectedDegree(v as any)
                    setSelectedLevel("")
                    setSelectedCourse(null)
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
                  setCalculatedScore(null)
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCourse.formFields.map((field) => (
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
                        <p className="text-xs text-slate-500">{field.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleCalculate} className="flex-1 h-12 bg-[#3e3098] hover:bg-[#3e3098]/90">
                      Calculate Grade
                    </Button>
                    <Button onClick={() => {
                      setFormValues({})
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
                    }} variant="outline" className="h-12">
                      Reset
                    </Button>
                  </div>

                  {calculatedScore !== null && calculatedGrade && (
                    <div className="bg-[#51b206]/10 border border-[#51b206]/50 rounded-lg p-6 text-center">
                      <p className="text-slate-400 mb-2">Your Score</p>
                      <p className="text-5xl font-bold text-[#51b206] mb-2">{calculatedScore.toFixed(2)}</p>
                      <p className="text-2xl">Grade: <span className="text-[#51b206] font-bold">{calculatedGrade}</span></p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Semester GPA Calculator */}
        {activeTab === "semester" && (
          <Card className="bg-black/80 backdrop-blur-sm border-0 shadow-2xl max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Calculate Semester GPA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {semesterCourses.map((course, index) => (
                <div key={course.id} className="bg-white/5 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Course Name</Label>
                      <Input
                        placeholder="Enter course name"
                        value={course.name}
                        onChange={(e) => setSemesterCourses(semesterCourses.map(c => 
                          c.id === course.id ? { ...c, name: e.target.value } : c
                        ))}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Credits</Label>
                      <Input
                        type="number"
                        placeholder="Credits"
                        value={course.credits || ""}
                        onChange={(e) => setSemesterCourses(semesterCourses.map(c => 
                          c.id === course.id ? { ...c, credits: Number(e.target.value) } : c
                        ))}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grade Points</Label>
                      <div className="flex gap-2">
                        <Select value={course.gradePoints.toString()} onValueChange={(v) => 
                          setSemesterCourses(semesterCourses.map(c => 
                            c.id === course.id ? { ...c, gradePoints: Number(v) } : c
                          ))
                        }>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-slate-700">
                            {gradePointsOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {semesterCourses.length > 1 && (
                          <Button onClick={() => removeCourse(course.id)} variant="outline" size="icon" className="h-12 w-12">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={addCourse} variant="outline" className="w-full h-12">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>

              {semesterGPA !== null && (
                <div className="bg-[#51b206]/10 border border-[#51b206]/50 rounded-lg p-8 text-center">
                  <p className="text-slate-400 mb-2">Your Semester GPA</p>
                  <p className="text-6xl font-bold text-[#51b206] mb-4">{semesterGPA.toFixed(2)}</p>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                      <p className="text-slate-500 text-sm">Courses</p>
                      <p className="text-2xl font-bold">{semesterCourses.filter(c => c.credits > 0).length}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">Credits</p>
                      <p className="text-2xl font-bold">{semesterCourses.filter(c => c.credits > 0).reduce((sum, c) => sum + c.credits, 0)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">Performance</p>
                      <p className="text-xl font-bold text-[#51b206]">
                        {semesterGPA >= 9 ? "Excellent" : semesterGPA >= 8 ? "Very Good" : semesterGPA >= 7 ? "Good" : "Average"}
                      </p>
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
