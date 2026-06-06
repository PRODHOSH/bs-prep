"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'Inter', sans-serif; }

        .no-print { display: flex; }

        @page {
          size: A4 landscape;
          margin: 0;
        }

        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .cert-page { width: 297mm; height: 210mm; box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      {/* Toolbar — hidden on print */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-black transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          className="bg-black text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-black/80 transition-colors"
        >
          Download PDF
        </button>
      </div>

      {/* Spacer for toolbar */}
      <div className="no-print h-13" />

      {/* Certificate */}
      <div className="flex items-center justify-center min-h-[calc(100vh-52px)] p-8 bg-[#f5f5f5] print:p-0 print:bg-white">
        <div
          className="cert-page relative bg-white shadow-2xl"
          style={{
            width: "297mm",
            height: "210mm",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20mm 24mm",
          }}
        >
          {/* Outer border */}
          <div style={{
            position: "absolute", inset: "8mm",
            border: "1.5px solid #0a0a0a",
            pointerEvents: "none",
          }} />
          {/* Inner border */}
          <div style={{
            position: "absolute", inset: "11mm",
            border: "0.5px solid rgba(0,0,0,0.15)",
            pointerEvents: "none",
          }} />

          {/* Corner ornaments */}
          {[
            { top: "5mm", left: "5mm" },
            { top: "5mm", right: "5mm" },
            { bottom: "5mm", left: "5mm" },
            { bottom: "5mm", right: "5mm" },
          ].map((pos, i) => (
            <div key={i} style={{
              position: "absolute", ...pos,
              width: "8mm", height: "8mm",
              borderTop: i < 2 ? "2px solid #0a0a0a" : "none",
              borderBottom: i >= 2 ? "2px solid #0a0a0a" : "none",
              borderLeft: i % 2 === 0 ? "2px solid #0a0a0a" : "none",
              borderRight: i % 2 === 1 ? "2px solid #0a0a0a" : "none",
            }} />
          ))}

          {/* Content */}
          <div style={{ textAlign: "center", width: "100%", position: "relative", zIndex: 1 }}>

            {/* Logo + brand */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "6mm" }}>
              <img
                src="/new-logo-favicon.png"
                alt="BSPrep"
                style={{ width: "36px", height: "36px", objectFit: "contain" }}
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "15px", color: "#0a0a0a", lineHeight: 1 }}>BSPrep</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#888", marginTop: "2px", letterSpacing: "0.06em" }}>IITM BS QUALIFIER PREP</div>
              </div>
            </div>

            {/* Title */}
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#888",
              marginBottom: "3mm",
            }}>
              Certificate of Completion
            </div>

            {/* Ornamental line */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "5mm" }}>
              <div style={{ height: "1px", width: "40mm", background: "linear-gradient(to right, transparent, #0a0a0a)" }} />
              <div style={{ width: "5px", height: "5px", background: "#0a0a0a", transform: "rotate(45deg)" }} />
              <div style={{ height: "1px", width: "40mm", background: "linear-gradient(to left, transparent, #0a0a0a)" }} />
            </div>

            {/* Certify text */}
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "13px",
              color: "#555",
              marginBottom: "3mm",
            }}>
              This is to certify that
            </div>

            {/* Student name */}
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "36px",
              fontWeight: 700,
              color: "#0a0a0a",
              lineHeight: 1.1,
              marginBottom: "4mm",
              letterSpacing: "-0.5px",
            }}>
              {studentName}
            </div>

            {/* Underline below name */}
            <div style={{ width: "80mm", height: "1px", background: "#0a0a0a", margin: "0 auto 4mm" }} />

            {/* Completion text */}
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: "#555",
              marginBottom: "2mm",
            }}>
              has successfully completed the course
            </div>

            {/* Course name */}
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px",
              fontWeight: 700,
              color: "#0a0a0a",
              marginBottom: "1mm",
            }}>
              {courseName}
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              color: "#999",
              letterSpacing: "0.08em",
              marginBottom: "6mm",
            }}>
              IITM BS QUALIFIER PREP · BSPREP · 2026
            </div>

            {/* Bottom row */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: "100%", paddingTop: "4mm", borderTop: "1px solid #e8e8e8" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#aaa", marginBottom: "1mm", letterSpacing: "0.06em" }}>DATE ISSUED</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#0a0a0a" }}>{issueDate}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", color: "#bbb", letterSpacing: "0.04em" }}>
                  Student-led initiative · Not affiliated with IIT Madras
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", color: "#bbb", marginTop: "1px" }}>
                  bsprep.in
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#aaa", marginBottom: "1mm", letterSpacing: "0.06em" }}>ISSUED BY</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#0a0a0a" }}>The BSPrep Team</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
