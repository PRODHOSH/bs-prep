"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, CheckCircle2, MessageCircleQuestion, Send, User, BadgeCheck, Loader2, Trash2 } from "lucide-react"

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

function formatHumanDate(dateStr: string) {
  try {
    const dateObj = new Date(dateStr);
    return isNaN(dateObj.getTime())
      ? dateStr
      : dateObj.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  } catch {
    return dateStr;
  }
}

export default function MentorDoubtDetailPage() {
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
        profiles:user_id ( first_name, last_name, profile_picture_url )
      `)
      .eq('id', doubtId)
      .single()

    if (dData) {
      const p = dData.profiles as any
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
          full_name: p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Unknown', 
          photo_url: p?.profile_picture_url || null 
        }
      })
    }

    // Fetch Replies
    const { data: rData } = await supabase
      .from('doubt_replies')
      .select(`
        id, content, created_at, is_official_answer, is_accepted_answer, user_id,
        profiles:user_id ( first_name, last_name, profile_picture_url )
      `)
      .eq('doubt_id', doubtId)
      .order('created_at', { ascending: true })

    if (rData) {
      setReplies(rData.map((r: any) => {
        const rp = r.profiles
        return {
          id: r.id,
          content: r.content,
          created_at: r.created_at,
          is_official_answer: r.is_official_answer,
          is_accepted_answer: r.is_accepted_answer,
          user_id: r.user_id,
          author: {
            full_name: rp ? `${rp.first_name || ''} ${rp.last_name || ''}`.trim() : 'Unknown',
            photo_url: rp?.profile_picture_url || null
          }
        }
      }))
    }
    
    setLoading(false)
  }

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim() || !currentUserId) return
    
    setIsSubmitting(true)
    
    // Since we are in the admin dashboard, replies from this interface are always official
    const { error } = await supabase.from('doubt_replies').insert({
      doubt_id: doubtId,
      user_id: currentUserId,
      content: newReply,
      is_official_answer: true
    })

    if (!error) {
      setNewReply("")
      fetchDoubtData()
    } else {
      alert("Error posting reply: " + error.message)
    }
    setIsSubmitting(false)
  }

  const markResolved = async () => {
    if (!doubt) return
    await supabase.from('doubts').update({ status: 'resolved' }).eq('id', doubtId)
    setDoubt({ ...doubt, status: 'resolved' })
  }
  
  const deleteDoubt = async () => {
    if (!confirm("Are you sure you want to completely delete this doubt and all its replies?")) return
    const { error } = await supabase.from('doubts').delete().eq('id', doubtId)
    if (!error) {
      router.push('/mentor/doubts')
    } else {
      alert("Error deleting: " + error.message)
    }
  }

  const deleteReply = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return
    await supabase.from('doubt_replies').delete().eq('id', replyId)
    fetchDoubtData()
  }

  if (loading) {
    return <div className="flex-1 p-10 flex justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
  }

  if (!doubt) {
    return <div className="flex-1 p-10 text-center text-emerald-100/70">Doubt not found.</div>
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-10 lg:p-12 w-full max-w-6xl mx-auto flex flex-col min-h-[90vh]">
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-100/70 hover:text-emerald-50 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doubts
        </button>
        
        <div className="flex items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
          {doubt.status !== 'resolved' && (
            <Button onClick={markResolved} className="flex-1 sm:flex-initial bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl h-10 px-3.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" /> Mark Resolved
            </Button>
          )}
          <Button onClick={deleteDoubt} variant="destructive" className="flex-1 sm:flex-initial rounded-xl h-10 px-3.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            <Trash2 className="w-4 h-4 mr-1.5 shrink-0" /> Delete Doubt
          </Button>
        </div>
      </div>

      {/* Original Doubt */}
      <div className="bg-[#102329] rounded-2xl border border-white/10 p-5 sm:p-7 md:p-10 shadow-sm mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-white/10 text-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {doubt.subject}
          </span>
          {doubt.status === "resolved" ? (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
            </span>
          ) : (
            <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Open
            </span>
          )}
        </div>
        
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-50 tracking-tight mb-4 leading-snug">
          {doubt.title}
        </h1>
        
        <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
            {doubt.author.photo_url ? (
              <img src={doubt.author.photo_url} alt="author" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-emerald-100/60" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-50">{doubt.author.full_name}</div>
            <div className="text-xs font-medium text-emerald-100/60">
              {formatHumanDate(doubt.created_at)}
            </div>
          </div>
        </div>

        <div className="prose prose-sm sm:prose max-w-none text-emerald-100/80 font-medium leading-relaxed mb-6 whitespace-pre-wrap">
          {doubt.description}
        </div>

        {doubt.image_urls && doubt.image_urls.length > 0 && (
          <div className="flex flex-col gap-4 sm:gap-6 mt-6 sm:mt-8">
            {doubt.image_urls.map((url, i) => (
              <a href={url} target="_blank" rel="noreferrer" key={i} className="group block">
                <img 
                  src={url} 
                  alt={`attachment-${i}`} 
                  className="max-h-[500px] w-auto max-w-full rounded-2xl border border-white/10 shadow-sm group-hover:shadow-xl group-hover:border-white/30 transition-all cursor-zoom-in" 
                />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Replies */}
      <h3 className="text-xs sm:text-sm font-bold text-emerald-100 uppercase tracking-wider mb-5 flex items-center gap-2">
        <MessageCircleQuestion className="w-4 h-4 text-emerald-400" /> 
        <span>{replies.length} Replies</span>
      </h3>

      <div className="space-y-4 sm:space-y-6 mb-8">
        {replies.map((reply) => (
          <div key={reply.id} className={`bg-[#102329] rounded-2xl border p-4 sm:p-6 shadow-sm ${reply.is_accepted_answer ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10'}`}>
            <div className="flex justify-between items-start mb-3 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                  {reply.author.photo_url ? (
                    <img src={reply.author.photo_url} alt="author" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-100/60" />
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-50 flex flex-wrap items-center gap-1.5">
                    <span>{reply.author.full_name}</span>
                    {reply.is_official_answer && (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                        <BadgeCheck className="w-3 h-3 text-emerald-400" /> Mentor
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-100/60 mt-0.5">
                    {formatHumanDate(reply.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 items-center shrink-0">
                {reply.is_accepted_answer && (
                  <div className="hidden sm:flex items-center gap-1 text-emerald-300 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Accepted
                  </div>
                )}
                <button onClick={() => deleteReply(reply.id)} className="text-rose-400 hover:text-rose-300 bg-white/5 hover:bg-rose-500/20 p-2 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-xs sm:text-sm text-emerald-100/80 font-medium leading-relaxed whitespace-pre-wrap mt-2 sm:mt-0 sm:ml-11">
              {reply.content}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input */}
      {doubt.status !== 'resolved' ? (
        <form onSubmit={handlePostReply} className="bg-[#102329] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm flex flex-col gap-2">
          <textarea 
            value={newReply}
            onChange={e => setNewReply(e.target.value)}
            placeholder="Type your official reply here..."
            className="w-full h-28 p-2 sm:p-3 bg-transparent border-none text-xs sm:text-sm font-medium text-emerald-50 placeholder:text-emerald-100/40 outline-none resize-none leading-relaxed"
            required
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/10 pt-3.5 gap-3">
            <div className="text-[11px] font-bold text-emerald-100/60 uppercase tracking-wider px-2">
              Posting as Mentor
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-400 text-[#061418] rounded-xl h-11 sm:h-10 px-6 text-xs font-bold uppercase tracking-wider shadow-md transition-all w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Post Official Reply</>}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 bg-white/5 rounded-2xl text-xs font-semibold uppercase tracking-widest text-emerald-100/60">
          This doubt has been marked as resolved.
        </div>
      )}

    </div>
  )
}
