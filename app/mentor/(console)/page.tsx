import Link from "next/link"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { getMentorSubjectCourseIds } from "@/lib/chat/server"
import { ExternalLink, BookOpen, LifeBuoy, Mail, MessageCircle, FileText } from "lucide-react"
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-100">Welcome, {mentorName}</h1>
        <p className="mt-1 text-sm text-emerald-100/70">Your mentor dashboard overview</p>
      </div>

      {/* Setup Guide Banner moved to bottom */}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#102329] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/60">Profile</p>
          <div className="mt-4 flex items-center gap-4">
            {mentorAvatar ? (
              <img
                src={mentorAvatar}
                alt="Mentor avatar"
                className="h-16 w-16 rounded-full border border-white/15 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-[#1a3741] text-lg font-semibold text-emerald-100">
                {(mentorName.trim()[0] || "M").toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-emerald-50">{mentorName}</p>
              <p className="truncate text-sm text-emerald-100/75">{mentorEmail}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#102329] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/60">Community</p>
          <p className="mt-3 text-3xl font-bold text-emerald-200">{communityStudents.length}</p>
          <p className="mt-1 text-sm text-emerald-100/75">Students in your community</p>
          <p className="mt-3 text-xs text-emerald-100/60">Based on your assigned subject groups and active direct chats.</p>
        </article>
      </section>

      {/* Subject Folders */}
      {mentorCourseIds.length > 0 && (
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/60 ml-2">Class Materials</p>
          <div className="flex flex-col gap-4">
            {mentorCourseIds.map(courseId => {
              const courseMatch = courses.find(c => c.id === courseId);
              if (!courseMatch || !courseMatch.driveFolderId) return null;
              
              return (
                <div key={courseId} className="flex flex-col lg:flex-row justify-between items-start lg:items-center rounded-2xl border border-white/5 bg-[#102329] p-6 lg:p-8 border-l-4 border-l-emerald-500 gap-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-400">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{courseMatch.title}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Upload Class Slides</h3>
                    
                    <div className="flex items-start sm:items-center gap-3 text-sm text-emerald-100/80 bg-[#152a33] p-4 rounded-xl border border-white/5 max-w-2xl">
                      <div className="p-2 bg-emerald-500/20 rounded-lg shrink-0 mt-0.5 sm:mt-0">
                        <FileText className="w-5 h-5 text-emerald-400" />
                      </div>
                      <p className="leading-relaxed">
                        Name your PDF exactly as <strong className="text-emerald-300 font-black px-2 py-1 bg-emerald-500/20 rounded mx-1 tracking-widest">DD-MM-YYYY.pdf</strong> (e.g. 19-02-2026.pdf) to sync it automatically to the student dashboard.
                      </p>
                    </div>
                  </div>
                  
                  <a
                    href={`https://drive.google.com/drive/folders/${courseMatch.driveFolderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-[#061418] hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] shrink-0"
                  >
                    <FileText className="w-5 h-5" />
                    Open Google Drive
                  </a>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Community Students List */}
      <section className="rounded-2xl border border-white/10 bg-[#102329] p-5">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-emerald-100/60">Your Students</p>
        {communityStudents.length === 0 ? (
          <p className="text-sm text-emerald-100/70">No students enrolled in your subject yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {communityStudents.map((student) => {
              const fullName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Student"
              const initials = (student.first_name?.[0] || student.email?.[0] || "S").toUpperCase()
              return (
                <div key={student.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#152a33] p-3">
                  {student.avatar_url ? (
                    <img
                      src={student.avatar_url}
                      alt={fullName}
                      className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1a3741] text-sm font-semibold text-emerald-100">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-emerald-50">{fullName}</p>
                    <p className="truncate text-xs text-emerald-100/70">{student.email}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Mentor Support Notice */}
      <section className="rounded-2xl border border-white/10 bg-[#0e1f24] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400 shrink-0 mt-0.5">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-100">Need technical assistance or facing any issues?</h3>
            <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
              If you encounter any bugs, scheduling errors, or permissions issues while using the dashboard, reach out to our engineering team immediately to get it resolved.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
          <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#152a33] border border-white/10 px-4 py-2.5 text-xs font-semibold text-emerald-100 w-full sm:w-auto">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Msg in Mentor Group</span>
          </div>
          <a
            href="mailto:support@bsprep.in"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#152a33] border border-white/10 px-4 py-2.5 text-xs font-semibold text-emerald-100 hover:bg-white/10 transition-colors w-full sm:w-auto"
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>support@bsprep.in</span>
          </a>
        </div>
      </section>
      {/* Setup Guide Banner (Moved to bottom) */}
      <section className="rounded-2xl border border-emerald-500/30 bg-[#102329] p-6 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Mentor Training Guide</span>
          </div>
          <h2 className="text-xl font-bold text-emerald-100">How To Add A New Live Class on BSPrep</h2>
          <p className="text-sm text-emerald-100/70 leading-relaxed">
            Follow our complete step-by-step visual tutorial to schedule sessions, set up meeting links, and broadcast to student dashboards.
          </p>
        </div>
        <a
          href="https://scribehow.com/o/7RsyWj97R8Whhke-8yyC1A/viewer/How_To_Add_A_New_Live_Class_On_BSPREP__amiSsqCjQhG7aG4p4J-Ssw"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#061418] transition-all hover:bg-emerald-300 shadow-md shrink-0 w-full md:w-auto"
        >
          <span>View Setup Guide</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </section>
    </div>
  )
}

