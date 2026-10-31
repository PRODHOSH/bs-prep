import { notFound } from "next/navigation"
import { OppeExams } from "@/components/oppe/test"

export default async function Page({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params
  if (!/^[a-z0-9_]+$/.test(course)) notFound()
  return <OppeExams course={course} counts={null} />
}
