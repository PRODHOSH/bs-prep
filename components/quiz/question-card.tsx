"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { field, Tag } from "@/components/dashboard/ui"
import { Modal } from "@/components/dashboard/controls"
import { TYPE_LABEL, type GradedItem, type QuizQuestion, type Response } from "@/lib/quiz/types"

/** Server-sanitised markup (see lib/quiz/html.ts). Images inside can be opened full size. */
function Rich({ html, className, onZoom }: { html: string; className?: string; onZoom: (src: string) => void }) {
  return (
    <div
      className={cn("quiz-rich text-base leading-relaxed [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:cursor-zoom-in [&_img]:rounded-lg [&_img]:bg-white [&_p]:my-2 [&_table]:my-2 [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-[13px] [&_code]:font-mono [&_code]:text-[13px]", className)}
      onClick={(e) => {
        const t = e.target as HTMLElement
        if (t instanceof HTMLImageElement) onZoom(t.src)
      }}
      // Screenshots are small, so anything wider than a few words fills the column. Inline formulas keep their size.
      onLoadCapture={(e) => {
        const t = e.target
        if (t instanceof HTMLImageElement && t.naturalWidth >= 320) t.style.width = "100%"
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function QuestionCard({
  question,
  number,
  response,
  onChange,
  review,
  passageNote,
  bare,
}: {
  question: QuizQuestion
  number: number
  response: Response | undefined
  onChange?: (r: Response) => void
  review?: GradedItem
  passageNote?: string
  /** Leave out the number and type line; the screen shows it elsewhere. */
  bare?: boolean
}) {
  const [zoom, setZoom] = useState<string | null>(null)
  const locked = !!review
  const chosen = Array.isArray(response) ? response : typeof response === "number" ? [response] : []
  const correct = new Set(review?.correctOptionIds ?? [])

  function toggle(id: number) {
    if (locked || !onChange) return
    if (question.type === "MCQ") onChange(chosen[0] === id ? null : id)
    else onChange(chosen.includes(id) ? chosen.filter((c) => c !== id) : [...chosen, id])
  }

  return (
    <div className="space-y-4">
      {!bare && (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-extrabold">Question {number}</span>
        <Tag>{TYPE_LABEL[question.type]}</Tag>
        <Tag>
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </Tag>
        {question.type === "MSQ" && !locked && <span className="text-xs text-muted-foreground">Select all that apply</span>}
      </div>
      )}

      {question.passage && (
        <div className="rounded-xl border bg-muted/50 p-4">
          {passageNote && <p className="mb-2 text-xs font-semibold text-muted-foreground">{passageNote}</p>}
          <Rich html={question.passage.html} onZoom={setZoom} />
        </div>
      )}

      <Rich html={question.html} onZoom={setZoom} />
      {question.images.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" referrerPolicy="no-referrer" onClick={() => setZoom(src)} onLoad={(e) => { if (e.currentTarget.naturalWidth >= 320) e.currentTarget.style.width = "100%" }} className="h-auto max-w-full cursor-zoom-in rounded-lg bg-white" />
      ))}

      {question.type === "NUM" ? (
        <div className="max-w-xs space-y-2">
          <input
            inputMode="decimal"
            autoComplete="off"
            disabled={locked}
            value={typeof response === "string" ? response : ""}
            onChange={(e) => onChange?.(e.target.value.replace(/[^0-9eE.+\-,]/g, "").slice(0, 40))}
            placeholder="Type your answer"
            aria-label="Numeric answer"
            className={cn(field, "font-mono")}
          />
          {review && (
            <p className="text-sm">
              <span className="text-muted-foreground">Expected </span>
              <span className="font-mono font-semibold">{review.expected ?? "not available"}</span>
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {question.options.map((o, i) => {
            const picked = chosen.includes(o.id)
            const isRight = correct.has(o.id)
            const state = !locked ? (picked ? "picked" : "idle") : isRight ? "right" : picked ? "wrong" : "idle"
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => toggle(o.id)}
                  aria-pressed={picked}
                  disabled={locked}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-colors disabled:cursor-default",
                    state === "idle" && "bg-card hover:bg-muted/60",
                    state === "picked" && "border-primary bg-primary/5",
                    state === "right" && "border-chart-4/60 bg-chart-4/10",
                    state === "wrong" && "border-destructive/50 bg-destructive/10",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center border text-xs font-bold",
                      question.type === "MCQ" ? "rounded-full" : "rounded-md",
                      state === "picked" && "border-primary bg-primary text-primary-foreground",
                      state === "right" && "border-chart-4 bg-chart-4 text-white",
                      state === "wrong" && "border-destructive bg-destructive text-white",
                    )}
                  >
                    {state === "right" ? <Check className="size-3.5" /> : state === "wrong" ? <X className="size-3.5" /> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0 flex-1">
                    {o.html && <Rich html={o.html} onZoom={setZoom} />}
                    {o.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.image} alt={`Option ${String.fromCharCode(65 + i)}`} referrerPolicy="no-referrer" className="h-auto max-h-80 max-w-full rounded-lg bg-white" />
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Modal open={!!zoom} onClose={() => setZoom(null)} title="Image" width="max-w-4xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {zoom && <img src={zoom} alt="" referrerPolicy="no-referrer" className="mx-auto max-h-[75vh] max-w-full rounded-lg bg-white" />}
      </Modal>
    </div>
  )
}
