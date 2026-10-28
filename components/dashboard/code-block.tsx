"use client"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

// Loaded on demand (see markdown.tsx): the highlighter and its theme are large and only needed on thread pages.
export default function CodeBlock({ language, children }: { language: string; children: string }) {
  return (
    <SyntaxHighlighter
      style={vscDarkPlus as any}
      language={language}
      PreTag="div"
      customStyle={{ margin: 0, padding: "1.25rem", background: "#1e1e1e", fontSize: "0.825rem", lineHeight: "1.6", borderRadius: 0 }}
    >
      {children}
    </SyntaxHighlighter>
  )
}
