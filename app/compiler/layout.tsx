import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Python Compiler | BSPrep",
  description: "Online Python 3 compiler — write, run, and share Python code in your browser.",
}

/**
 * Isolated layout for /compiler.
 * - No Navbar / Footer
 * - No BeamsBackground dotted canvas
 * - Wraps in Suspense so useSearchParams() works for share links
 */
export default function CompilerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="cc-layout-root">
      <Suspense>
        {children}
      </Suspense>
    </div>
  )
}
