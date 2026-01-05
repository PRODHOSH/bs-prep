"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Trophy, Users, TrendingUp } from "lucide-react"

export default function StudentDashboard() {
  const [userName, setUserName] = useState("")
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserName(user.email?.split("@")[0] || "Student")
          
          // Get enrolled courses count
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
          
          setEnrolledCoursesCount(enrollments?.length || 0)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e3098]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-slate-400 text-lg">
          Continue your learning journey with IITM BS courses
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-800/30 rounded-lg hover:border-purple-700/50 transition-all backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Enrolled Courses</p>
              <p className="text-3xl font-bold text-white">{enrolledCoursesCount}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-800/30 rounded-lg hover:border-green-700/50 transition-all backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-600 to-green-700 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-800/30 rounded-lg hover:border-blue-700/50 transition-all backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Progress</p>
              <p className="text-3xl font-bold text-white">
                {enrolledCoursesCount > 0 ? '25%' : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/courses">
            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-800/40 rounded-lg hover:border-purple-600 hover:shadow-lg hover:shadow-purple-900/30 transition-all cursor-pointer group">
              <BookOpen className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white text-lg mb-2">My Courses</h3>
              <p className="text-sm text-slate-400">View and continue your enrolled courses</p>
            </div>
          </Link>

          <Link href="/dashboard/courses">
            <div className="p-6 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-800/40 rounded-lg hover:border-green-600 hover:shadow-lg hover:shadow-green-900/30 transition-all cursor-pointer group">
              <Users className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white text-lg mb-2">Explore Courses</h3>
              <p className="text-sm text-slate-400">Discover new courses to enroll in</p>
            </div>
          </Link>

          <Link href="/dashboard/profile">
            <div className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-800/40 rounded-lg hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/30 transition-all cursor-pointer group">
              <Users className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white text-lg mb-2">My Profile</h3>
              <p className="text-sm text-slate-400">Update your profile and settings</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {enrolledCoursesCount === 0 && (
        <div className="p-8 bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-green-900/40 border border-purple-700/50 rounded-lg backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-3">
            🎉 Welcome to BSPrep!
          </h2>
          <p className="text-slate-300 mb-6 text-lg">
            Start your IITM BS journey by exploring our courses. Enroll in free qualifier courses or upgrade to foundation level courses.
          </p>
          <Link href="/dashboard/courses">
            <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-500 hover:to-green-500 text-white px-6 py-3 text-base shadow-lg shadow-purple-900/50">
              Browse Courses
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
