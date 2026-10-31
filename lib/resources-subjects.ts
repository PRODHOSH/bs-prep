// Subject names as the community notes library lists them. Generated from the notes import in scripts/025.
export const NOTE_SUBJECTS: Record<string, Record<string, string[]>> = {
  "data-science": {
    degree: ["Software Engineering", "Software Testing", "AI: Search Methods for Problem Solving", "Deep Learning", "Programming in C for DS", "PSOSM", "Intro to BigData", "LLM", "SPG", "Market Research", "Managerial Economics", "Industry 4.0", "Design Thinking"],
    diploma: ["DBMS", "PDSA", "MAD I", "ML Foundations", "JAVA", "MAD II", "MLT", "MLP", "BDM", "BA", "System Commands", "TDS"],
    foundation: ["Computational Thinking", "Python", "English I", "English II", "Mathematics I", "Statistics I", "Mathematics II", "Statistics II"],
  },
}
import { courseData } from "@/lib/gpa/course-data"

/** Subjects for a degree and level. Uses the notes library names, and the GPA course names where there are no notes yet. */
export function subjectsFor(degree: string, level: string): string[] {
  const known = NOTE_SUBJECTS[degree]?.[level]
  if (known?.length) return known
  const unique = new Set<string>()
  for (const c of courseData) if (c.degree === degree && c.level === level) unique.add(c.name)
  return Array.from(unique)
}
