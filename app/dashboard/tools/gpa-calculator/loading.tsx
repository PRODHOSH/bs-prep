import { FormPageSkeleton } from "@/components/dashboard/skeleton"

export default function Loading() {
  return <div className="mx-auto max-w-4xl"><FormPageSkeleton fields={5} /></div>
}
