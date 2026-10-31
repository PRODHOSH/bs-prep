import { notFound } from "next/navigation"
import { OppeProblems } from "@/components/oppe/views"

export default async function Page({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params
  if (!/^[a-z0-9_]+$/.test(course)) notFound()
  return <OppeProblems course={course} />
}
