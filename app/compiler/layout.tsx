import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Online Compiler",
  description: "Free online compiler. Write, run and share Python, Java, C and C++ code in your browser, no sign-up needed.",
}

// The workspace paints its own full-screen UI. Suspense lets it read ?s= share links.
export default function CompilerLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>
}
