export interface Course {
  id: string
  title: string
  level: "qualifier" | "foundation" | "diploma" | "degree"
  type: "free" | "paid"
  courseType: "skill-path" | "course" | "career-path" | "free-course"
  weeks: number
  description: string
  thumbnail: string
  includesCourses?: number
  withCertificate?: boolean
  price?: number
  originalPrice?: number
  available?: boolean
}

export const courses: Course[] = [
  {
    id: "qualifier-math-1",
    title: "Mathematics for Data Science I",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Master fundamental math concepts",
    thumbnail: "/courses/mathematics_for_datascience_1.jpeg",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-stats-1",
    title: "Statistics for Data Science I",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Learn statistical thinking & analysis",
    thumbnail: "/courses/statistics_for_datascience_1.jpeg",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-computational-thinking",
    title: "Computational Thinking",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Build problem-solving skills",
    thumbnail: "/courses/ct.jpeg",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-english-1",
    title: "English I",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Essential communication skills",
    thumbnail: "/courses/english_for_datascience_1.jpeg",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-python",
    title: "Programming in Python",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Learn Python from scratch and build real-world applications.",
    thumbnail: "/courses/programming_in_python.jpeg",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "qualifier-java",
    title: "Programming in Java",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Master Object Oriented Programming principles with Java.",
    thumbnail: "/courses/programming_in_java.jpeg",
    price: 499, originalPrice: 599,
    available: true,
    withCertificate: true
  },
  {
    id: "foundation-math-2",
    title: "Mathematics for Data Science II",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Advanced mathematical concepts",
    thumbnail: "/courses/mathematics_for_datascience_2.jpeg",
    price: 499, originalPrice: 599,
    available: false,
    withCertificate: true
  },
  {
    id: "foundation-stats-2",
    title: "Statistics for Data Science II",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Advanced statistical methods",
    thumbnail: "/courses/statistics_for_datascience_2.jpeg",
    price: 499, originalPrice: 599,
    available: false,
    withCertificate: true
  },
  {
    id: "foundation-programming-python",
    title: "Programming in Python",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Python for data analysis",
    thumbnail: "/courses/programming_in_python.jpeg",
    price: 499, originalPrice: 599,
    available: false,
    withCertificate: true
  },
  {
    id: "foundation-english-2",
    title: "English II",
    level: "foundation",
    type: "paid",
    courseType: "course",
    weeks: 12,
    description: "Advanced communication skills",
    thumbnail: "/courses/english_for_datascience_2.jpeg",
    price: 499, originalPrice: 599,
    available: false,
    withCertificate: true
  },
  {
    id: "qualifier-bundle",
    title: "Qualifier Bundle (4 Courses)",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Enroll in all 4 available qualifier courses at once",
    thumbnail: "/courses/qualifier_bundle_4_courses.jpeg",
    price: 1799, originalPrice: 1999,
    available: true,
    withCertificate: true
  },
  {
    id: "coding-bundle",
    title: "Coding Bundle (Python + Java)",
    level: "qualifier",
    type: "paid",
    courseType: "course",
    weeks: 4,
    description: "Master both Python and Java programming languages",
    thumbnail: "/courses/python.png",
    price: 999, originalPrice: 1199,
    available: true,
    withCertificate: true
  }
]

const levelLabels: Record<string, string> = {
  all: "All Levels",
  qualifier: "Qualifier",
  foundation: "Foundation",
  diploma: "Diploma",
  degree: "Degree",
}
