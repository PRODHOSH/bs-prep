import { NextRequest, NextResponse } from "next/server"
import { failure, gradeSchema, guard } from "@/lib/quiz/api"
import { gradeItems } from "@/lib/quiz/service"
import type { GradeRequest, GradeResponse } from "@/lib/quiz/types"

export const dynamic = "force-dynamic"

/** Grades a finished test. This is the only place the correct answers are sent to the browser. */
export async function POST(request: NextRequest) {
  const blocked = await guard(request)
  if (blocked) return blocked
  try {
    const body = gradeSchema.parse(await request.json()) as GradeRequest
    const result: GradeResponse = { items: await gradeItems(body) }
    return NextResponse.json(result)
  } catch (error) {
    return failure(error)
  }
}
