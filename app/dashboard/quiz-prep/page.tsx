"use client"

import { PenTool } from "lucide-react"
import { EmptyState, PageHeader, Tag } from "@/components/dashboard/ui"

export default function QuizPrepDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Quiz prep" description="Mock tests and practice for your quizzes." actions={<Tag tone="amber">Coming soon</Tag>} />
      <EmptyState
        icon={PenTool}
        title="We're building quiz prep"
        hint="Interactive mock tests, detailed analytics and specialised question banks will be available here soon."
      />
    </div>
  )
}
