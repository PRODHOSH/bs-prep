import { Suspense } from "react"
import { CompilerWorkspace } from "@/components/compiler/workspace"
import { CompilerSkeleton } from "@/components/dashboard/skeleton"

export const metadata = { title: "Compiler" }

// The workspace fills the space below the top bar; focus mode lifts it over the whole screen.
export default function DashboardCompilerPage() {
  return (
    <div className="h-[calc(100svh-7rem)] min-h-[28rem] sm:h-[calc(100svh-8rem)]">
      <Suspense fallback={<CompilerSkeleton />}>
        <CompilerWorkspace variant="dashboard" />
      </Suspense>
    </div>
  )
}
