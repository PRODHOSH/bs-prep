"use client"

import { useEffect, useState } from "react"

type Announcement = {
  text: string
  time: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    fetch("http://localhost:5000/announcements")
      .then(res => res.json())
      .then(data => setAnnouncements(data))
  }, [])

  return (
    <div style={{ padding: "24px" }}>
      <h1>📢 Announcements</h1>

      {announcements.length === 0 && (
        <p>No announcements yet.</p>
      )}

      {announcements.map((a, i) => (
        <div
          key={i}
          style={{
            marginTop: "12px",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px"
          }}
        >
          <p>{a.text}</p>
          <small>{new Date(a.time).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}
