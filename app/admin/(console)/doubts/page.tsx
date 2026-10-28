"use client"

import { useState, useEffect } from "react"
import { SkRows } from "@/components/dashboard/skeleton"
import { createClient } from "@/lib/supabase/client"
import { DoubtList } from "@/components/dashboard/doubt-list"
import { PageHeader } from "@/components/dashboard/ui"

type Doubt = {
  id: string
  title: string
  subject: string
  status: string
  created_at: string
  author: { full_name: string }
}

export default function AdminDoubtsPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [loading, setLoading] = useState(true)
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
        profiles:user_id ( first_name, last_name, email )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const formattedDoubts = doubtsData.map((d: any) => {
      const p = d.profiles
      const name = (p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : '') || p?.email?.split('@')[0] || 'BSPrep Student'
      return {
        id: d.id,
        title: d.title,
        subject: d.subject,
        status: d.status,
        created_at: d.created_at,
        author: { full_name: name }
      }
    })
    
    setDoubts(formattedDoubts)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Doubts" description="View, moderate and resolve student doubts." />
      <DoubtList doubts={doubts} loading={loading} basePath="/admin/doubts" />
    </div>
  )
}
