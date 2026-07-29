"use client"

import { createClient } from "@/lib/supabase/client"
import { courses as catalogCourses } from "@/lib/course-catalog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Course {
  id: string
  title: string
  description: string
  level: string
  created_at: string
  student_count: number
}

export default function MentorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    level: "beginner",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          level,
          created_at,
          enrollments (
            id
          )
        `)
        .eq("instructor_id", user.id)

      if (data) {
        const formattedCourses = data.map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          created_at: course.created_at,
          student_count: course.enrollments?.length || 0,
        }))
        setCourses(formattedCourses)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCourse = async () => {
    if (!newCourse.title) return

    setIsCreating(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("courses").insert({
        instructor_id: user.id,
        title: newCourse.title,
        description: newCourse.description,
        level: newCourse.level,
      })

      if (error) throw error

      setNewCourse({ title: "", description: "", level: "beginner" })
      fetchCourses()
    } catch (error) {
      console.error("Error creating course:", error)
      alert("Failed to create course")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Create and manage your courses</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary">Create Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>Add a new course for your students</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input
                  id="courseTitle"
                  placeholder="Enter course title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="courseDescription">Description</Label>
                <Textarea
                  id="courseDescription"
                  placeholder="Course description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="courseLevel">Level</Label>
                <Select value={newCourse.level} onValueChange={(value) => setNewCourse({ ...newCourse, level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateCourse} disabled={isCreating} className="w-full bg-primary">
                {isCreating ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading courses...</div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground mb-4">No courses yet. Create your first course!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => {
            const catalogMatch = catalogCourses.find(c => c.id === course.id || c.title === course.title)
            
            return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
                  </div>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Students Enrolled:</span>
                  <span className="font-semibold text-primary">{course.student_count}</span>
                </div>

                {catalogMatch?.driveFolderId && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Upload Slides</h4>
                    <p className="text-xs text-emerald-800 mb-3 leading-relaxed">Upload class slides to this folder so students can access them instantly on their dashboard. Files <strong className="font-black underline">MUST</strong> be named in <strong className="font-black">DD-MM-YYYY.pdf</strong> format (e.g. 19-02-2026.pdf) to perfectly sync with the correct class date.</p>
                    <a 
                      href={`https://drive.google.com/drive/folders/${catalogMatch.driveFolderId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-4 py-2 rounded shadow-sm hover:bg-emerald-700 transition-colors inline-block"
                    >
                      Open Google Drive
                    </a>
                  </div>
                )}

                <Button variant="outline" className="w-full bg-transparent mt-2">
                  Manage Course
                </Button>
              </CardContent>
            </Card>
          )})}
        </div>
      )}
    </div>
  )
}
