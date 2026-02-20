"use client"

export function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        {/* Loading Text */}
        <h3 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Loading...
          </span>
        </h3>
        
        {/* Simple Spinner */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
}
