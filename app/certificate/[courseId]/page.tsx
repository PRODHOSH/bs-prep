"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CertificateDocument } from "@/components/certificate-document"

export default function CertificatePage() {
  const { courseId } = useParams() as { courseId: string }
  const router = useRouter()

  const [studentName, setStudentName] = useState("")
  const [courseName, setCourseName] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [isAdminPreview, setIsAdminPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/certificate/${courseId}`)
        const data = await res.json()

        if (!res.ok) {
          if (data.error === "not_authenticated") {
            setError("Please sign in to view your certificate.")
          } else if (data.error === "not_enrolled") {
            setError("You are not enrolled in this course.")
          } else if (data.error === "cert_not_available") {
            setError("Certificate not yet available for this course.")
          } else {
            setError("Something went wrong. Please try again.")
          }
          return
        }

        setStudentName(data.studentName)
        setCourseName(data.courseName)
        setIssueDate(data.issueDate)
        setIsAdminPreview(data.isAdminPreview ?? false)
      } catch (err) {
        console.error("Certificate page error:", err)
        setError("Something went wrong. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [courseId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-black rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-black">{error}</p>
        <button onClick={() => router.back()} className="text-sm text-gray-500 underline underline-offset-4">Go back</button>
      </div>
    )
  }

  return (
    <>
      {isAdminPreview && (
        <div className="no-print fixed top-14 left-0 right-0 z-40 text-center py-1.5 bg-amber-50 border-b border-amber-200 text-xs font-semibold text-amber-700">
          Admin preview — certificate not yet enabled for students
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #f0ede8; }
        .no-print { display: flex; }
        @page { size: A4 landscape; margin: 0; }
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .cert-wrap { padding: 0 !important; min-height: unset !important; background: white !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-black transition-colors">
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          className="bg-black text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-black/80 transition-colors"
        >
          Download PDF
        </button>
      </div>
      <div className="no-print h-[52px]" />

      {/* Certificate preview */}
      <div className="cert-wrap flex items-center justify-center min-h-[calc(100vh-52px)] p-8">
        <div style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.18)" }}>
          <CertificateDocument
            studentName={studentName}
            courseName={courseName}
            issueDate={issueDate}
          />
        </div>
      </div>
    </>
  )
}
