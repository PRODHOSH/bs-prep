export const SUBJECT_CHAT_COURSES = [
  { id: "qualifier-math-1", label: "Mathematics 1" },
  { id: "qualifier-stats-1", label: "Statistics 1" },
  { id: "qualifier-computational-thinking", label: "Computational Thinking" },
] as const

export type SubjectChatCourseId = (typeof SUBJECT_CHAT_COURSES)[number]["id"]

export const SUBJECT_CHAT_COURSE_IDS = new Set<string>(SUBJECT_CHAT_COURSES.map((course) => course.id))

export const SUBJECT_CHAT_LABEL_BY_ID: Record<string, string> = SUBJECT_CHAT_COURSES.reduce(
  (acc, course) => {
    acc[course.id] = course.label
    return acc
  },
  {} as Record<string, string>,
)

export function isSubjectChatCourse(courseId: string): boolean {
  return SUBJECT_CHAT_COURSE_IDS.has(courseId)
}
