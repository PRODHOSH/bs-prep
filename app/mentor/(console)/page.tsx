import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { getMentorSubjectCourseIds } from "@/lib/chat/server"
import { BookOpen, ExternalLink, FileText, LifeBuoy, Mail, MessageCircle, Users, Video } from "lucide-react"
import { Avatar, Card, IconTile, PageHeader, Stat, btnPrimary } from "@/components/dashboard/ui"
import { courses } from "@/lib/course-catalog"

type MentorProfileRow = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  mentor_subject: string | null
  mentor_subjects: string[] | null
}

async function getCommunityStudents(service: ReturnType<typeof createServiceRoleClient>, mentorId: string, courseIds: string[]) {
  if (courseIds.length === 0) {
    return []
  }

  const enrollmentColumns: Array<"user_id" | "student_id"> = ["user_id", "student_id"]
  let enrolledIds: string[] = []

  for (const column of enrollmentColumns) {
    const { data, error } = await service.from("enrollments").select(`${column}, course_id`).in("course_id", courseIds)

    if (error) {
      continue
    }

    const ids = Array.from(
      new Set(
        ((data ?? []) as Array<Record<string, unknown>>)
          .map((row) => String(row[column] ?? ""))
          .filter((value) => value && value !== mentorId),
      ),
    )

    enrolledIds = ids
    break
  }

  if (enrolledIds.length === 0) {
    const { data: directChats } = await service
      .from("mentor_direct_chats")
      .select("student_id")
      .eq("mentor_id", mentorId)

    enrolledIds = Array.from(new Set((directChats ?? []).map((row) => String(row.student_id ?? "")).filter(Boolean)))
  }

  if (enrolledIds.length === 0) {
    return []
  }

  const { data: profiles, error: profilesError } = await service
    .from("profiles")
    .select("id, role, first_name, last_name, email, avatar_url")
    .in("id", enrolledIds)

  if (profilesError || !profiles) {
    return []
  }

  return profiles.filter((profile) => {
    const normalizedRole = String(profile.role ?? "student").toLowerCase()
    return normalizedRole !== "admin" && normalizedRole !== "mentor"
  })
}

export default async function MentorDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const service = createServiceRoleClient()
  const { data: profile } = await service
    .from("profiles")
    .select("id, first_name, last_name, email, avatar_url, mentor_subject, mentor_subjects")
    .eq("id", user.id)
    .maybeSingle()

  const mentorProfile = (profile ?? null) as MentorProfileRow | null
  const mentorCourseIds = getMentorSubjectCourseIds(mentorProfile)

  const mentorName =
    `${mentorProfile?.first_name ?? ""} ${mentorProfile?.last_name ?? ""}`.trim() ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    "Mentor"

  const mentorEmail = mentorProfile?.email || user.email || ""
  const mentorAvatar =
    mentorProfile?.avatar_url ||
    (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ||
    (typeof user.user_metadata?.picture === "string" ? user.user_metadata.picture : null)

  const communityStudents = await getCommunityStudents(service, user.id, mentorCourseIds)
  const folders = mentorCourseIds
    .map((courseId) => courses.find((c) => c.id === courseId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c && c.driveFolderId))

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-8">
        <PageHeader title={`Welcome, ${mentorName.split(" ")[0]}`} description="Your mentor dashboard overview." />

        <div className="grid gap-5 md:grid-cols-3">
          <Stat label="Students" value={communityStudents.length} hint="In your subject groups and direct chats" icon={Users} tone="primary" />
          <Stat label="Subjects" value={mentorCourseIds.length} hint="Assigned to you" icon={BookOpen} tone="pink" href="/mentor/settings" />
          <Stat label="Live classes" value="Manage" hint="Schedule and edit sessions" icon={Video} tone="green" href="/mentor/live-classes" />
        </div>

        {folders.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-bold">Class materials</h2>
            <div className="space-y-4">
              {folders.map((course) => (
                <Card key={course.id}>
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-chart-1/10 px-2 py-0.5 text-[11px] font-semibold text-chart-1">
                        <BookOpen className="size-3" /> {course.title}
                      </span>
                      <h3 className="mt-2 text-lg font-extrabold tracking-tight">Upload class slides</h3>
                      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Name your PDF exactly <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">DD-MM-YYYY.pdf</span> (for example 19-02-2026.pdf) and it syncs to the student dashboard automatically.
                      </p>
                    </div>
                    <a
                      href={`https://drive.google.com/drive/folders/${course.driveFolderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btnPrimary} shrink-0`}
                    >
                      <FileText className="size-4" /> Open Google Drive
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Card title="Your students" aside={`${communityStudents.length} total`}>
          {communityStudents.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No students enrolled in your subject yet.</p>
          ) : (
            <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {communityStudents.map((student) => {
                const fullName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Student"
                return (
                  <li key={student.id} className="flex items-center gap-3 border-b py-3">
                    <Avatar name={fullName} src={student.avatar_url} size={38} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      <aside className="space-y-5">
        <Card title="Profile">
          <div className="flex items-center gap-3">
            <Avatar name={mentorName} src={mentorAvatar} size={48} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{mentorName}</p>
              <p className="truncate text-xs text-muted-foreground">{mentorEmail}</p>
            </div>
          </div>
        </Card>

        <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-chart-1/15 via-card to-card p-6">
          <IconTile icon={BookOpen} />
          <h2 className="mt-4 text-lg font-extrabold tracking-tight">Add a live class</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A step-by-step guide to scheduling sessions and sharing meeting links with students.
          </p>
          <a
            href="https://scribehow.com/o/7RsyWj97R8Whhke-8yyC1A/viewer/How_To_Add_A_New_Live_Class_On_BSPREP__amiSsqCjQhG7aG4p4J-Ssw"
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnPrimary} mt-5 w-full`}
          >
            View setup guide <ExternalLink className="size-4" />
          </a>
        </section>

        <Card title="Need help?">
          <div className="flex items-start gap-3">
            <IconTile icon={LifeBuoy} tone="amber" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Found a bug, a scheduling error or a permissions issue? Tell the team and it will be fixed.
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm font-semibold">
              <MessageCircle className="size-4 text-muted-foreground" /> Message in the mentor group
            </p>
            <a href="mailto:support@bsprep.in" className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm font-semibold hover:bg-accent">
              <Mail className="size-4 text-muted-foreground" /> support@bsprep.in
            </a>
          </div>
        </Card>
      </aside>
    </div>
  )
}
