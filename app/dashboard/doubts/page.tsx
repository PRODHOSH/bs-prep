"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MessageCircleQuestion,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  MessageSquare,
} from "lucide-react"

// Static mock data for the Doubts workflow
const mockDoubts = [
  {
    id: "1",
    title: "Understanding Bayesian Probability vs Frequentist",
    course: "Statistics for Data Science I",
    status: "resolved",
    replies: 4,
    lastUpdate: "2 hours ago",
    author: "Student 1",
  },
  {
    id: "2",
    title: "Can someone explain the recursive function in Week 4 assignment?",
    course: "Computational Thinking",
    status: "open",
    replies: 1,
    lastUpdate: "5 hours ago",
    author: "Student 2",
  },
  {
    id: "3",
    title: "Is it possible to use L'Hopital's rule for limits at infinity here?",
    course: "Mathematics for Data Science I",
    status: "in_progress",
    replies: 2,
    lastUpdate: "1 day ago",
    author: "Student 3",
  },
]

export default function DashboardDoubtsPage() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="flex-1 p-6 md:p-10 lg:p-12 w-full max-w-7xl mx-auto flex flex-col min-h-[90vh]">
      
      {/* Header section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full text-[10px] font-black uppercase tracking-widest text-black mb-4">
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            <span>Community Support</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight leading-none mb-4">
            DOUBTS & SUPPORT
          </h1>
          <p className="text-sm font-bold text-black/60 uppercase tracking-widest max-w-2xl">
            Ask questions, help peers, and get answers directly from mentors and subject matter experts.
          </p>
        </div>
        
        <Button className="bg-black hover:bg-black/90 text-white rounded-2xl h-14 px-8 text-xs font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all shrink-0">
          ASK A DOUBT
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl border border-black/10 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {["all", "open", "in_progress", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === tab 
                  ? "bg-black text-white shadow-md" 
                  : "bg-transparent text-black/60 hover:bg-black/5"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input 
              type="text" 
              placeholder="SEARCH DOUBTS..." 
              className="w-full h-12 pl-12 pr-4 bg-black/5 border-transparent focus:border-black/20 focus:bg-white rounded-2xl text-xs font-bold uppercase tracking-widest text-black outline-none transition-all"
            />
          </div>
          <button className="h-12 px-4 bg-black/5 hover:bg-black/10 rounded-2xl text-black flex items-center justify-center transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List of doubts */}
      <div className="space-y-4 flex-1">
        {mockDoubts
          .filter(d => activeTab === "all" || d.status === activeTab)
          .map((doubt) => (
          <div 
            key={doubt.id}
            className="group bg-white border border-black/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-black/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {doubt.course}
                </span>
                
                {doubt.status === "resolved" ? (
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                  </span>
                ) : doubt.status === "in_progress" ? (
                  <span className="flex items-center gap-1 text-[#1e3a8a] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> In Progress
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <MessageSquare className="w-3.5 h-3.5" /> Open
                  </span>
                )}
              </div>
              
              <h3 className="text-xl md:text-2xl font-black text-black tracking-tight group-hover:text-[#1e3a8a] transition-colors line-clamp-2">
                {doubt.title}
              </h3>
              
              <div className="flex items-center gap-4 text-xs font-bold text-black/50 uppercase tracking-widest">
                <span>By {doubt.author}</span>
                <span className="w-1 h-1 rounded-full bg-black/20"></span>
                <span>{doubt.lastUpdate}</span>
                <span className="w-1 h-1 rounded-full bg-black/20"></span>
                <span className="flex items-center gap-1.5">
                  <MessageCircleQuestion className="w-4 h-4" />
                  {doubt.replies} Replies
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-end">
              <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center text-black transition-all">
                <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              </div>
            </div>
          </div>
        ))}
        
        {mockDoubts.filter(d => activeTab === "all" || d.status === activeTab).length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/10">
            <MessageCircleQuestion className="w-12 h-12 text-black/20 mx-auto mb-4" />
            <p className="text-sm font-black text-black/40 uppercase tracking-widest">
              NO DOUBTS FOUND FOR THIS FILTER.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
