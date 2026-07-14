"use client"

import { PenTool, Lock } from "lucide-react"

export default function QuizPrepDashboardPage() {
  return (
    <div className="flex-1 p-6 md:p-12 lg:p-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-lg mx-auto bg-white p-12 rounded-3xl shadow-sm ring-1 ring-black/5">
        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <PenTool className="w-10 h-10 text-[#0a192f]" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-black/5">
            <Lock className="w-4 h-4 text-black/60" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-4">
          QUIZ PREP
        </h1>
        <div className="inline-flex items-center gap-2 bg-[#0a192f] text-white rounded-full text-xs font-black px-4 py-2 uppercase shadow-lg mb-6">
          COMING SOON
        </div>
        
        <p className="text-sm font-bold text-black/60 uppercase tracking-wide leading-relaxed">
          We are currently building the ultimate quiz preparation experience.
          Interactive mock tests, detailed analytics, and specialized question banks will be available here soon.
        </p>
      </div>
    </div>
  )
}
