"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface MentorRequest {
  id: string
  student_name: string
  subject: string
  message: string
  status: string
  created_at: string
}

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState<MentorRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("mentor_requests")
        .select(`
          id,
          subject,
          message,
          status,
          created_at,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq("mentor_id", user.id)
        .order("created_at", { ascending: false })

      if (data) {
        const formattedRequests = data.map((request) => {
          const profile = Array.isArray(request.profiles) ? request.profiles[0] : request.profiles

          return {
            id: request.id,
            student_name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Unknown Student",
            subject: request.subject,
            message: request.message,
            status: request.status,
            created_at: request.created_at,
          }
        })
        setRequests(formattedRequests)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("mentor_requests").update({ status: newStatus }).eq("id", requestId)

      if (error) throw error
      fetchRequests()
    } catch (error) {
      console.error("Error updating request:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mentoring Requests</h1>
        <p className="text-muted-foreground">Manage student requests for mentoring</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading requests...</div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center text-muted-foreground">No mentoring requests yet</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{request.student_name}</p>
                  </div>
                  <Badge
                    variant={
                      request.status === "pending"
                        ? "outline"
                        : request.status === "accepted"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{request.message}</p>
                <div className="flex gap-2 pt-4">
                  {request.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-primary"
                        onClick={() => handleStatusChange(request.id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(request.id, "declined")}>
                        Decline
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
