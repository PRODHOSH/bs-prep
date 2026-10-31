"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpen, Handshake, Languages, MessagesSquare } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

const JOIN_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfyhCw9tPgKmMWYPhjV6Kzixp2RdYEi-x7JPL6JUxoLwbnB_g/viewform?usp=sharing&ouid=109000575421815991569"

const reasons = [
  {
    icon: Handshake,
    title: "You are not doing it alone",
    body: "The IITM BS degree is one of the hardest online degrees in India. Quizzes, assignments and OPPEs pile up fast, and having someone to ask makes the difference.",
  },
  {
    icon: Languages,
    title: "In Tamil, and in English",
    body: "Ask a doubt the way you think it. Mentors and seniors explain in Tamil or English, whichever helps you understand.",
  },
  {
    icon: BookOpen,
    title: "Notes and past papers shared",
    body: "Students share notes, practice papers and what worked for them, so the next batch does not start from zero.",
  },
  {
    icon: MessagesSquare,
    title: "Help that comes back around",
    body: "Everyone starts as a beginner. Answer one doubt for someone a term behind you, and you learn it twice as well.",
  },
]

const socials = [
  { name: "WhatsApp community", note: "Class reminders and quick doubts", href: JOIN_URL },
  { name: "YouTube", note: "Lectures and walkthroughs in Tamil", href: "https://www.youtube.com/@DataScienceIITMTamil" },
  { name: "LinkedIn", note: "Updates and student stories", href: "https://www.linkedin.com/company/bs-prep/" },
  { name: "Instagram", note: "Short tips and announcements", href: "https://www.instagram.com/bsprep.in" },
]

const posts = [
  {
    title: "How to Manage the IITM BS Degree Alongside an Offline College Degree",
    excerpt: "A practical guide to coursework, assignments, exams and student life without burning out.",
    date: "June 9, 2026",
    read: "5 min read",
    tags: ["IITM BS", "Student Guide"],
    href: "https://blog.bsprep.in/blog/how-to-manage-the-iitm-bs-degree-alongside-an-offline-college-degree",
  },
]

export default function CommunityPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setIsAuthenticated(!!session))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 px-4 pb-20">
        <section className="mx-auto grid max-w-6xl items-center gap-10 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-16">
          <div>
            <p className="text-sm font-bold text-black/50">BSPrep community</p>
            <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight text-black md:text-6xl">
              Tamil students, <span className="text-[#0a192f]">doing the IITM BS degree together.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium text-black/65 md:text-lg">
              The degree is hard, and it is easier with people who have been through it. Join a community of Tamil-speaking students who share notes, answer doubts and cheer each other on.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0a192f] px-7 text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#112a52]"
              >
                Join the community <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link
                href={isAuthenticated ? "/dashboard/doubts" : "/auth/register"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 text-sm font-bold tracking-wide text-black transition-colors hover:bg-black/5"
              >
                {isAuthenticated ? "Ask a doubt" : "Create a free account"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <img src="/illustrations/community.svg" alt="Students working together" className="mx-auto h-auto w-full max-w-md" />
        </section>

        <section className="mx-auto max-w-6xl border-t border-black/10 py-14">
          <h2 className="text-3xl font-black tracking-tight text-black">Why a community matters here</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {reasons.map((r) => (
              <article key={r.title} className="rounded-3xl border border-black/10 bg-white p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FDFBF7] text-[#0a192f]">
                  <r.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-black text-black">{r.title}</h3>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-black/60">{r.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-black/10 py-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-black tracking-tight text-black">Find us everywhere</h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-5 transition-colors hover:border-[#0a192f]/40">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-black text-black">{s.name}</p>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-black/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black" />
                </div>
                <p className="mt-6 text-sm font-medium text-black/60">{s.note}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-black/10 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-black">From the blog</h2>
              <p className="mt-2 text-sm font-medium text-black/60">Guides and thoughts on the degree, written by us.</p>
            </div>
            <a href="https://blog.bsprep.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-black hover:underline">
              All posts <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {posts.map((p) => (
              <a key={p.href} href={p.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col rounded-3xl border border-black/10 bg-white p-6 transition-colors hover:border-[#0a192f]/40">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-[#FDFBF7] px-3 py-1 text-xs font-bold text-[#0a192f]">{t}</span>
                  ))}
                </div>
                <h3 className="mt-4 text-xl font-black leading-snug text-black">{p.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-black/60">{p.excerpt}</p>
                <p className="mt-6 text-xs font-bold text-black/40">{p.date} · {p.read}</p>
              </a>
            ))}
          </div>
        </section>

        <p className="mx-auto max-w-6xl border-t border-black/10 pt-6 text-sm font-medium text-black/50">
          Be kind, keep it honest, and do not share answers during tests. <Link href="/terms" className="font-bold text-black underline underline-offset-2">Read the full rules</Link>.
        </p>
      </main>

      <Footer />
    </div>
  )
}
