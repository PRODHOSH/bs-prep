"use client"

import { ArrowUpRight, Book, Calendar, Bell, LineChart, MessagesSquare, Archive, GraduationCap } from "lucide-react"
import { IconTile, PageHeader } from "@/components/dashboard/ui"

const DOCS_LINKS = [
  {
    title: "Student Handbook",
    description: "Official guidelines, policies, and procedures for IITM BS students.",
    url: "https://docs.google.com/document/u/2/d/e/2PACX-1vRxGnnDCVAO3KX2CGtMIcJQuDrAasVk2JHbDxkjsGrTP5ShhZK8N6ZSPX89lexKx86QPAUswSzGLsOA/pub",
    icon: Book,
    tone: "primary" as const,
  },
  {
    title: "May 2026 Gradebook",
    description: "Access the latest gradebook and academic progress tracking.",
    url: "https://docs.google.com/document/u/8/d/e/2PACX-1vT5PBOz4OH663W0IJPVGVjG_nfmYZGfFI7W1j-6wTLcex13O_7BZmf6a96Q6liO0W-mLZB5hOGZeNNl/pub?urp=gmail_link",
    icon: Calendar,
    tone: "green" as const,
  },
  {
    title: "Foundation Announcement",
    description: "Important announcements and updates for foundation level courses.",
    url: "https://docs.google.com/document/u/8/d/e/2PACX-1vR5ednrJBvyGWrv1mU3aibfoAoxI8182QWHVCZS9dvPIB_QXFby6yfyxbnIRiG1LwxNih1Xhrc66G7G/pub?urp=gmail_link",
    icon: Bell,
    tone: "amber" as const,
  },
  {
    title: "Diploma Announcement",
    description: "Important announcements and updates for diploma level courses.",
    url: "https://docs.google.com/document/u/8/d/e/2PACX-1vT1FCWEatNR-gSBHmI2I17tqGHCmUkeFVTzl7VTbR4MZVqm2q54OOFbf7nDMsfe68ONXTB29BwPsIr7/pub",
    icon: Bell,
    tone: "amber" as const,
  },
  {
    title: "Course Planner",
    description: "IITM BS official app to plan your courses and terms effectively.",
    url: "https://course-planner-140256174016.asia-south1.run.app/login",
    icon: Calendar,
    tone: "primary" as const,
  },
  {
    title: "Score Checker",
    description: "Check your course-wise scores and qualification status.",
    url: "https://score-checker-379619009600.asia-south1.run.app/course_wise",
    icon: LineChart,
    tone: "pink" as const,
  },
  {
    title: "Official WhatsApp",
    description: "Connect with the official IITM BS WhatsApp support channel.",
    url: "https://api.whatsapp.com/message/IVROM2UN7XIJL1?autoload=1&app_absent=0",
    icon: MessagesSquare,
    tone: "green" as const,
  },
  {
    title: "Document Archive",
    description: "Access previous term documents, papers, and archives.",
    url: "https://study.iitm.ac.in/ds/archive.html",
    icon: Archive,
    tone: "primary" as const,
  },
  {
    title: "Course Syllabus",
    description: "Detailed syllabus and curriculum for all subjects.",
    url: "https://docs.google.com/document/u/1/d/e/2PACX-1vSWW4TMd2ujKYOeSay5iCIyTGLtJgM1KWC-Ernu_JdhugLtB0dXV9i966Z-ZaPZ9qAAI1_QtWa3o3br/pub#h.64f8davxbp1d",
    icon: GraduationCap,
    tone: "cyan" as const,
  },
]

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Official docs" description="Quick access to IITM BS handbooks, tools and announcements." />

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {DOCS_LINKS.map((doc) => (
          <li key={doc.title} className="group relative flex flex-col rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between">
              <IconTile icon={doc.icon} tone={doc.tone} className="size-11 rounded-xl" />
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
            <h3 className="mt-4 text-[15px] font-bold leading-snug">{doc.title}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{doc.description}</p>
            <a href={doc.url} target="_blank" rel="noopener noreferrer" aria-label={doc.title} className="absolute inset-0 rounded-2xl" />
          </li>
        ))}
      </ul>
    </div>
  )
}
