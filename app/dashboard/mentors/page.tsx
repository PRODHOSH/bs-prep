"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Mentor {
  id: string
  name: string
  bio: string
  role: string
}

interface MentorRequest {
  id: string
  mentor_name: string
  status: string
  subject: string
  created_at: string
}

export default function MentorsPage() {
  const router = useRouter()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [requests, setRequests] = useState<MentorRequest[]>([])
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fallbackNameFromEmail = (email: string | null | undefined, fallback: string) => {
    if (!email) {
      return fallback
    }

    const localPart = email.split("@")[0]?.trim()
    if (!localPart) {
      return fallback
    }

    const words = localPart
      .replace(/[._-]+/g, " ")
      .replace(/\d+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    if (!words.length) {
      return fallback
    }

    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
  }

  useEffect(() => {
    const fetchMentorsAndRequests = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const { data: mentorsList } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, bio, email")
          .eq("role", "mentor")

        if (mentorsList) {
          setMentors(
            mentorsList.map((m) => ({
              id: m.id,
              name: `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || fallbackNameFromEmail(m.email, "Mentor"),
              bio: m.bio || "Experienced mentor",
              role: "Mentor",
            })),
          )
        }

        if (user) {
          const { data: requestsList } = await supabase
            .from("mentor_requests")
            .select(`
              id,
              status,
              subject,
              created_at,
              profiles (
                first_name,
                last_name
              )
            `)
            .eq("student_id", user.id)
            .order("created_at", { ascending: false })

          if (requestsList) {
            setRequests(
              requestsList.map((r) => ({
                id: r.id,
                mentor_name: `${r.profiles.first_name} ${r.profiles.last_name}`.trim(),
                status: r.status,
                subject: r.subject,
                created_at: r.created_at,
              })),
            )
          }
        }
      } catch (error) {
        console.error("Error fetching mentors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMentorsAndRequests()
  }, [])

  const handleSubmitRequest = async () => {
    if (!selectedMentor || !subject || !message) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("mentor_requests").insert({
        student_id: user.id,
        mentor_id: selectedMentor,
        subject,
        message,
        status: "pending",
      })

      if (error) throw error

      setSelectedMentor(null)
      setSubject("")
      setMessage("")
      // Refresh requests
      const { data: updated } = await supabase
        .from("mentor_requests")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })

      if (updated) {
        setRequests(
          updated.map((r) => ({
            id: r.id,
            mentor_name: mentors.find((m) => m.id === r.mentor_id)?.name || "Unknown",
            status: r.status,
            subject: r.subject,
            created_at: r.created_at,
          })),
        )
      }
    } catch (error) {
      console.error("Error submitting request:", error)
    }
  }

  const handleContactMentor = (mentorId: string) => {
    router.push(`/dashboard/chats?contactMentorId=${encodeURIComponent(mentorId)}`)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading mentors...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Connect with Mentors</h1>
        <p className="text-muted-foreground">Get guidance from experienced mentors</p>
      </div>

      {/* Mentor Requests */}
      {requests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Requests</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{request.subject}</h3>
                      <p className="text-sm text-muted-foreground">{request.mentor_name}</p>
                    </div>
                    <Badge variant={request.status === "pending" ? "outline" : "default"}>{request.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Mentors */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Mentors</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {mentors.map((mentor) => (
            <Card key={mentor.id}>
              <CardHeader>
                <CardTitle>{mentor.name}</CardTitle>
                <CardDescription>{mentor.bio}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => handleContactMentor(mentor.id)}>
                    Contact
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full" onClick={() => setSelectedMentor(mentor.id)}>
                        Request Mentoring
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Mentoring from {mentor.name}</DialogTitle>
                        <DialogDescription>Tell them what you need help with</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            placeholder="What do you need help with?"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Provide more details..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleSubmitRequest} className="w-full bg-primary">
                          Send Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
