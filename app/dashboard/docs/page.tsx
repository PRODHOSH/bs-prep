"use client"

import { FileText, ExternalLink, Book, Calendar, Bell, LineChart, MessagesSquare, Archive, GraduationCap } from "lucide-react"

const DOCS_LINKS = [
  {
    title: "Student Handbook",
    description: "Official guidelines, policies, and procedures for IITM BS students.",
    url: "https://docs.google.com/document/u/2/d/e/2PACX-1vRxGnnDCVAO3KX2CGtMIcJQuDrAasVk2JHbDxkjsGrTP5ShhZK8N6ZSPX89lexKx86QPAUswSzGLsOA/pub",
    icon: Book,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "May 2026 Gradebook",
    description: "Access the latest gradebook and academic progress tracking.",
    url: "https://docs.google.com/document/u/8/d/e/2PACX-1vT5PBOz4OH663W0IJPVGVjG_nfmYZGfFI7W1j-6wTLcex13O_7BZmf6a96Q6liO0W-mLZB5hOGZeNNl/pub?urp=gmail_link",
    icon: Calendar,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Foundation Announcement",
    description: "Important announcements and updates for foundation level courses.",
    url: "https://docs.google.com/document/u/8/d/e/2PACX-1vR5ednrJBvyGWrv1mU3aibfoAoxI8182QWHVCZS9dvPIB_QXFby6yfyxbnIRiG1LwxNih1Xhrc66G7G/pub?urp=gmail_link",
    icon: Bell,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Diploma Announcement",
    description: "Important announcements and updates for diploma level courses.",
    url: "https://docs.google.com/document/u/8/d/e/2PACX-1vT1FCWEatNR-gSBHmI2I17tqGHCmUkeFVTzl7VTbR4MZVqm2q54OOFbf7nDMsfe68ONXTB29BwPsIr7/pub",
    icon: Bell,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Course Planner",
    description: "IITM BS official app to plan your courses and terms effectively.",
    url: "https://course-planner-140256174016.asia-south1.run.app/login",
    icon: Calendar,
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    title: "Score Checker",
    description: "Check your course-wise scores and qualification status.",
    url: "https://score-checker-379619009600.asia-south1.run.app/course_wise",
    icon: LineChart,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    title: "Official WhatsApp",
    description: "Connect with the official IITM BS WhatsApp support channel.",
    url: "https://api.whatsapp.com/message/IVROM2UN7XIJL1?autoload=1&app_absent=0",
    icon: MessagesSquare,
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "Document Archive",
    description: "Access previous term documents, papers, and archives.",
    url: "https://study.iitm.ac.in/ds/archive.html",
    icon: Archive,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Course Syllabus",
    description: "Detailed syllabus and curriculum for all subjects.",
    url: "https://docs.google.com/document/u/1/d/e/2PACX-1vSWW4TMd2ujKYOeSay5iCIyTGLtJgM1KWC-Ernu_JdhugLtB0dXV9i966Z-ZaPZ9qAAI1_QtWa3o3br/pub#h.64f8davxbp1d",
    icon: GraduationCap,
    color: "bg-cyan-500/10 text-cyan-600",
  },
]

export default function DocsPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-2 uppercase">Official Docs & Links</h1>
        <p className="text-gray-500 font-medium">Quick access to important IITM BS official resources, tools, and announcements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOCS_LINKS.map((doc, idx) => {
          const Icon = doc.icon
          return (
            <a 
              key={idx}
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ring-1 ring-black/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${doc.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-2">{doc.title}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed flex-grow">
                {doc.description}
              </p>
            </a>
          )
        })}
      </div>
    </div>
  )
}
