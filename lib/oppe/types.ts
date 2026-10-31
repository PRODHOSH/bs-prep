export type Difficulty = "Easy" | "Medium" | "Hard"

export interface OppeCourse {
  id: string
  name: string
  language: string
  oppe1: number
  oppe2: number
}

export interface OppeSummary {
  id: string
  title: string
  difficulty: Difficulty
  exam: 1 | 2
  tags: string[]
}

export interface OppeProblem extends OppeSummary {
  description: string
  hint: string
  starterCode: string
  setupCode: string
  functionName: string
  language: string
  tests: { input: string; output: string }[]
}

export const COURSE_NAMES: Record<string, string> = {
  python: "Programming in Python",
  pdsa: "Programming, Data Structures and Algorithms",
  mlp: "Machine Learning Practice",
  java: "Programming Concepts using Java",
  sql: "Database Management Systems",
  system_commands: "System Commands",
}
