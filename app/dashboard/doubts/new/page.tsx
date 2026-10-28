"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, ImagePlus, X } from "lucide-react"
import { Field, PageHeader, btnPrimary, field } from "@/components/dashboard/ui"

export default function NewDoubtPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<File[]>([])
  
  const subjects = [
    "Mathematics 1",
    "Statistics 1",
    "Computational Thinking",
    "English 1",
    "Mathematics 2",
    "Statistics 2",
    "Programming in Python",
    "English 2",
    "General / Other"
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImages(prev => [...prev, ...filesArray].slice(0, 3)) // Limit to 3 images
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (userId: string) => {
    const uploadedUrls: string[] = []
    
    for (const file of images) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('doubts')
        .upload(fileName, file)
        
      if (data) {
        const { data: publicUrlData } = supabase.storage.from('doubts').getPublicUrl(fileName)
        uploadedUrls.push(publicUrlData.publicUrl)
      }
    }
    
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !subject) return
    
    setLoading(true)
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert("You must be logged in to post a doubt")
      setLoading(false)
      return
    }
    
    const imageUrls = await uploadImages(session.user.id)
    
    const { data, error } = await supabase
      .from('doubts')
      .insert({
        user_id: session.user.id,
        subject,
        title,
        description,
        image_urls: imageUrls,
        status: 'open'
      })
      .select()
      .single()
      
    setLoading(false)
    
    if (error) {
      alert(error.message)
    } else {
      // Automatically trigger bsprepio ai to generate an initial response via OpenRouter
      fetch("/api/doubts/ai-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubtId: data.id }),
      }).catch((err) => console.error("AI automated reply trigger failed:", err))

      router.push(`/dashboard/doubts/${data.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to doubts
      </button>
      <PageHeader title="Ask a doubt" description="Explain what you're stuck on and a mentor will help." />

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7">
        <Field label="Subject" htmlFor="subject">
          <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={field} required>
            <option value="" disabled>Select a subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Title" htmlFor="title">
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How does gradient descent work in week 4?" className={field} required />
        </Field>

        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain your doubt in detail. What have you tried so far?"
            className={`${field} h-40 resize-none py-3`}
            required
          />
        </Field>

        <Field label="Attach images" hint="Up to 3 images.">
          <div className="flex flex-wrap gap-3">
            {images.map((file, i) => (
              <div key={i} className="relative size-24 overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(file)} alt="Preview" className="size-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} aria-label="Remove image" className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-destructive">
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {images.length < 3 && (
              <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ImagePlus className="size-5" />
                <span className="text-xs font-semibold">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </Field>

        <div className="flex justify-end border-t pt-5">
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? "Posting…" : "Post doubt"}
          </button>
        </div>
      </form>
    </div>
  )
}
