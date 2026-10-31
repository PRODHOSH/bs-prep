import { NextRequest, NextResponse } from "next/server"
import { failure, guard, startSchema } from "@/lib/quiz/api"
import { startTest } from "@/lib/quiz/service"
import type { StartRequest } from "@/lib/quiz/types"

export const dynamic = "force-dynamic"

/** Builds a test and returns its questions without the answers. */
export async function POST(request: NextRequest) {
  const blocked = await guard(request)
  if (blocked) return blocked
  try {
    const body = startSchema.parse(await request.json()) as StartRequest
    return NextResponse.json(await startTest(body))
  } catch (error) {
    return failure(error)
  }
}
