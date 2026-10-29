import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { JsonLd } from "@/components/seo/json-ld"
import { pageMetadata, webAppLd } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Free Online Compiler for Python, Java, C & C++",
  description: "Write, run and share Python, Java, C and C++ code in your browser. A free online compiler with a multi-file editor, instant output and share links. No sign up.",
  path: "/compiler",
  keywords: ["online compiler", "Python online compiler", "Java online compiler", "C++ online compiler", "run code in browser", "IITM BS compiler"],
})

// The workspace paints its own full-screen UI. Suspense lets it read ?s= share links.
export default function CompilerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={webAppLd({
          name: "BSPrep Online Compiler",
          description: "Write, run and share Python, Java, C and C++ code in the browser.",
          path: "/compiler",
          category: "DeveloperApplication",
        })}
      />
      <h1 className="sr-only">Free online compiler for Python, Java, C and C++</h1>
      <p className="sr-only">Write, run and share Python, Java, C and C++ code in your browser. Multi-file editor, instant output and share links, with no sign up.</p>
      <Suspense>{children}</Suspense>
    </>
  )
}
