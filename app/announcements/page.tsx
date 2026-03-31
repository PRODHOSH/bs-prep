"use client"

import { useEffect, useState } from "react"

type Announcement = {
  id: number
  title: string
  message: string
  content?: string
  announcement_type?: string
  created_at: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements")
        const data = await res.json()
        setAnnouncements(data)
      } catch (err) {
        console.error("Failed to fetch announcements", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <p className="text-slate-500">Loading announcements...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📢 Announcements</h1>
          <p className="text-slate-600">Stay updated with the latest announcements and important information</p>
        </div>

        {announcements.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-slate-500">No announcements yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {announcements.map((a) => (
            <article
              key={a.id}
              className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{a.title}</h2>
                  <p className="text-sm text-slate-500 mb-4">
                    {new Date(a.created_at).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {a.message || a.content || ""}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
