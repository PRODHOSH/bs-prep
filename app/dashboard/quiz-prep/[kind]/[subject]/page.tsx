import { notFound } from "next/navigation"
import { PaperPicker } from "@/components/quiz/hub"
import type { ExamKind } from "@/lib/quiz/types"

export default async function Page({ params }: { params: Promise<{ kind: string; subject: string }> }) {
  const { kind, subject } = await params
  if (!["quiz1", "quiz2", "endterm", "practice"].includes(kind) || !/^[a-z0-9_]+$/.test(subject)) notFound()
  return <PaperPicker kind={kind as ExamKind | "practice"} subjectId={subject} />
}
