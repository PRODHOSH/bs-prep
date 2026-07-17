"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2, ImagePlus, X } from "lucide-react"

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
      router.push(`/dashboard/doubts/${data.id}`)
    }
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
        <h1 className="text-4xl font-black text-black uppercase tracking-tight leading-none">
          ASK A DOUBT
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-black/10 p-6 md:p-10 shadow-sm space-y-6">
        
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-black/60">Subject / Course</label>
          <select 
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full h-12 px-4 bg-black/5 border-transparent focus:border-black/20 focus:bg-white rounded-xl text-sm font-bold text-black outline-none transition-all"
            required
          >
            <option value="" disabled>Select a subject...</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-black/60">Title</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="E.g., How does Gradient Descent work in Week 4?"
            className="w-full h-12 px-4 bg-black/5 border-transparent focus:border-black/20 focus:bg-white rounded-xl text-sm font-bold text-black outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-black/60">Description</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Explain your doubt in detail. What have you tried so far?"
            className="w-full h-40 p-4 bg-black/5 border-transparent focus:border-black/20 focus:bg-white rounded-xl text-sm font-medium text-black outline-none transition-all resize-none"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-black/60">Attach Images (Max 3)</label>
          
          <div className="flex flex-wrap gap-4">
            {images.map((file, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl border border-black/10 overflow-hidden group">
                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {images.length < 3 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-black/20 hover:border-black/50 hover:bg-black/5 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <ImagePlus className="w-6 h-6 text-black/40 mb-1" />
                <span className="text-[10px] font-bold text-black/40 uppercase">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-black/5 flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-black hover:bg-black/90 text-white rounded-2xl h-14 px-10 text-xs font-black uppercase tracking-widest shadow-md transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            POST DOUBT
          </Button>
        </div>

      </form>
    </div>
  )
}
