import { notFound } from "next/navigation"
import { CoursePicker } from "@/components/quiz/hub"
import type { ExamKind } from "@/lib/quiz/types"

export default async function Page({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  if (!["quiz1", "quiz2", "endterm", "practice"].includes(kind)) notFound()
  return <CoursePicker kind={kind as ExamKind | "practice"} />
}
