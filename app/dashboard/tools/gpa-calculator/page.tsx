"use client"

import { useState, useEffect } from "react"
import { getUserCached } from "@/lib/supabase/cached-user"
import { courseData } from "@/lib/gpa/course-data"
import { calculateScore } from "@/lib/gpa/calculate-score"
import { assignGrade } from "@/lib/gpa/grade-utils"
import type { Course } from "@/lib/gpa/types"
import { Calculator, Plus, Trash2 } from "lucide-react"
import { Tabs } from "@/components/dashboard/controls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/ui"
import { FormPageSkeleton } from "@/components/dashboard/skeleton"
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

export default function DashboardGPACalculatorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    getUserCached().then(({ data }) => {
      setIsAuthenticated(!!data.user)
      setLoading(false)
    })
  }, [])

  const [activeTab, setActiveTab] = useState<"course" | "semester">("course")
  
  // Course Grade Calculator State
  const [selectedDegree, setSelectedDegree] = useState<"data-science" | "electronic-systems" | "aeronautics" | "management" | "">("")
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

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <FormPageSkeleton fields={5} />
      </div>
    )
  }

  return (
    <div>
            
      <div id="tour-gpa-calc-page" className="space-y-6">
        <PageHeader title="GPA calculator" description="Calculate course scores and your semester GPA." />

        <div id="tour-gpa-calc">
          <Tabs tabs={[{ id: "course", label: "Course grade" }, { id: "semester", label: "Semester GPA" }]} value={activeTab} onChange={setActiveTab} />
        </div>

        {/* Course Grade Calculator */}
        {activeTab === "course" && (
          <Card className="bg-card border border-border max-w-4xl rounded-2xl">
            <CardHeader className="border-b pb-6 pt-8">
              <CardTitle className="text-3xl font-bold text-foreground tracking-tight">Calculate course grade</CardTitle>
              <p className="text-muted-foreground font-bold text-xs mt-2">Select your course and enter your scores to get your final grade</p>
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
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
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
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
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
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
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
                      Enter your scores
                    </h3>
                    <div className="bg-card border border-border p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedCourse.formFields.map((field) => (
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
                            <p className="text-[11px] font-bold text-muted-foreground">{field.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button onClick={handleCalculate} className="flex-1 h-11 border border-border bg-primary hover:opacity-90 text-white text-sm font-bold transition-all rounded-2xl">
                      <Calculator className="w-5 h-5 mr-3" />
                      Calculate grade
                    </Button>
                    <Button onClick={() => {
                      setFormValues({})
                      setCalculatedScore(null)
                      setCalculatedGrade(null)
                    }} variant="outline" className="h-11 px-10 border border-border hover:bg-primary hover:text-white transition-all text-sm font-bold text-foreground rounded-2xl bg-card">
                      Reset
                    </Button>
                  </div>

                  {/* Result */}
                  {calculatedScore !== null && calculatedGrade && (
                    <div className="bg-muted/40 border border-border p-10 text-center mt-8">
                      <p className="text-muted-foreground text-sm mb-6 font-bold">Your final score</p>
                      <div className="flex items-center justify-center gap-12 flex-wrap">
                        <div>
                          <p className="text-6xl font-bold text-foreground mb-1">
                            {calculatedScore.toFixed(2)}
                          </p>
                          <p className="text-muted-foreground text-sm font-bold">Out of 100</p>
                        </div>
                        <div className="h-24 w-1 bg-muted"></div>
                        <div>
                          <p className="text-muted-foreground text-sm mb-1 font-bold">Grade</p>
                          <div className="text-6xl font-bold text-foreground leading-none">
                            {calculatedGrade}
                          </div>
                          <p className="text-xs font-bold text-primary mt-4 bg-card border border-primary px-3 py-1 inline-block">
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
          <Card className="bg-card border border-border max-w-4xl rounded-2xl">
            <CardHeader className="border-b pb-6 pt-8">
              <CardTitle className="text-3xl font-bold text-foreground tracking-tight">Calculate semester GPA</CardTitle>
              <p className="text-muted-foreground font-bold text-xs mt-2">Add your courses and grades to calculate your GPA</p>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              {/* Existing History */}
              <div className="space-y-6 mb-10">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                  Existing academic standing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-foreground">Current CGPA</Label>
                    <Input
                      type="number"
                      placeholder="E.G., 8.5"
                      value={existingCGPA}
                      onChange={(e) => setExistingCGPA(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-11 text-sm font-bold bg-card border border-border rounded-2xl text-foreground focus:ring-0 focus-visible:ring-0 focus:border-foreground placeholder:text-muted-foreground/70"
                      step="0.01"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-foreground">Total credits completed</Label>
                    <Input
                      type="number"
                      placeholder="E.G., 48"
                      value={completedCredits}
                      onChange={(e) => setCompletedCredits(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-11 text-sm font-bold bg-card border border-border rounded-2xl text-foreground focus:ring-0 focus-visible:ring-0 focus:border-foreground placeholder:text-muted-foreground/70"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                  Current semester courses
                </h3>
              </div>

              {/* Table Header */}
              <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-12 gap-4 px-4 pb-4 border-b">
                    <div className="col-span-6">
                      <Label className="text-[11px] font-bold text-muted-foreground">Course name</Label>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[11px] font-bold text-muted-foreground">Credits</Label>
                    </div>
                    <div className="col-span-3">
                      <Label className="text-[11px] font-bold text-muted-foreground">Grade</Label>
                    </div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Course Rows */}
                  <div className="space-y-4 pt-2">
                    {semesterCourses.map((course, index) => (
                      <div key={course.id} className="grid grid-cols-12 gap-4 p-4 bg-card border border-border items-center rounded-2xl">
                        <div className="col-span-6">
                          <Input
                            placeholder="E.G., mathematics i"
                            value={course.name}
                            onChange={(e) => setSemesterCourses(semesterCourses.map(c => 
                              c.id === course.id ? { ...c, name: e.target.value } : c
                            ))}
                            className="w-full h-12 text-sm font-bold bg-card border border-border rounded-2xl text-foreground focus:ring-0 focus-visible:ring-0 focus:border-foreground placeholder:text-muted-foreground/70"
                          />
                        </div>
                        <div className="col-span-2">
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
                            className="w-full h-12 text-sm font-bold bg-card border border-border rounded-2xl text-foreground focus:ring-0 focus-visible:ring-0 focus:border-foreground placeholder:text-muted-foreground/70 text-center"
                            min="0"
                            max="10"
                          />
                        </div>
                        <div className="col-span-3">
                          <Select value={course.gradePoints.toString()} onValueChange={(v) => 
                            setSemesterCourses(semesterCourses.map(c => 
                              c.id === course.id ? { ...c, gradePoints: Number(v) } : c
                            ))
                          }>
                            <SelectTrigger className="w-full h-12 text-sm font-bold bg-card border border-border rounded-2xl text-foreground focus:ring-0 focus-visible:ring-0 focus:border-foreground">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border border-border rounded-2xl">
                              {gradePointsOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value.toString()} className="text-foreground font-bold text-xs">{opt.label}</SelectItem>
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
                          className="h-12 w-12 rounded-2xl border border-border bg-card text-foreground hover:bg-primary hover:text-white transition-all"
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

          <Button onClick={addCourse} variant="outline" className="w-full h-11 border border-dashed border-foreground bg-card hover:bg-primary hover:text-white transition-all text-sm font-bold text-foreground rounded-2xl mt-6">
                <Plus className="w-5 h-5 mr-3" />
                Add another course
              </Button>

              {semesterResults !== null && (
                <div className="bg-muted/40 border border-border p-10 mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 divide-y md:divide-y-0 md:divide-x divide-border">
                    <div className="text-center pb-10 md:pb-0 md:pr-10">
                      <p className="text-muted-foreground text-sm mb-6 font-bold">Semester GPA (SGPA)</p>
                      <p className="text-6xl font-bold text-foreground mb-6 tracking-tight leading-none">{semesterResults.sgpa.toFixed(2)}</p>
                      <div className="inline-flex items-center px-4 py-2 border border-border bg-card">
                        <p className="text-sm font-bold text-foreground">
                          {semesterResults.sgpa >= 9 ? "Excellent" : semesterResults.sgpa >= 8 ? "Very good" : semesterResults.sgpa >= 7 ? "Good work" : "Keep going"}
                        </p>
                      </div>
                    </div>
                    
                    {semesterResults.updatedCGPA !== null && (
                      <div className="text-center pt-10 md:pt-0 md:pl-10">
                        <p className="text-muted-foreground text-sm mb-6 font-bold">Updated total CGPA</p>
                        <p className="text-6xl font-bold text-foreground mb-6 tracking-tight leading-none">{semesterResults.updatedCGPA.toFixed(2)}</p>
                        <p className="text-xs font-bold text-muted-foreground/70">Includes your current semester performance</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 mt-10 border-t">
                    <div className="text-center bg-card border border-border p-4">
                      <p className="text-muted-foreground/70 text-[11px] mb-2 font-bold">Courses</p>
                      <p className="text-3xl font-bold text-foreground">{semesterResults.totalCredits > 0 ? semesterCourses.filter(c => c.credits > 0).length : 0}</p>
                    </div>
                    <div className="text-center bg-card border border-border p-4">
                      <p className="text-muted-foreground/70 text-[11px] mb-2 font-bold">Credits</p>
                      <p className="text-3xl font-bold text-foreground">{semesterResults.totalCredits}</p>
                    </div>
                    <div className="text-center bg-card border border-border p-4">
                      <p className="text-muted-foreground/70 text-[11px] mb-2 font-bold">Points</p>
                      <p className="text-3xl font-bold text-foreground">{semesterResults.totalGradePoints.toFixed(1)}</p>
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
