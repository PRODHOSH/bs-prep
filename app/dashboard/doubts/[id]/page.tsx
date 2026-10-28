"use client"

import { useState, useEffect } from "react"
import { ThreadSkeleton } from "@/components/dashboard/skeleton"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, BadgeCheck, CheckCircle2, MessageCircleQuestion, Send } from "lucide-react"
import { ThreadMarkdown } from "@/components/dashboard/markdown"
import { Avatar, EmptyState, Notice, Tag, btnPrimary } from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

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
      const user = data.session.user
      setCurrentUserId(user.id)
      const googlePic = user.user_metadata?.avatar_url || user.user_metadata?.picture
      if (googlePic) {
        await supabase.from('profiles').update({ avatar_url: googlePic, profile_picture_url: googlePic }).eq('id', user.id)
      }
    }
  }

  const fetchDoubtData = async () => {
    setLoading(true)
    
    // Fetch Doubt
    const { data: dData, error: dError } = await supabase
      .from('doubts')
      .select(`
        id, title, description, status, image_urls, created_at, user_id, subject,
        profiles:user_id ( first_name, last_name, profile_picture_url, avatar_url, email )
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
          photo_url: p?.avatar_url || p?.profile_picture_url || null 
        },
      })
    }

    // Fetch Replies
    const { data: rData } = await supabase
      .from('doubt_replies')
      .select(`
        id, content, created_at, is_official_answer, is_accepted_answer, user_id,
        profiles:user_id ( first_name, last_name, profile_picture_url, avatar_url, email )
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
            photo_url: isBot ? '/bsprep-bot.svg' : (rp?.avatar_url || rp?.profile_picture_url || null)
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

  if (loading) return <ThreadSkeleton />

  if (!doubt) {
    return (
      <EmptyState
        icon={MessageCircleQuestion}
        title="Doubt not found"
        hint="It may have been removed."
        action={<button onClick={() => router.push("/dashboard/doubts")} className={btnPrimary}>Back to doubts</button>}
      />
    )
  }

  const isAuthor = currentUserId === doubt.user_id

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to doubts
      </button>

      <article className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          {doubt.subject && <Tag tone="primary">{doubt.subject}</Tag>}
          {doubt.status === "resolved" ? (
            <Tag tone="green"><CheckCircle2 className="size-3" /> Resolved</Tag>
          ) : (
            <Tag tone="amber">Open</Tag>
          )}
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

        {doubt.image_urls && doubt.image_urls.length > 0 && (
          <div className="mt-5 flex flex-col gap-4">
            {doubt.image_urls.map((url, i) => (
              <a href={url} target="_blank" rel="noreferrer" key={i} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Attachment ${i + 1}`} className="max-h-[30rem] w-auto max-w-full cursor-zoom-in rounded-xl border" />
              </a>
            ))}
          </div>
        )}

        {isAuthor && doubt.status !== "resolved" && (
          <div className="mt-6 flex justify-end">
            <button onClick={markResolved} className={btnPrimary}>
              <CheckCircle2 className="size-4" /> Mark as resolved
            </button>
          </div>
        )}
      </article>

      <h2 className="flex items-center gap-2 text-sm font-bold">
        Replies <span className="rounded-md bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">{replies.length}</span>
      </h2>

      <ul className="space-y-4">
        {replies.map((reply) => (
          <li key={reply.id} className="flex gap-3">
            <Avatar name={reply.author.full_name} src={reply.author.photo_url} size={36} />
            <div className={cn("min-w-0 flex-1 rounded-2xl rounded-tl-sm px-4 py-3", reply.is_accepted_answer ? "border border-chart-4/40 bg-chart-4/5" : "bg-muted/60")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                  {reply.author.full_name}
                  {reply.is_official_answer && <Tag tone="primary"><BadgeCheck className="size-3" /> Mentor</Tag>}
                  <span className="font-medium text-muted-foreground">· {new Date(reply.created_at).toLocaleDateString()}</span>
                </p>
                {reply.is_accepted_answer && <Tag tone="green"><CheckCircle2 className="size-3" /> Accepted</Tag>}
              </div>
              <div className="mt-2 text-sm">
                <ThreadMarkdown>{reply.content}</ThreadMarkdown>
              </div>
              {isAuthor && !reply.is_accepted_answer && doubt.status !== "resolved" && (
                <button onClick={() => markAccepted(reply.id)} className="mt-2 text-xs font-semibold text-muted-foreground hover:text-chart-4">
                  Mark as accepted
                </button>
              )}
            </div>
          </li>
        ))}
        {replies.length === 0 && <li className="text-sm text-muted-foreground">No replies yet.</li>}
      </ul>

      {doubt.status !== "resolved" ? (
        <form onSubmit={handlePostReply} className="rounded-2xl border bg-card p-3">
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Write a reply"
            className="h-24 w-full resize-none bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground/70"
            required
          />
          <div className="flex items-center justify-between border-t pt-3">
            <span className="px-2 text-xs text-muted-foreground">Be respectful and helpful.</span>
            <button type="submit" disabled={isSubmitting} className={btnPrimary}>
              <Send className="size-4" /> {isSubmitting ? "Posting…" : "Post reply"}
            </button>
          </div>
        </form>
      ) : (
        <Notice>This doubt has been marked as resolved.</Notice>
      )}
    </div>
  )
}
