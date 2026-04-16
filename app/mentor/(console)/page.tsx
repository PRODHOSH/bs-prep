import Link from "next/link"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { getMentorSubjectCourseIds } from "@/lib/chat/server"

type MentorProfileRow = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  mentor_subject: string | null
  mentor_subjects: string[] | null
}

async function getCommunityStudentCount(service: ReturnType<typeof createServiceRoleClient>, mentorId: string, courseIds: string[]) {
  if (courseIds.length === 0) {
    return 0
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

    return Array.from(new Set((directChats ?? []).map((row) => String(row.student_id ?? "")).filter(Boolean))).length
  }

  const { data: profiles, error: profilesError } = await service.from("profiles").select("id, role").in("id", enrolledIds)

  if (profilesError || !profiles) {
    return enrolledIds.length
  }

  return profiles.filter((profile) => {
    const normalizedRole = String(profile.role ?? "student").toLowerCase()
    return normalizedRole !== "admin" && normalizedRole !== "mentor"
  }).length
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

  const communityStudentCount = await getCommunityStudentCount(service, user.id, mentorCourseIds)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-100">Welcome, {mentorName}</h1>
        <p className="mt-1 text-sm text-emerald-100/70">Your mentor dashboard overview</p>
      </div>

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
          <p className="mt-3 text-3xl font-bold text-emerald-200">{communityStudentCount}</p>
          <p className="mt-1 text-sm text-emerald-100/75">Students in your community</p>
          <p className="mt-3 text-xs text-emerald-100/60">Based on your assigned subject groups and active direct chats.</p>
        </article>
      </section>

      <div>
        <Link
          href="/mentor/chats"
          className="inline-flex h-10 items-center rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
        >
          Open Student Chats
        </Link>
      </div>
    </div>
  )
}
