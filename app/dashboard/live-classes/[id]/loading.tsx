import { GridPageSkeleton } from "@/components/dashboard/skeleton"

export default function Loading() {
  return <div className="mx-auto max-w-2xl"><GridPageSkeleton tabs={0} toolbar={false} count={1} image={false} /></div>
}
