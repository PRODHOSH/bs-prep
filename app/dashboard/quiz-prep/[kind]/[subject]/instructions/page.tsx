import { notFound } from "next/navigation"
import { Instructions } from "@/components/quiz/hub"
import type { ExamKind } from "@/lib/quiz/types"

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; subject: string }>
  searchParams: Promise<{ paper?: string; mode?: string }>
}) {
  const { kind, subject } = await params
  const { paper, mode } = await searchParams
  if (!["quiz1", "quiz2", "endterm", "practice"].includes(kind) || !/^[a-z0-9_]+$/.test(subject)) notFound()
  const m = kind === "practice" ? (mode === "custom" ? "custom" : "quick") : mode === "quick" || mode === "custom" ? mode : "mock"
  if (m === "mock" && !paper) notFound()
  return <Instructions kind={kind as ExamKind | "practice"} subjectId={subject} paperId={paper ?? null} mode={m} />
}
