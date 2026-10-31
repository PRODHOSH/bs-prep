import { NextRequest, NextResponse } from "next/server"
import { catalog } from "@/lib/quiz/service"
import { failure, guard } from "@/lib/quiz/api"
import type { CatalogResponse, PaperInfo } from "@/lib/quiz/types"

export const dynamic = "force-dynamic"

/** GET /api/quiz/catalog lists subjects. Add ?subject=maths1 to include that subject's papers, newest first. */
export async function GET(request: NextRequest) {
  const blocked = await guard(request)
  if (blocked) return blocked
  try {
    const data = await catalog()
    const body: CatalogResponse & { papers?: PaperInfo[] } = { available: !!data, subjects: data?.subjects ?? [] }
    const subject = request.nextUrl.searchParams.get("subject")
    if (subject && data) body.papers = data.papers.filter((p) => p.subjectId === subject)
    return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=300" } })
  } catch (error) {
    return failure(error)
  }
}
