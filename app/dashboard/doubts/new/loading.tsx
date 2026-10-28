import { FormPageSkeleton } from "@/components/dashboard/skeleton"

export default function Loading() {
  return <div className="mx-auto max-w-2xl"><FormPageSkeleton fields={4} /></div>
}
