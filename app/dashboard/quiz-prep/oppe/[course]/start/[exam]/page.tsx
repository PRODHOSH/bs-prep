import { notFound } from "next/navigation"
import { OppeSetup } from "@/components/oppe/test"

export default async function Page({ params }: { params: Promise<{ course: string; exam: string }> }) {
  const { course, exam } = await params
  if (!/^[a-z0-9_]+$/.test(course) || (exam !== "1" && exam !== "2")) notFound()
  return <OppeSetup course={course} exam={Number(exam) as 1 | 2} />
}
