"use client"

import { useState, useEffect } from "react"
import { SkRows } from "@/components/dashboard/skeleton"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ArrowUpRight, CheckCircle2, MessageCircleQuestion, MessageSquare, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { SearchBox, Tabs } from "@/components/dashboard/controls"
import { Avatar, EmptyState, PageHeader, Tag, btnPrimary } from "@/components/dashboard/ui"

type Doubt = {
  id: string
  title: string
  subject: string
  status: string
  created_at: string
  author: { full_name: string }
  replies_count: number
}

export default function DashboardDoubtsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "open" | "resolved">("all")
  const [query, setQuery] = useState("")
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDoubts()
  }, [])

  const fetchDoubts = async () => {
    setLoading(true)
    
    // Fetch doubts with author profile and course
    const { data: doubtsData, error } = await supabase
      .from('doubts')
      .select(`
        id, 
        title, 
        status, 
        created_at, 
        subject,
        profiles:user_id ( first_name, last_name, email )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("SUPABASE ERROR:", JSON.stringify(error, null, 2))
      setLoading(false)
      return
    }

    // Fetch reply counts manually if needed, or just assume 0 for now to keep simple
    const formattedDoubts = doubtsData.map((d: any) => {
      const p = d.profiles
      const name = (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : '') || p?.email?.split('@')[0] || 'BSPrep Student'
      return {
        id: d.id,
        title: d.title,
        subject: d.subject,
        status: d.status,
        created_at: d.created_at,
        author: { full_name: name },
        replies_count: 0 // In a real app we'd do a count query or a view
      }
    })
    
    setDoubts(formattedDoubts)
    setLoading(false)
  }

  const handleAskDoubt = () => {
    router.push("/dashboard/doubts/new")
  }

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return `${diff} seconds ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  const visible = doubts.filter((d) => {
    if (activeTab !== "all" && d.status !== activeTab) return false
    const q = query.trim().toLowerCase()
    return !q || d.title.toLowerCase().includes(q) || d.subject?.toLowerCase().includes(q) || d.author.full_name.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doubts"
        description="Ask questions, help peers and get answers from mentors."
        actions={
          <button onClick={handleAskDoubt} className={btnPrimary}>
            <Plus className="size-4" /> Ask a doubt
          </button>
        }
      />

      <div>
        <Tabs
          tabs={[
            { id: "all", label: "All", count: doubts.length },
            { id: "open", label: "Open", count: doubts.filter((d) => d.status !== "resolved").length },
            { id: "resolved", label: "Resolved", count: doubts.filter((d) => d.status === "resolved").length },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        <div className="mt-5">
          <SearchBox value={query} onChange={setQuery} placeholder="Search doubts" className="max-w-sm" />
        </div>
      </div>

      {loading ? (
        <SkRows rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={MessageCircleQuestion}
          title="No doubts found"
          hint="Nothing matches this filter yet."
          action={<button onClick={handleAskDoubt} className={btnPrimary}><Plus className="size-4" /> Ask a doubt</button>}
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((doubt) => (
            <li key={doubt.id} className="group relative rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {doubt.subject && <Tag tone="primary">{doubt.subject}</Tag>}
                    {doubt.status === "resolved" ? (
                      <Tag tone="green"><CheckCircle2 className="size-3" /> Resolved</Tag>
                    ) : (
                      <Tag tone="amber"><MessageSquare className="size-3" /> Open</Tag>
                    )}
                  </div>
                  <h3 className="mt-2.5 line-clamp-2 text-[15px] font-bold leading-snug">{doubt.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar name={doubt.author.full_name} size={20} />
                    <span className="font-medium">{doubt.author.full_name}</span>
                    <span>·</span>
                    <span>{timeAgo(doubt.created_at)}</span>
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <Link href={`/dashboard/doubts/${doubt.id}`} aria-label={doubt.title} className="absolute inset-0 rounded-2xl" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
