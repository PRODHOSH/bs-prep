import { CompilerSkeleton } from "@/components/dashboard/skeleton"

export default function Loading() {
  return (
    <div className="h-[calc(100svh-7rem)] min-h-[28rem] sm:h-[calc(100svh-8rem)]">
      <CompilerSkeleton />
    </div>
  )
}
