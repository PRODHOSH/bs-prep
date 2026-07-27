"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, CheckCircle2, MessageCircleQuestion, Send, User, BadgeCheck, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

type Reply = {
  id: string
  content: string
  created_at: string
  is_official_answer: boolean
  is_accepted_answer: boolean
  author: { full_name: string, photo_url: string | null }
  user_id: string
}

type Doubt = {
  id: string
  title: string
  description: string
  status: string
  image_urls: string[]
  created_at: string
  user_id: string
  author: { full_name: string, photo_url: string | null }
  subject: string
}

export default function DoubtDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const doubtId = params.id as string

  const [loading, setLoading] = useState(true)
  const [doubt, setDoubt] = useState<Doubt | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReply, setNewReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchDoubtData()
    checkUser()
  }, [doubtId])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      setCurrentUserId(data.session.user.id)
    }
  }

  const fetchDoubtData = async () => {
    setLoading(true)
    
    // Fetch Doubt
    const { data: dData, error: dError } = await supabase
      .from('doubts')
      .select(`
        id, title, description, status, image_urls, created_at, user_id, subject,
        profiles:user_id ( first_name, last_name, profile_picture_url, email )
      `)
      .eq('id', doubtId)
      .single()

    if (dData) {
      const p = dData.profiles
      const name = (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : '') || p?.email?.split('@')[0] || 'BSPrep Student'
      setDoubt({
        id: dData.id,
        title: dData.title,
        description: dData.description,
        status: dData.status,
        image_urls: dData.image_urls || [],
        created_at: dData.created_at,
        user_id: dData.user_id,
        subject: dData.subject,
        author: { 
          full_name: name, 
          photo_url: p?.profile_picture_url || null 
        },
      })
    }

    // Fetch Replies
    const { data: rData } = await supabase
      .from('doubt_replies')
      .select(`
        id, content, created_at, is_official_answer, is_accepted_answer, user_id,
        profiles:user_id ( first_name, last_name, profile_picture_url, email )
      `)
      .eq('doubt_id', doubtId)
      .order('created_at', { ascending: true })

    if (rData && rData.length > 0) {
      const mappedReplies = rData.map((r: any) => {
        const rp = r.profiles
        const isBot = rp?.email?.toLowerCase() === 'ai@bsprep.io' || rp?.email?.toLowerCase() === 'ai@bsprep.in' || (rp && `${rp.first_name || ''} ${rp.last_name || ''}`.toLowerCase().includes('bsprep'))
        const fullName = isBot 
          ? 'BSPREP AI' 
          : ((rp ? `${rp.first_name || ''} ${rp.last_name || ''}`.trim() : '') || rp?.email?.split('@')[0] || 'Unknown')
        return {
          id: r.id,
          content: r.content,
          created_at: r.created_at,
          is_official_answer: r.is_official_answer,
          is_accepted_answer: r.is_accepted_answer,
          user_id: r.user_id,
          author: {
            full_name: fullName,
            photo_url: isBot ? '/bsprep_chatbot.png' : (rp?.profile_picture_url || null)
          }
        }
      })
      setReplies(mappedReplies)

      // If AI is currently generating an answer (showing placeholder lock), poll once after 3 seconds
      const isGenerating = mappedReplies.some((r: any) => r.author.full_name.toLowerCase().includes('bsprep') && r.content.includes('is reading your question'))
      if (isGenerating) {
        setTimeout(() => fetchDoubtData(), 3000)
      }
    } else if (dData?.status === 'open') {
      // Gentle one-time poll in case AI is in the middle of initial setup from new post
      const timer = setTimeout(() => {
        fetch("/api/doubts/ai-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doubtId }),
        })
          .then((res) => res.json())
          .then((resData) => {
            if (resData.status === 'success') {
              fetchDoubtData();
            }
          })
          .catch((err) => console.error("AI auto-reply check failed:", err));
      }, 1500)
      return () => clearTimeout(timer)
    }

    setLoading(false)
  }

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim() || !currentUserId) return
    
    setIsSubmitting(true)
    
    // Check if user is admin/mentor
    const { data: adminCheck } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .in('role', ['admin', 'mentor'])
      .maybeSingle()
      
    const isOfficial = !!adminCheck

    const { error } = await supabase.from('doubt_replies').insert({
      doubt_id: doubtId,
      user_id: currentUserId,
      content: newReply,
      is_official_answer: isOfficial
    })

    if (!error) {
      setNewReply("")
      fetchDoubtData()
    }
    setIsSubmitting(false)
  }

  const markResolved = async () => {
    if (!doubt) return
    await supabase.from('doubts').update({ status: 'resolved' }).eq('id', doubtId)
    setDoubt({ ...doubt, status: 'resolved' })
  }
  
  const markAccepted = async (replyId: string) => {
    // Only author can do this (RLS protected anyway)
    await supabase.from('doubt_replies').update({ is_accepted_answer: true }).eq('id', replyId)
    fetchDoubtData() // Refresh to show checkmark
  }

  if (loading) {
    return <div className="flex-1 p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  if (!doubt) {
    return <div className="flex-1 p-10 text-center">Doubt not found.</div>
  }

  return (
    <div className="flex-1 p-6 md:p-10 lg:p-12 w-full max-w-6xl mx-auto flex flex-col min-h-[90vh]">
      
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black/60 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doubts
        </button>
      </div>

      {/* Original Doubt */}
      <div className="bg-white rounded-3xl border border-black/10 p-6 md:p-10 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {doubt.subject}
          </span>
          {doubt.status === "resolved" ? (
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
            </span>
          ) : (
             <span className="text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
               Open
             </span>
          )}
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight mb-4">
          {doubt.title}
        </h1>
        
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-black/10">
          <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center overflow-hidden">
            {doubt.author.photo_url ? (
              <img src={doubt.author.photo_url} alt="author" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-black/40" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-black">{doubt.author.full_name}</div>
            <div className="text-xs font-bold text-black/50 uppercase tracking-widest">
              {new Date(doubt.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-black/80 font-medium leading-relaxed mb-8 whitespace-pre-wrap">
          {doubt.description}
        </div>

        {doubt.image_urls && doubt.image_urls.length > 0 && (
          <div className="flex flex-col gap-6 mt-8">
            {doubt.image_urls.map((url, i) => (
              <a href={url} target="_blank" rel="noreferrer" key={i} className="group block">
                <img 
                  src={url} 
                  alt={`attachment-${i}`} 
                  className="max-h-[500px] w-auto max-w-full rounded-2xl border border-black/10 shadow-sm group-hover:shadow-xl group-hover:border-black/30 transition-all cursor-zoom-in" 
                />
              </a>
            ))}
          </div>
        )}
        
        {currentUserId === doubt.user_id && doubt.status !== 'resolved' && (
          <div className="mt-8 flex justify-end">
            <Button onClick={markResolved} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Resolved
            </Button>
          </div>
        )}
      </div>

      {/* Replies */}
      <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2">
        <MessageCircleQuestion className="w-4 h-4" /> {replies.length} Replies
      </h3>

      <div className="space-y-6 mb-10">
        {replies.map((reply) => (
          <div key={reply.id} className={`bg-white rounded-3xl border p-6 shadow-sm ${reply.is_accepted_answer ? 'border-emerald-500 bg-emerald-50/30' : 'border-black/10'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center overflow-hidden">
                  {reply.author.photo_url ? (
                    <img src={reply.author.photo_url} alt="author" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-black/40" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-black flex items-center gap-2">
                    {reply.author.full_name}
                    {reply.is_official_answer && (
                      <span className="flex items-center gap-1 text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        <BadgeCheck className="w-3 h-3" /> Mentor
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-black/50 uppercase tracking-widest">
                    {new Date(reply.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {reply.is_accepted_answer && (
                <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepted Answer
                </div>
              )}
            </div>
            
            <div className="text-sm text-black/85 font-medium leading-relaxed ml-11">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ node, ...props }: any) => <div className="my-4" {...props} />,
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "")
                    const content = String(children).replace(/\n$/, "")
                    const isBlock = !inline && (Boolean(match) || content.includes("\n"))
                    return isBlock ? (
                      <div className="my-4 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-[#1e1e1e]">
                        <div className="bg-[#252526] px-4 py-2 border-b border-white/10 text-slate-400 font-mono text-xs flex items-center justify-between">
                          <span className="font-bold text-blue-400 tracking-wider uppercase">{match ? match[1] : "Code"}</span>
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-400 border border-white/10">VS Code Dark+</span>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus as any}
                          language={match ? match[1] : "python"}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            padding: "1.25rem",
                            background: "#1e1e1e",
                            fontSize: "0.825rem",
                            lineHeight: "1.6",
                            borderRadius: 0
                          }}
                          {...props}
                        >
                          {content}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-blue-50 text-blue-800 font-mono text-xs px-1.5 py-0.5 rounded-md font-bold border border-blue-200/80 mx-0.5" {...props}>
                        {children}
                      </code>
                    )
                  },
                  table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="min-w-full border-collapse border border-black/10 rounded-xl overflow-hidden text-xs" {...props} /></div>,
                  th: ({ node, ...props }) => <th className="bg-black/5 p-2 font-black text-left border border-black/10" {...props} />,
                  td: ({ node, ...props }) => <td className="p-2 border border-black/10" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc ml-5 space-y-1.5 my-3" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-5 space-y-1.5 my-3" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-lg font-black text-black mt-6 mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-base font-black text-black mt-5 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-sm font-black text-black mt-4 mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-black text-black" {...props} />
                }}
              >
                {reply.content}
              </ReactMarkdown>
            </div>
            
            {currentUserId === doubt.user_id && !reply.is_accepted_answer && doubt.status !== 'resolved' && (
              <div className="mt-4 ml-11 flex">
                <button onClick={() => markAccepted(reply.id)} className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-emerald-600 transition-colors">
                  Mark as Helpful / Accepted
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply Input */}
      {doubt.status !== 'resolved' ? (
        <form onSubmit={handlePostReply} className="bg-white rounded-3xl border border-black/10 p-4 shadow-sm flex flex-col">
          <textarea 
            value={newReply}
            onChange={e => setNewReply(e.target.value)}
            placeholder="Type your reply here to help out..."
            className="w-full h-24 p-4 bg-transparent border-none text-sm font-medium text-black outline-none resize-none"
            required
          />
          <div className="flex justify-between items-center border-t border-black/5 pt-4">
            <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest px-4">
              Be respectful and helpful.
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-black hover:bg-black/90 text-white rounded-xl h-10 px-6 text-xs font-black uppercase tracking-widest shadow-md transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-2" /> Post Reply</>}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 bg-black/5 rounded-2xl text-xs font-black uppercase tracking-widest text-black/40">
          This doubt has been marked as resolved.
        </div>
      )}

    </div>
  )
}
