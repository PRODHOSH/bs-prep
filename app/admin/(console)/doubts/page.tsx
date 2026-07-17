"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  MessageCircleQuestion,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  MessageSquare
} from "lucide-react"
import { useRouter } from "next/navigation"

type Doubt = {
  id: string
  title: string
  subject: string
  status: string
  created_at: string
  author: { full_name: string }
}

export default function AdminDoubtsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDoubts()
  }, [])

  const fetchDoubts = async () => {
    setLoading(true)
    
    const { data: doubtsData, error } = await supabase
      .from('doubts')
      .select(`
        id, 
        title, 
        status, 
        created_at, 
        subject,
        profiles:user_id ( first_name, last_name )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const formattedDoubts = doubtsData.map((d: any) => {
      const p = d.profiles
      return {
        id: d.id,
        title: d.title,
        subject: d.subject,
        status: d.status,
        created_at: d.created_at,
        author: { full_name: p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Unknown' }
      }
    })
    
    setDoubts(formattedDoubts)
    setLoading(false)
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

  return (
    <div className="space-y-6">
      
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold uppercase italic tracking-tight text-white mb-2">
            Manage Doubts
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View, moderate, and resolve student doubts.
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-[#070c15] p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {["all", "open", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shrink-0 ${
                activeTab === tab 
                  ? "bg-white text-black shadow-md" 
                  : "bg-transparent text-slate-400 hover:bg-white/5"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="SEARCH DOUBTS..." 
              className="w-full h-10 pl-10 pr-4 bg-[#0b1220] border border-white/10 focus:border-white/20 rounded-xl text-xs font-medium uppercase tracking-widest text-slate-100 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 rounded-2xl border border-white/10 bg-[#070c15] animate-pulse">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">LOADING DOUBTS...</p>
          </div>
        ) : (
          <>
            {doubts
              .filter(d => activeTab === "all" || d.status === activeTab)
              .map((doubt) => (
              <div 
                key={doubt.id}
                onClick={() => router.push(`/admin/doubts/${doubt.id}`)}
                className="group rounded-2xl border border-white/10 bg-[#070c15] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 hover:bg-[#0b1220] transition-all cursor-pointer"
              >
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest">
                      {doubt.subject}
                    </span>
                    
                    {doubt.status === "resolved" ? (
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest">
                        <MessageSquare className="w-3.5 h-3.5" /> Open
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-100 tracking-tight group-hover:text-blue-300 transition-colors line-clamp-2">
                    {doubt.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
                    <span>By {doubt.author.full_name}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span>{timeAgo(doubt.created_at)}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400 flex items-center justify-center text-slate-400 transition-all">
                    <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
            
            {doubts.filter(d => activeTab === "all" || d.status === activeTab).length === 0 && (
              <div className="text-center py-20 rounded-2xl border border-white/10 bg-[#070c15]">
                <MessageCircleQuestion className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                  NO DOUBTS FOUND FOR THIS FILTER.
                </p>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  )
}
