import { NextRequest, NextResponse } from "next/server"
import { apiRateLimiter } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { courses, loadCourse, pickSet, summary } from "@/lib/oppe/data"

export const dynamic = "force-dynamic"

/** GET /api/oppe lists courses. ?course=x lists its problems. ?course=x&id=y returns one problem. */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!(await apiRateLimiter.check(`oppe:${ip}`)).success) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  const {
    data: { user },
  } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to use OPPE practice" }, { status: 401 })

  const course = request.nextUrl.searchParams.get("course")
  const id = request.nextUrl.searchParams.get("id")
  if (!course) {
    const list = await courses()
    return NextResponse.json({ available: list.length > 0, courses: list })
  }
  const problems = await loadCourse(course)
  if (!problems) return NextResponse.json({ error: "Course not found" }, { status: 404 })
  const exam = request.nextUrl.searchParams.get("exam")
  if (exam === "1" || exam === "2") {
    const set = pickSet(problems, Number(exam) as 1 | 2, 3)
    return set.length ? NextResponse.json({ problems: set }) : NextResponse.json({ error: "No problems for this exam" }, { status: 404 })
  }
  if (id) {
    const one = problems.find((p) => p.id === id)
    return one ? NextResponse.json({ problem: one }) : NextResponse.json({ error: "Problem not found" }, { status: 404 })
  }
  return NextResponse.json({ problems: problems.map(summary) })
}
