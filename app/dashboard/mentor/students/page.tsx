"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface Student {
  id: string
  name: string
  email: string
  course: string
  progress: number
  status: string
}

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("enrollments")
        .select(`
          id,
          progress,
          status,
          profiles (
            id,
            first_name,
            last_name,
            email
          ),
          courses (
            id,
            instructor_id,
            title
          )
        `)
        .eq("courses.instructor_id", user.id)

      if (data) {
        const formattedStudents = data
          .map((enrollment) => {
            const profile = Array.isArray(enrollment.profiles) ? enrollment.profiles[0] : enrollment.profiles
            const course = Array.isArray(enrollment.courses) ? enrollment.courses[0] : enrollment.courses

            return {
              id: profile?.id || enrollment.id,
              name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Unknown Student",
              email: profile?.email || "No email",
              course: course?.title || "Unknown",
              progress: enrollment.progress,
              status: enrollment.status,
              instructorId: course?.instructor_id,
            }
          })
          .filter((student) => student.instructorId === user.id)
          .map(({ instructorId, ...student }) => student)
        setStudents(formattedStudents)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-muted-foreground">Track your student progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Students: {students.length}</CardTitle>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">Loading students...</div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center text-muted-foreground">No students enrolled yet</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <Card key={student.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    <p className="text-sm text-muted-foreground">Course: {student.course}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <div>
                      <span className="text-2xl font-bold text-primary">{student.progress}%</span>
                      <p className="text-xs text-muted-foreground">progress</p>
                    </div>
                    <Badge variant={student.status === "active" ? "default" : "outline"}>{student.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
