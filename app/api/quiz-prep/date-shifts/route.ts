import { NextResponse } from "next/server"
import { fetchDateShifts, AcademicLevel, ExamType } from "@/lib/quiz-drive-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const level = (searchParams.get("level") || "") as AcademicLevel
  const course = searchParams.get("course") || ""
  const exam = (searchParams.get("exam") || "") as ExamType

  const dateShifts = await fetchDateShifts(level, course, exam)

  return NextResponse.json({ success: true, dateShifts })
}
