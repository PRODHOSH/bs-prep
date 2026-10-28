"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { LEGAL_LINKS, LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/legal"

export type LegalSection = { title: string; body: ReactNode }

type Props = {
  title: string
  sections: LegalSection[]
  /** Highlighted summary shown above the sections. */
  callout?: { eyebrow: string; title: string; text: ReactNode }
  /** Extra content between the sections and the contact card (e.g. a cookie table). */
  children?: ReactNode
  contact?: { heading: string; email: string }
}

/** Shared layout for every legal page, so they read and look the same. */
export function LegalPage({ title, sections, callout, children, contact = { heading: "Questions about this page?", email: SUPPORT_EMAIL } }: Props) {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setIsAuthenticated(!!session))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar isAuthenticated={isAuthenticated} />

      <main className="relative z-10 flex-1 px-4 pb-20 pt-10 sm:pt-14">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Legal pages" className="mb-8 flex flex-wrap gap-2">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                  pathname === l.href ? "border-[#0a192f] bg-[#0a192f] text-white" : "border-black/10 bg-white text-black/60 hover:text-black"
                }`}
              >
                {l.name}
              </Link>
            ))}
          </nav>

          <header className="mb-10">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-black md:text-5xl">{title}</h1>
            <p className="mt-3 text-sm font-medium text-black/50">Last updated {LEGAL_UPDATED}</p>
            <p className="mt-1 text-xs font-medium text-black/40">BSPrep is an independent student initiative and is not affiliated with IIT Madras.</p>
          </header>

          {callout && (
            <div className="mb-6 rounded-3xl bg-[#0a192f] px-7 py-6 text-white shadow-md">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-white/45">{callout.eyebrow}</p>
              <p className="mb-2 text-lg font-extrabold leading-snug">{callout.title}</p>
              <div className="text-sm leading-relaxed text-white/70 [&_a]:font-semibold [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-white">
                {callout.text}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
            {sections.map((s, i) => (
              <section key={s.title} className={`flex gap-5 px-7 py-6 ${i !== sections.length - 1 ? "border-b border-black/[0.06]" : ""}`}>
                <span className="w-6 shrink-0 pt-0.5 font-mono text-sm text-black/25">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <h2 className="mb-1 text-base font-bold text-black">{s.title}</h2>
                  <div className="text-sm leading-relaxed text-black/60 [&_a]:font-semibold [&_a]:text-[#0a192f] [&_a]:underline [&_a]:underline-offset-2">{s.body}</div>
                </div>
              </section>
            ))}
          </div>

          {children}

          <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-3xl bg-[#0a192f] px-7 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-white">{contact.heading}</p>
              <p className="mt-0.5 text-xs text-white/50">We read every message.</p>
            </div>
            <a href={`mailto:${contact.email}`} className="font-mono text-xs text-white/80 underline underline-offset-2 transition-colors hover:text-white">
              {contact.email}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
