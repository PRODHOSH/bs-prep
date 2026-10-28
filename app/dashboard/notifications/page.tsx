"use client"

import { useState, useEffect } from "react"
import { getUserCached } from "@/lib/supabase/cached-user"
import { ListPageSkeleton } from "@/components/dashboard/skeleton"
import { createClient } from "@/lib/supabase/client"
import { Bell, CalendarClock, MessageCircle, AlertCircle } from "lucide-react"
import { EmptyState, IconTile, PageHeader, Tag, type Tone } from "@/components/dashboard/ui"

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
        const { data: { user } } = await getUserCached()
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

  if (loading) return <div className="mx-auto max-w-3xl"><ListPageSkeleton tabs={0} rows={4} icon /></div>

  const hasNoNotifications =
    upcomingClasses.length === 0 && recentClasses.length === 0 && announcements.length === 0 && doubtNotifications.length === 0

  const when = (cls: any) => `${new Date(cls.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} at ${cls.time}`

  const Group = ({ icon, title, count, children }: { icon: React.ElementType; title: string; count: number; children: React.ReactNode }) => (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
        {title} <span className="rounded-md bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">{count}</span>
      </h2>
      <ul className="space-y-3">{children}</ul>
    </section>
  )

  const Item = ({ icon, tone, tag, title, body, meta }: { icon: React.ElementType; tone: Tone; tag?: string; title: string; body?: string; meta?: string }) => (
    <li className="flex items-start gap-4 rounded-2xl border bg-card p-4">
      <IconTile icon={icon} tone={tone} className="size-10 rounded-xl" />
      <div className="min-w-0 flex-1">
        {tag && <Tag tone={tone} className="mb-1.5">{tag}</Tag>}
        <h4 className="text-[15px] font-bold leading-snug">{title}</h4>
        {body && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>}
        {meta && <p className="mt-2 text-xs font-medium text-muted-foreground/80">{meta}</p>}
      </div>
    </li>
  )

  return (
    <div id="tour-notifications" className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Notifications" description="Your latest updates and alerts." />

      {hasNoNotifications ? (
        <EmptyState icon={Bell} title="All caught up" hint="You have no new notifications." />
      ) : (
        <div className="space-y-8">
          {doubtNotifications.length > 0 && (
            <Group icon={MessageCircle} title="Doubt updates" count={doubtNotifications.length}>
              {doubtNotifications.map((doubt, idx) => (
                <Item key={idx} icon={MessageCircle} tone="pink" title={doubt.subject} body="New reply from the admin team." meta={new Date(doubt.updated_at).toLocaleDateString()} />
              ))}
            </Group>
          )}

          {upcomingClasses.length > 0 && (
            <Group icon={CalendarClock} title="Upcoming live classes" count={upcomingClasses.length}>
              {upcomingClasses.map((cls, idx) => (
                <Item key={`upcoming-${idx}`} icon={CalendarClock} tone="primary" tag={cls.course} title={cls.topic} meta={when(cls)} />
              ))}
            </Group>
          )}

          {recentClasses.length > 0 && (
            <Group icon={Bell} title="Recently added classes" count={recentClasses.length}>
              {recentClasses.map((cls, idx) => (
                <Item
                  key={`recent-${idx}`}
                  icon={Bell}
                  tone="green"
                  tag={cls.course}
                  title={`New class: ${cls.topic}`}
                  body={`Scheduled for ${when(cls)}.`}
                  meta={`Added ${new Date(cls.created_at).toLocaleDateString()}`}
                />
              ))}
            </Group>
          )}

          {announcements.length > 0 && (
            <Group icon={AlertCircle} title="Announcements" count={announcements.length}>
              {announcements.map((ann, idx) => (
                <Item key={idx} icon={AlertCircle} tone="amber" title={ann.title} body={ann.content} meta={new Date(ann.created_at).toLocaleDateString()} />
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  )
}
