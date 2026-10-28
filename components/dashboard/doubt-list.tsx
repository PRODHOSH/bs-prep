"use client"

import { useState } from "react"
import { SkRows } from "@/components/dashboard/skeleton"
import Link from "next/link"
import { ArrowUpRight, CheckCircle2, MessageCircleQuestion, MessageSquare } from "lucide-react"
import { SearchBox, Tabs } from "@/components/dashboard/controls"
import { Avatar, EmptyState, Tag } from "@/components/dashboard/ui"

export type DoubtRow = {
  id: string
  title: string
  subject: string
  status: string
  created_at: string
  author: { full_name: string }
}

export function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/** Filterable list of doubts. `basePath` is where each row links, e.g. /mentor/doubts. */
export function DoubtList({ doubts, loading, basePath }: { doubts: DoubtRow[]; loading: boolean; basePath: string }) {
  const [tab, setTab] = useState<"all" | "open" | "resolved">("all")
  const [query, setQuery] = useState("")

  const open = doubts.filter((d) => d.status !== "resolved")
  const visible = doubts.filter((d) => {
    if (tab === "open" && d.status === "resolved") return false
    if (tab === "resolved" && d.status !== "resolved") return false
    const q = query.trim().toLowerCase()
    return !q || d.title.toLowerCase().includes(q) || d.subject?.toLowerCase().includes(q) || d.author.full_name.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <Tabs
          tabs={[
            { id: "all", label: "All", count: doubts.length },
            { id: "open", label: "Open", count: open.length },
            { id: "resolved", label: "Resolved", count: doubts.length - open.length },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="mt-5">
          <SearchBox value={query} onChange={setQuery} placeholder="Search doubts" className="max-w-sm" />
        </div>
      </div>

      {loading ? (
        <SkRows rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState icon={MessageCircleQuestion} title="No doubts found" hint="Nothing matches this filter." />
      ) : (
        <ul className="space-y-3">
          {visible.map((d) => (
            <li key={d.id} className="group relative rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {d.subject && <Tag tone="primary">{d.subject}</Tag>}
                    {d.status === "resolved" ? (
                      <Tag tone="green"><CheckCircle2 className="size-3" /> Resolved</Tag>
                    ) : (
                      <Tag tone="amber"><MessageSquare className="size-3" /> Open</Tag>
                    )}
                  </div>
                  <h3 className="mt-2.5 line-clamp-2 text-[15px] font-bold leading-snug">{d.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar name={d.author.full_name} size={20} />
                    <span className="font-medium">{d.author.full_name}</span>
                    <span>·</span>
                    <span>{timeAgo(d.created_at)}</span>
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <Link href={`${basePath}/${d.id}`} aria-label={d.title} className="absolute inset-0 rounded-2xl" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
