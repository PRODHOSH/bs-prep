import { ListPageSkeleton } from "@/components/dashboard/skeleton"

export default function Loading() {
  return <div className="mx-auto max-w-3xl"><ListPageSkeleton tabs={0} rows={4} icon /></div>
}
