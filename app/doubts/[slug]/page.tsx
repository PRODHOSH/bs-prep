import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, MessageCircleQuestion, Clock, User, ShieldCheck } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Use generateMetadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const supabase = await createClient()
  const resolvedParams = await params
  const decodedSlug = decodeURIComponent(resolvedParams.slug)
  
  const { data: doubt } = await supabase
    .from('doubts')
    .select('title, description')
    .eq('slug', decodedSlug)
    .eq('is_public', true)
    .single()

  if (!doubt) {
    return { title: "Doubt Not Found | BSPrep" }
  }

  // Generate a clean description for the meta tag
  const cleanDescription = doubt.description.substring(0, 150).replace(/[^a-zA-Z0-9 ]/g, "") + "..."

  return {
    title: `${doubt.title} | BSPrep Community Doubts`,
    description: cleanDescription,
    openGraph: {
      title: `${doubt.title} | BSPrep`,
      description: cleanDescription,
      type: 'article',
    }
  }
}

export default async function PublicDoubtDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const supabase = await createClient()
  const resolvedParams = await params
  const decodedSlug = decodeURIComponent(resolvedParams.slug)
  
  // Check auth for Navbar and "Login to post" prompt
  const { data: { session } } = await supabase.auth.getSession()

  // Fetch the doubt by slug
  const { data: doubtData, error } = await supabase
    .from('doubts')
    .select(`
      id, title, description, status, created_at, subject,
      profiles:user_id ( first_name, last_name, email, avatar_url, profile_picture_url )
    `)
    .eq('slug', decodedSlug)
    .eq('is_public', true)
    .single()

  if (error || !doubtData) {
    notFound()
  }

  const dp = doubtData.profiles
  const authorName = (dp ? `${dp.first_name || ''} ${dp.last_name || ''}`.trim() : '') || dp?.email?.split('@')[0] || 'BSPrep Student'
  const authorPic = dp?.avatar_url || dp?.profile_picture_url

  // Fetch replies
  const { data: rData } = await supabase
    .from('doubt_replies')
    .select(`
      id, content, created_at, is_official_answer, is_accepted_answer,
      profiles:user_id ( first_name, last_name, email, avatar_url, profile_picture_url )
    `)
    .eq('doubt_id', doubtData.id)
    .order('created_at', { ascending: true })

  const replies = (rData || []).map((r: any) => {
    const rp = r.profiles
    const isBot = rp?.email?.toLowerCase() === 'ai@bsprep.io' || rp?.email?.toLowerCase() === 'ai@bsprep.in' || (rp && `${rp.first_name || ''} ${rp.last_name || ''}`.toLowerCase().includes('bsprep'))
    const fullName = isBot 
      ? 'BSPREP AI' 
      : ((rp ? `${rp.first_name || ''} ${rp.last_name || ''}`.trim() : '') || rp?.email?.split('@')[0] || 'Unknown')
    return {
      ...r,
      author: {
        full_name: fullName,
        photo_url: isBot ? '/bsprep_chatbot.png' : (rp?.avatar_url || rp?.profile_picture_url || null)
      }
    }
  })

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar isAuthenticated={!!session} />

      <main className="flex-1 py-14 px-4 relative z-10 w-full max-w-4xl mx-auto flex flex-col min-h-[90vh]">
        <Link href="/doubts" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1A365D] hover:text-[#121212] transition-colors mb-10 pt-10">
          <ArrowLeft className="w-4 h-4" /> Back to Doubts
        </Link>

        {/* Original Doubt */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-black/10 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-6 border-b border-black/5">
            <div>
              <span className="inline-block px-3 py-1 bg-[#1A365D]/5 text-[#1A365D] rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                {doubtData.subject}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-[#121212] uppercase tracking-tight leading-tight mb-4">
                {doubtData.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center overflow-hidden border border-black/10">
                  {authorPic ? (
                    <img src={authorPic} alt={authorName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-black/40" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-black uppercase tracking-widest text-[#121212]">{authorName}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                    Asked on {new Date(doubtData.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            {doubtData.status === 'resolved' && (
              <div className="shrink-0 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" /> Resolved
              </div>
            )}
          </div>
          
          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-black prose-headings:uppercase prose-p:font-medium prose-p:text-gray-600 prose-pre:bg-gray-900 prose-pre:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {doubtData.description}
            </ReactMarkdown>
          </div>
        </div>

        <h2 className="text-lg font-black uppercase tracking-widest text-[#121212] mb-6 flex items-center gap-3">
          <MessageCircleQuestion className="w-5 h-5" /> 
          {replies.length} {replies.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {/* Replies */}
        <div className="space-y-6 mb-12">
          {replies.map((reply: any) => (
            <div key={reply.id} className={`p-6 md:p-8 rounded-3xl border ${reply.is_accepted_answer ? 'bg-emerald-50/50 border-emerald-500/20' : 'bg-white border-black/10'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center overflow-hidden border border-black/10 shrink-0">
                    {reply.author.photo_url ? (
                      <img src={reply.author.photo_url} alt={reply.author.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-black/40" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black uppercase tracking-widest text-[#121212]">{reply.author.full_name}</span>
                      {reply.is_official_answer && (
                        <span className="px-2 py-0.5 bg-[#1A365D] text-white rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Official
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1">
                      {new Date(reply.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {reply.is_accepted_answer && (
                  <div className="shrink-0 px-3 py-1 bg-emerald-500 text-white rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" /> Accepted
                  </div>
                )}
              </div>
              
              <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-black prose-headings:uppercase prose-p:font-medium prose-p:text-gray-700 prose-pre:bg-gray-900 prose-pre:rounded-xl prose-a:text-[#1A365D]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {reply.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {/* Login Hook for unauthenticated users */}
        {!session && (
          <div className="bg-[#1A365D] rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Have something to add?</h3>
            <p className="text-white/80 font-medium mb-8 max-w-xl mx-auto">
              Join thousands of IIT Madras BS students on BSPrep. Login to ask your own doubts, reply to peers, and access premium tools.
            </p>
            <Link href="/signin" className="inline-flex items-center justify-center h-14 px-8 bg-white text-[#1A365D] rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
              Login to Post
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
