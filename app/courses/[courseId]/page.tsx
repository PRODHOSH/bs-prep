"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BeamsBackground } from "@/components/beams-background"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

// Course syllabus data
const courseSyllabusData: Record<string, any> = {
  "qualifier-math-1": {
    title: "Mathematics for Data Science I",
    level: "qualifier",
    price: 349,
    description: "Fundamental mathematics concepts for data science",
    thumbnail: "/courses/math.jpg",
    syllabus: [
      {
        week: 1,
        title: "Set Theory - Number system, Sets and their operations",
        topics: "Relations and functions - Relations and their types, Functions and their types"
      },
      {
        week: 2,
        title: "Rectangular coordinate system, Straight Lines",
        topics: "Slope of a line, Parallel and perpendicular lines, Representations of a Line, General equations of a line, Straight-line fit"
      },
      {
        week: 3,
        title: "Quadratic Functions",
        topics: "Quadratic functions, Minima, maxima, vertex, and slope, Quadratic Equations"
      },
      {
        week: 4,
        title: "Algebra of Polynomials",
        topics: "Addition, subtraction, multiplication, and division, Algorithms, Graphs of Polynomials - X-intercepts, multiplicities, end behavior, and turning points, Graphing & polynomial creation"
      }
    ]
  },
  "qualifier-stats-1": {
    title: "Statistics for Data Science I",
    level: "qualifier",
    price: 349,
    description: "Introduction to statistical thinking and analysis",
    thumbnail: "/courses/stats.jpg",
    syllabus: [
      {
        week: 1,
        title: "Introduction and type of data",
        topics: "Types of data, Descriptive and Inferential statistics, Scales of measurement"
      },
      {
        week: 2,
        title: "Describing categorical data",
        topics: "Frequency distribution of categorical data, Best practices for graphing categorical data, Mode and median for categorical variable"
      },
      {
        week: 3,
        title: "Describing numerical data",
        topics: "Frequency tables for numerical data, Measures of central tendency - Mean, median and mode, Quartiles and percentiles, Measures of dispersion - Range, variance, standard deviation and IQR, Five number summary"
      },
      {
        week: 4,
        title: "Association between two variables",
        topics: "Association between two categorical variables - Using relative frequencies in contingency tables, Association between two numerical variables - Scatterplot, covariance, Pearson correlation coefficient, Point bi-serial correlation coefficient"
      }
    ]
  },
  "qualifier-computational-thinking": {
    title: "Computational Thinking",
    level: "qualifier",
    price: 349,
    description: "Problem-solving and algorithmic thinking fundamentals",
    thumbnail: "/courses/ct.jpg",
    syllabus: [
      {
        week: 1,
        title: "Variables, Initialization, Iterators, Filtering",
        topics: "Datatypes, Flowcharts, Sanity of data"
      },
      {
        week: 2,
        title: "Iteration, Filtering, Selection",
        topics: "Pseudocode, Finding max and min, AND operator"
      },
      {
        week: 3,
        title: "Multiple iterations (non-nested)",
        topics: "Three prizes problem, Procedures, Parameters, Side effects, OR operator"
      },
      {
        week: 4,
        title: "Nested iterations",
        topics: "Birthday paradox, Binning"
      }
    ]
  }
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const course = courseSyllabusData[courseId]
  const supabase = createClient()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
    setLoading(false)
  }

  const handleEnroll = () => {
    router.push(`/payment/${courseId}`)
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white relative">
        <BeamsBackground />
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="container mx-auto px-4 pt-32 text-center relative z-10">
          <h1 className="text-2xl font-bold text-black mb-4">Course Not Found</h1>
          <Link href="/courses">
            <Button className="bg-black hover:bg-black/80 text-white">Back to Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      <BeamsBackground />
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pt-24 pb-20 relative z-10">
        {/* Back Button */}
        <Link 
          href="/courses"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        {/* Course Header Card */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-lg mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between gap-8 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-gray-100 text-black text-xs font-semibold px-3 py-1 rounded">
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded">
                     Tamil
                  </Badge>
                </div>
                
                <h1 className="text-3xl font-bold text-black mb-3">
                  {course.title}
                </h1>
                
                <p className="text-base text-gray-600 mb-6">
                  {course.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>4 weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Self-paced</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-black">
                    ₹{course.price}
                  </div>
                  <Button 
                    onClick={handleEnroll}
                    className="bg-black hover:bg-black/80 text-white px-8 py-6 text-base font-semibold"
                  >
                    Enroll Now
                  </Button>
                </div>
              </div>
              
              {/* Course Thumbnail */}
              <div className="hidden md:block flex-shrink-0">
                <div className="w-96 h-54 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Syllabus */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black">Course Syllabus</h2>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              {course.syllabus.map((week: any, index: number) => (
                <div key={week.week}>
                  <div className="flex gap-4">
                    {/* Week Number */}
                    <div className="flex-shrink-0">
                      <Badge className="bg-black text-white text-sm font-semibold px-3 py-1 rounded">
                        Week {week.week}
                      </Badge>
                    </div>

                    {/* Week Content */}
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-black mb-1">
                        {week.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {week.topics}
                      </p>
                    </div>
                  </div>
                  {index < course.syllabus.length - 1 && (
                    <div className="border-b border-gray-200 mt-6"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Enroll Section */}
        <Card className="bg-gray-50 border border-gray-200 rounded-lg mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-black mb-3">Ready to start learning?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of students mastering {course.title}
            </p>
            <Button 
              onClick={handleEnroll}
              className="bg-black hover:bg-black/80 text-white px-12 py-6 text-lg font-semibold"
            >
              Enroll for ₹{course.price}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}