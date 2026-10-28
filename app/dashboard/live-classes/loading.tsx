import { GridPageSkeleton } from "@/components/dashboard/skeleton"

export default function Loading() {
  return <GridPageSkeleton tabs={3} chips={3} count={6} image={false} />
}
