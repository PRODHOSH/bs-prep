"use client"

import { useState, useEffect } from "react"
import { ThreadSkeleton } from "@/components/dashboard/skeleton"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, MessageCircleQuestion, Trash2 } from "lucide-react"
import { ModerationThread } from "@/components/dashboard/thread"
import { EmptyState, btnDanger, btnGhost } from "@/components/dashboard/ui"

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
      const p = dData.profiles as any
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
        }
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

      const isGenerating = mappedReplies.some((r: any) => r.author.full_name.toLowerCase().includes('bsprep') && r.content.includes('is reading your question'))
      if (isGenerating) {
        setTimeout(() => fetchDoubtData(), 3000)
      }
    } else if (dData?.status === 'open') {
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
    return <ThreadSkeleton />
  }

  if (!doubt) {
    return <EmptyState icon={MessageCircleQuestion} title="Doubt not found" hint="It may have been removed." />
  }

  return (
    <ModerationThread
      doubt={doubt}
      replies={replies}
      onBack={() => router.back()}
      onDeleteReply={deleteReply}
      actions={
        <>
          {doubt.status !== "resolved" && (
            <button onClick={markResolved} className={btnGhost}>
              <CheckCircle2 className="size-4" /> Mark resolved
            </button>
          )}
          <button onClick={deleteDoubt} className={btnDanger}>
            <Trash2 className="size-4" /> Delete doubt
          </button>
        </>
      }
      reply={{ value: newReply, onChange: setNewReply, onSubmit: handlePostReply, submitting: isSubmitting, hint: "Posting as mentor" }}
    />
  )
}
