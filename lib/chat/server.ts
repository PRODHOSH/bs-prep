import { SUBJECT_CHAT_COURSE_IDS, SUBJECT_CHAT_COURSES } from "@/lib/chat/constants"

type SupabaseClientLike = {
  from: (table: string) => {
    select: (columns: string) => any
    upsert: (values: Record<string, unknown>[], options?: Record<string, unknown>) => any
  }
}

type EnrollmentRow = {
  course_id: string
}

type MentorSubjectProfileLike = {
  mentor_subject?: string | null
  mentor_subjects?: string[] | null
}

export async function getEnrolledSubjectCourseIds(service: SupabaseClientLike, userId: string): Promise<string[]> {
  const attempts = [
    () => service.from("enrollments").select("course_id").eq("user_id", userId),
    () => service.from("enrollments").select("course_id").eq("student_id", userId),
  ]

  for (const runAttempt of attempts) {
    const result = await runAttempt()
    if (!result.error) {
      const rows = (result.data ?? []) as EnrollmentRow[]
      const ids = Array.from(new Set(rows.map((item) => String(item.course_id)).filter(Boolean)))
      return ids.filter((id) => SUBJECT_CHAT_COURSE_IDS.has(id))
    }
  }

  return []
}

export async function ensureSubjectGroups(service: SupabaseClientLike): Promise<void> {
  await service.from("subject_chat_groups").upsert(
    SUBJECT_CHAT_COURSES.map((course) => ({
      course_id: course.id,
      name: `${course.label} Community`,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "course_id" },
  )
}

export function getMentorSubjectCourseIds(profile: MentorSubjectProfileLike | null | undefined): string[] {
  if (!profile) {
    return []
  }

  const fromArray = Array.isArray(profile.mentor_subjects) ? profile.mentor_subjects : []
  const fromSingle = typeof profile.mentor_subject === "string" && profile.mentor_subject ? [profile.mentor_subject] : []

  return Array.from(new Set([...fromArray, ...fromSingle])).filter((courseId) => SUBJECT_CHAT_COURSE_IDS.has(courseId))
}
