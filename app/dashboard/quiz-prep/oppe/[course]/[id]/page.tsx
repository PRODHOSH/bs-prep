import { notFound } from "next/navigation"
import { OppeWorkspace } from "@/components/oppe/views"

export default async function Page({ params }: { params: Promise<{ course: string; id: string }> }) {
  const { course, id } = await params
  if (!/^[a-z0-9_]+$/.test(course) || !id) notFound()
  return <OppeWorkspace course={course} id={decodeURIComponent(id)} />
}
