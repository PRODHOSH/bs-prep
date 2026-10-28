"use client"

import type { ReactNode } from "react"
import { ArrowLeft, BadgeCheck, CheckCircle2, Send, Trash2 } from "lucide-react"
import { ThreadMarkdown } from "@/components/dashboard/markdown"
import { Avatar, Notice, Tag, btnPrimary } from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

type Person = { full_name: string; photo_url: string | null }
type ThreadDoubt = {
  title: string
  description: string
  status: string
  subject: string
  image_urls: string[]
  created_at: string
  author: Person
}
type ThreadReply = {
  id: string
  content: string
  created_at: string
  is_official_answer: boolean
  is_accepted_answer: boolean
  author: Person
}

/** Moderation view of a doubt thread, shared by the admin and mentor consoles. */
export function ModerationThread({
  doubt,
  replies,
  onBack,
  actions,
  onDeleteReply,
  reply,
}: {
  doubt: ThreadDoubt
  replies: ThreadReply[]
  onBack: () => void
  actions: ReactNode
  onDeleteReply: (id: string) => void
  reply: { value: string; onChange: (v: string) => void; onSubmit: (e: React.FormEvent) => void; submitting: boolean; hint: string }
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to doubts
        </button>
        <div className="flex items-center gap-2">{actions}</div>
      </div>

      <article className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          {doubt.subject && <Tag tone="primary">{doubt.subject}</Tag>}
          {doubt.status === "resolved" ? <Tag tone="green"><CheckCircle2 className="size-3" /> Resolved</Tag> : <Tag tone="amber">Open</Tag>}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{doubt.title}</h1>
        <div className="mt-4 flex items-center gap-3 border-b pb-5">
          <Avatar name={doubt.author.full_name} src={doubt.author.photo_url} size={36} />
          <div>
            <p className="text-sm font-bold leading-tight">{doubt.author.full_name}</p>
            <p className="text-xs text-muted-foreground">{new Date(doubt.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed">{doubt.description}</p>
        {doubt.image_urls?.length > 0 && (
          <div className="mt-5 flex flex-col gap-4">
            {doubt.image_urls.map((url, i) => (
              <a href={url} target="_blank" rel="noreferrer" key={i} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Attachment ${i + 1}`} className="max-h-[30rem] w-auto max-w-full cursor-zoom-in rounded-xl border" />
              </a>
            ))}
          </div>
        )}
      </article>

      <h2 className="flex items-center gap-2 text-sm font-bold">
        Replies <span className="rounded-md bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">{replies.length}</span>
      </h2>

      <ul className="space-y-4">
        {replies.map((r) => (
          <li key={r.id} className="flex gap-3">
            <Avatar name={r.author.full_name} src={r.author.photo_url} size={36} />
            <div className={cn("min-w-0 flex-1 rounded-2xl rounded-tl-sm px-4 py-3", r.is_accepted_answer ? "border border-chart-4/40 bg-chart-4/5" : "bg-muted/60")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                  {r.author.full_name}
                  {r.is_official_answer && <Tag tone="primary"><BadgeCheck className="size-3" /> Mentor</Tag>}
                  <span className="font-medium text-muted-foreground">· {new Date(r.created_at).toLocaleDateString()}</span>
                </p>
                <span className="flex items-center gap-2">
                  {r.is_accepted_answer && <Tag tone="green"><CheckCircle2 className="size-3" /> Accepted</Tag>}
                  <button onClick={() => onDeleteReply(r.id)} aria-label="Delete reply" title="Delete reply" className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </div>
              <div className="mt-2 text-sm">
                <ThreadMarkdown>{r.content}</ThreadMarkdown>
              </div>
            </div>
          </li>
        ))}
        {replies.length === 0 && <li className="text-sm text-muted-foreground">No replies yet.</li>}
      </ul>

      {doubt.status !== "resolved" ? (
        <form onSubmit={reply.onSubmit} className="rounded-2xl border bg-card p-3">
          <textarea
            value={reply.value}
            onChange={(e) => reply.onChange(e.target.value)}
            placeholder="Write an official reply"
            className="h-28 w-full resize-none bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground/70"
            required
          />
          <div className="flex items-center justify-between border-t pt-3">
            <span className="px-2 text-xs text-muted-foreground">{reply.hint}</span>
            <button type="submit" disabled={reply.submitting} className={btnPrimary}>
              <Send className="size-4" /> {reply.submitting ? "Posting…" : "Post reply"}
            </button>
          </div>
        </form>
      ) : (
        <Notice>This doubt has been marked as resolved.</Notice>
      )}
    </div>
  )
}
