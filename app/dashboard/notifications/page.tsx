"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell, Loader2, CalendarClock, MessageCircle, AlertCircle } from "lucide-react"

export default function DashboardNotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
  const [recentClasses, setRecentClasses] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [doubtNotifications, setDoubtNotifications] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Fetch upcoming classes
        const { data: upcomingData } = await supabase
          .from("live_classes")
          .select("*")
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })

        if (upcomingData) {
          const now = new Date()
          const upcoming = upcomingData.filter((cls) => {
            const classDateTime = new Date(`${cls.date}T${cls.time}`)
            return classDateTime > now
          })
          setUpcomingClasses(upcoming)
        }

        // 1b. Fetch recently added classes (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const { data: recentData } = await supabase
          .from("live_classes")
          .select("*")
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })

        if (recentData) {
          // Filter out ones that are already in upcoming to avoid duplicates
          const upcomingIds = upcomingData ? upcomingData.map(c => c.id) : []
          const recent = recentData.filter(c => !upcomingIds.includes(c.id))
          setRecentClasses(recent)
        }

        // 2. Fetch announcements
        const { data: annData } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10)

        if (annData) {
          setAnnouncements(annData)
        }

        // 3. Fetch doubt updates
        const { data: doubtsData } = await supabase
          .from("doubts")
          .select("*")
          .eq("student_id", user.id)
          .eq("unread_for_student", true)
          .order("updated_at", { ascending: false })

        if (doubtsData) {
          setDoubtNotifications(doubtsData)
        }
      } catch (e) {
        console.error("Error fetching notifications", e)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-12 lg:p-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <p className="text-sm font-black text-black/60 uppercase tracking-widest">LOADING NOTIFICATIONS...</p>
        </div>
      </div>
    )
  }

  const hasNoNotifications = upcomingClasses.length === 0 && recentClasses.length === 0 && announcements.length === 0 && doubtNotifications.length === 0

  return (
    <div id="tour-notifications" className="flex-1 p-6 md:p-10 lg:p-12 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-black/10">
        <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-2xl shadow-md">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">NOTIFICATIONS</h1>
          <p className="text-sm font-bold text-black/60 uppercase tracking-widest mt-1">YOUR LATEST UPDATES & ALERTS</p>
        </div>
      </div>

      {hasNoNotifications ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-black/10 shadow-sm">
          <Bell className="w-12 h-12 text-black/20 mx-auto mb-4" />
          <h3 className="text-lg font-black text-black uppercase tracking-widest">ALL CAUGHT UP</h3>
          <p className="text-sm font-bold text-black/40 uppercase tracking-widest mt-2">YOU HAVE NO NEW NOTIFICATIONS.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {doubtNotifications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-black/50 uppercase tracking-widest flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                DOUBTS UPDATES
              </h2>
              {doubtNotifications.map((doubt, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-black uppercase">{doubt.subject}</h4>
                    <p className="text-xs font-bold text-black/60 mt-1">New reply from admin team</p>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mt-3">
                      {new Date(doubt.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {upcomingClasses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-black/50 uppercase tracking-widest flex items-center gap-2 mt-8">
                <CalendarClock className="w-4 h-4" />
                UPCOMING LIVE CLASSES
              </h2>
              {upcomingClasses.map((cls, idx) => (
                <div key={`upcoming-${idx}`} className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform">
                  <div className="w-2 h-2 bg-[#1e3a8a] rounded-full mt-2 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black text-white bg-[#1e3a8a] px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {cls.course}
                    </span>
                    <h4 className="text-base font-black text-black uppercase mt-2">{cls.topic}</h4>
                    <p className="text-xs font-bold text-black/60 mt-1">
                      {new Date(cls.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} at {cls.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {recentClasses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-black/50 uppercase tracking-widest flex items-center gap-2 mt-8">
                <Bell className="w-4 h-4" />
                RECENTLY ADDED CLASSES
              </h2>
              {recentClasses.map((cls, idx) => (
                <div key={`recent-${idx}`} className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {cls.course}
                    </span>
                    <h4 className="text-base font-black text-black uppercase mt-2">New Class: {cls.topic}</h4>
                    <p className="text-xs font-bold text-black/60 mt-1">
                      Scheduled for {new Date(cls.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} at {cls.time}
                    </p>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mt-3">
                      Added {new Date(cls.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {announcements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-black/50 uppercase tracking-widest flex items-center gap-2 mt-8">
                <AlertCircle className="w-4 h-4" />
                ANNOUNCEMENTS
              </h2>
              {announcements.map((ann, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-black uppercase">{ann.title}</h4>
                    <p className="text-xs font-medium text-black/70 mt-2">{ann.content}</p>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mt-3">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
