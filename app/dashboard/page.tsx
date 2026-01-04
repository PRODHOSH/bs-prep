"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { BarChart, Users, UserPlus, UserCheck, FileText, Phone, TrendingUp, Calendar } from "lucide-react"

interface DashboardStats {
  totalEmployees: number
  newEmployees: number
  resignedEmployees: number
  jobApplicants: number
  vacanciesChange: string
  candidatesChange: string
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 418,
    newEmployees: 21,
    resignedEmployees: 14,
    jobApplicants: 261,
    vacanciesChange: "+7%",
    candidatesChange: "+4%",
  })
  const [userName, setUserName] = useState("Maria")
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setUserName(user.email?.split("@")[0] || "Student")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    fetchUserData()
  }, [])

  const countries = [
    { name: "United States", percentage: 78, flag: "🇺🇸" },
    { name: "France", percentage: 43, flag: "🇫🇷" },
    { name: "Japan", percentage: 38, flag: "🇯🇵" },
    { name: "Sweden", percentage: 24, flag: "🇸🇪" },
    { name: "Spain", percentage: 16, flag: "🇪🇸" },
  ]

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Good morning, <span className="text-primary">{userName}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">long time no see</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Schedule
            </Button>
            <Button size="sm">
              Analytics
            </Button>
            <Button variant="outline" size="sm">
              Candidates
            </Button>
            <Button variant="outline" size="sm">
              KPI
            </Button>
            <Button variant="outline" size="sm">
              Leads
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardDescription className="text-sm">Total employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{stats.totalEmployees}</h3>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats.vacanciesChange} last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <UserPlus className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardDescription className="text-sm">New employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{stats.newEmployees}</h3>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats.vacanciesChange} last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <UserCheck className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardDescription className="text-sm">Resigned employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{stats.resignedEmployees}</h3>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats.candidatesChange} last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardDescription className="text-sm">Job applicants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">{stats.jobApplicants}</h3>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">+12% last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Interview */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Front-End Developer</p>
                  <p className="text-sm text-muted-foreground">Jordan Maxcon</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">11:30 AM - 12:45 AM</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>PayPal</Badge>
                  <Button size="sm" className="rounded-full w-10 h-10 p-0">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    View details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vacancy Trends Chart */}
          <Card className="border shadow-sm lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Vacancy Trends</CardTitle>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-muted-foreground">vacancies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span className="text-muted-foreground">candidates</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48 relative">
                {/* Simple chart representation */}
                <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full max-w-[20px] space-y-1">
                        <div
                          className="w-full bg-primary rounded-t"
                          style={{ height: `${Math.random() * 80 + 40}px` }}
                        ></div>
                        <div
                          className="w-full bg-red-400 rounded-t"
                          style={{ height: `${Math.random() * 60 + 30}px` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Highlight marker */}
                <div className="absolute left-1/2 top-8 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  65.03
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Countries Insight */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Countries Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countries.map((country, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{country.name}</span>
                      <span className="text-sm font-semibold">{country.percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
          setStats({ totalCourses: 3, inProgress: 2, completed: 1, hoursLearned: 52 })
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  return (
