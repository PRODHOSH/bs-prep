// Server only. Shared guard for the quiz API routes: rate limit, then require a signed-in student.

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { apiRateLimiter } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { QuizError } from "./service"

export async function guard(request: NextRequest): Promise<NextResponse | null> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const limit = await apiRateLimiter.check(`quiz:${ip}`)
  if (!limit.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const {
    data: { user },
  } = await (await createClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to use quiz prep" }, { status: 401 })
  return null
}

export function failure(error: unknown) {
  if (error instanceof QuizError) return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  console.error("Quiz API error", error)
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
}

const kind = z.enum(["quiz1", "quiz2", "endterm"])
const qtype = z.enum(["MCQ", "MSQ", "NUM"])
const subjectId = z.string().regex(/^[a-z0-9_]{1,40}$/)
const minutes = z.number().int().min(5).max(240).nullable()

export const startSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("mock"), paperId: z.string().min(3).max(300), minutes }),
  z.object({ mode: z.literal("quick"), subjectId, count: z.number().int().min(5).max(20), kinds: z.array(kind).max(3) }),
  z.object({
    mode: z.literal("custom"),
    subjectId,
    count: z.number().int().min(5).max(60),
    kinds: z.array(kind).max(3),
    types: z.array(qtype).max(3),
    minutes,
  }),
  z.object({ mode: z.literal("retry"), items: z.array(z.object({ subjectId, id: z.number().int() })).min(1).max(100), minutes }),
])

export const gradeSchema = z.object({
  items: z
    .array(
      z.object({
        subjectId,
        id: z.number().int(),
        response: z.union([z.number().int(), z.array(z.number().int()).max(12), z.string().max(40), z.null()]),
      }),
    )
    .min(1)
    .max(200),
})
