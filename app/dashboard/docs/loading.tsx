import { GridPageSkeleton } from "@/components/dashboard/skeleton"

export default function Loading() {
  return <GridPageSkeleton tabs={0} toolbar={false} count={6} image={false} />
}
