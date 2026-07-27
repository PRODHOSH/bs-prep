import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ courseId: string }>
}

const courseData: Record<string, any> = {
  "qualifier-math-1": {
    title: "Mathematics for Data Science I",
    description: "Master fundamental math concepts for IITM BS Qualifier with expert Tamil video lectures.",
  },
  "qualifier-stats-1": {
    title: "Statistics for Data Science I",
    description: "Learn statistical thinking and analysis for IITM BS Qualifier with expert Tamil video lectures.",
  },
  "qualifier-computational-thinking": {
    title: "Computational Thinking",
    description: "Build problem-solving and algorithmic thinking fundamentals for IITM BS Qualifier.",
  },
  "qualifier-english-1": {
    title: "English I",
    description: "Essential communication skills for IITM BS Qualifier students.",
  },
  "foundation-stats-2": {
    title: "Statistics for Data Science II",
    description: "Master advanced probability distributions, inference, hypothesis testing and regression for IITM BS Degree.",
  },
  "qualifier-python": {
    title: "Programming in Python",
    description: "Learn Python from scratch and build real-world data applications.",
  },
  "qualifier-java": {
    title: "Programming in Java",
    description: "Master Object Oriented Programming principles with Java.",
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { courseId: id } = await params
  const course = courseData[id]

  if (!course) {
    return {
      title: "Course Not Found",
    }
  }

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: `${course.title} | BSPrep`,
      description: course.description,
      images: ['/og-image.png'],
    },
  }
}

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
