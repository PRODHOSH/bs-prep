"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import dynamic from "next/dynamic"

const CodeBlock = dynamic(() => import("@/components/dashboard/code-block"), {
  ssr: false,
  loading: () => <div className="h-16 animate-pulse bg-[#1e1e1e]" />,
})

/** Markdown renderer for doubt threads, shared by the student, mentor and admin views. */
export function ThreadMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre: ({ node, ...props }: any) => <div className="my-3" {...props} />,
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || "")
          const content = String(children).replace(/\n$/, "")
          const isBlock = !inline && (Boolean(match) || content.includes("\n"))
          return isBlock ? (
            <div className="my-3 overflow-hidden rounded-xl border bg-[#1e1e1e]">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#252526] px-4 py-2 font-mono text-xs text-slate-400">
                <span className="font-semibold">{match ? match[1] : "code"}</span>
              </div>
              <CodeBlock language={match ? match[1] : "python"}>{content}</CodeBlock>
            </div>
          ) : (
            <code className="mx-0.5 rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold" {...props}>
              {children}
            </code>
          )
        },
        table: ({ node, ...props }) => (
          <div className="my-3 overflow-x-auto">
            <table className="min-w-full border-collapse overflow-hidden rounded-xl border text-xs" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => <th className="border bg-muted p-2 text-left font-semibold" {...props} />,
        td: ({ node, ...props }) => <td className="border p-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="my-3 ml-5 list-disc space-y-1.5" {...props} />,
        ol: ({ node, ...props }) => <ol className="my-3 ml-5 list-decimal space-y-1.5" {...props} />,
        h1: ({ node, ...props }) => <h1 className="mb-2 mt-5 text-lg font-bold" {...props} />,
        h2: ({ node, ...props }) => <h2 className="mb-2 mt-4 text-base font-bold" {...props} />,
        h3: ({ node, ...props }) => <h3 className="mb-2 mt-4 text-sm font-bold" {...props} />,
        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed last:mb-0" {...props} />,
        a: ({ node, ...props }) => <a className="font-semibold text-primary underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
