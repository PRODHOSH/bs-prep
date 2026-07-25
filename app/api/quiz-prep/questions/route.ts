import { NextResponse } from "next/server"
import { fetchExamSession, AcademicLevel, ExamType } from "@/lib/quiz-drive-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const level = (searchParams.get("level") || "") as AcademicLevel
  const course = searchParams.get("course") || ""
  const exam = (searchParams.get("exam") || "") as ExamType
  const dateShift = searchParams.get("dateShift") || ""

  const validLevels: AcademicLevel[] = ["Foundation", "Diploma", "Degree"]
  const validExams: ExamType[] = ["Quiz 1", "Quiz 2", "End Term"]

  if (!validLevels.includes(level)) {
    return NextResponse.json(
      { error: "Invalid level parameter" },
      { status: 400 }
    )
  }
  if (!course.trim()) {
    return NextResponse.json(
      { error: "course parameter is required" },
      { status: 400 }
    )
  }
  if (!validExams.includes(exam)) {
    return NextResponse.json(
      { error: "Invalid exam parameter" },
      { status: 400 }
    )
  }
  if (!dateShift.trim()) {
    return NextResponse.json(
      { error: "dateShift parameter is required" },
      { status: 400 }
    )
  }

  const session = await fetchExamSession(level, course, exam, dateShift)

  return NextResponse.json({ success: true, ...session })
}
