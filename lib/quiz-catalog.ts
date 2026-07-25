/**
 * IIT Madras BS Degree Official Course Catalog
 * Defines the complete list of courses for Foundation, Diploma, and Degree levels.
 */

export type AcademicLevel = "Foundation" | "Diploma" | "Degree"
export type ExamType = "Quiz 1" | "Quiz 2" | "End Term"

export interface CourseDefinition {
  id: string
  name: string
  code: string
  track?: "Programming" | "Data Science" | "General"
}

export const COURSES_BY_LEVEL: Record<AcademicLevel, CourseDefinition[]> = {
  Foundation: [
    { id: "bsma1001", name: "Mathematics for Data Science I", code: "BSMA1001", track: "General" },
    { id: "bsma1002", name: "Statistics for Data Science I", code: "BSMA1002", track: "General" },
    { id: "bscs1001", name: "Computational Thinking", code: "BSCS1001", track: "General" },
    { id: "bshs1001", name: "English I", code: "BSHS1001", track: "General" },
    { id: "bsma1003", name: "Mathematics for Data Science II", code: "BSMA1003", track: "General" },
    { id: "bsma1004", name: "Statistics for Data Science II", code: "BSMA1004", track: "General" },
    { id: "bscs1002", name: "Programming in Python", code: "BSCS1002", track: "General" },
    { id: "bshs1002", name: "English II", code: "BSHS1002", track: "General" },
  ],

  Diploma: [
    // Diploma in Programming
    { id: "bscs2001", name: "Database Management Systems", code: "BSCS2001", track: "Programming" },
    { id: "bscs2002", name: "Programming, Data Structures and Algorithms using Python", code: "BSCS2002", track: "Programming" },
    { id: "bscs2003", name: "Modern Application Development I", code: "BSCS2003", track: "Programming" },
    { id: "bscs2003p", name: "Modern Application Development I - Project", code: "BSCS2003P", track: "Programming" },
    { id: "bscs2005", name: "Programming Concepts using Java", code: "BSCS2005", track: "Programming" },
    { id: "bscs2006", name: "Modern Application Development II", code: "BSCS2006", track: "Programming" },
    { id: "bscs2006p", name: "Modern Application Development II - Project", code: "BSCS2006P", track: "Programming" },
    { id: "bsse2001", name: "System Commands", code: "BSSE2001", track: "Programming" },

    // Diploma in Data Science
    { id: "bscs2004", name: "Machine Learning Foundations", code: "BSCS2004", track: "Data Science" },
    { id: "bsms2001", name: "Business Data Management", code: "BSMS2001", track: "Data Science" },
    { id: "bscs2007", name: "Machine Learning Techniques", code: "BSCS2007", track: "Data Science" },
    { id: "bscs2008", name: "Machine Learning Practice", code: "BSCS2008", track: "Data Science" },
    { id: "bscs2008p", name: "Machine Learning Practice - Project", code: "BSCS2008P", track: "Data Science" },
    { id: "bsse2002", name: "Tools in Data Science", code: "BSSE2002", track: "Data Science" },
    { id: "bsms2001p", name: "Business Data Management - Project", code: "BSMS2001P", track: "Data Science" },
    { id: "bsms2002", name: "Business Analytics", code: "BSMS2002", track: "Data Science" },
    { id: "bsda2001", name: "Introduction to Deep Learning and Generative AI", code: "BSDA2001", track: "Data Science" },
    { id: "bsda2001p", name: "Deep Learning and Generative AI - Project", code: "BSDA2001P", track: "Data Science" },
  ],

  Degree: [
    { id: "bscs3001", name: "Software Engineering", code: "BSCS3001", track: "General" },
    { id: "bscs3002", name: "Software Testing", code: "BSCS3002", track: "General" },
    { id: "bscs3003", name: "Deep Learning", code: "BSCS3003", track: "General" },
    { id: "bscs3004", name: "AI: Search Methods for Problem Solving", code: "BSCS3004", track: "General" },
    { id: "bscs3005", name: "Computer Systems Design", code: "BSCS3005", track: "General" },
    { id: "bscs3006", name: "Speech Technology", code: "BSCS3006", track: "General" },
    { id: "bscs3007", name: "Reinforcement Learning", code: "BSCS3007", track: "General" },
  ],
}

export const EXAM_TYPES: ExamType[] = ["Quiz 1", "Quiz 2", "End Term"]
