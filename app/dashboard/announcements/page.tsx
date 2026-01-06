"use client"

import { useState } from "react"

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || "Something went wrong")
    } else {
      setMessage("Announcement added successfully ✅")
      setTitle("")
      setContent("")
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1>📢 Add Announcement</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        <button disabled={loading}>
          {loading ? "Posting..." : "Post Announcement"}
        </button>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  )
}
