"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { courses, type Course } from "@/lib/course-catalog"

export type MenuId = "courses" | "resources" | "tools"

type Item = { href: string; title: string; desc?: string }
type Column = { label: string; items: Item[] }
type Menu = {
  intro: { title: string; text: string; cta: Item }
  columns: Column[]
  card: { eyebrow: string; title: string; text: string; href: string; label: string }
}

const isBundle = (c: Course) => c.id.endsWith("-bundle")
const available = courses.filter((c) => c.available)
const toItem = (c: Course): Item => ({ href: `/courses/${c.id}`, title: c.title, desc: c.description })

const qualifier = available.filter((c) => c.level === "qualifier" && !isBundle(c)).map(toItem)
const foundation = available.filter((c) => c.level === "foundation" && !isBundle(c)).map(toItem)
const bundles = available.filter(isBundle).map(toItem)

const MENUS: Record<MenuId, Menu> = {
  courses: {
    intro: {
      title: "Tamil-medium courses for IITM BS",
      text: "Video lectures, live classes and a certificate with every course.",
      cta: { href: "/courses", title: "Browse all courses" },
    },
    columns: [
      { label: "Qualifier", items: qualifier },
      { label: "Foundation", items: foundation },
      { label: "Bundles", items: bundles },
    ],
    card: {
      eyebrow: "Qualifier bundle",
      title: "All 4 qualifier courses together",
      text: "Mathematics, Statistics, Computational Thinking and English I. Save ₹200 over buying them one by one.",
      href: "/courses/qualifier-bundle",
      label: "View the bundle",
    },
  },
  resources: {
    intro: {
      title: "Study material from students who have been there",
      text: "Notes for every subject, answered doubts and a community that helps.",
      cta: { href: "/resources", title: "Browse resources" },
    },
    columns: [
      {
        label: "Learn",
        items: [
          { href: "/resources", title: "Notes and materials", desc: "Curated notes for every IITM BS subject" },
          { href: "/quiz-prep", title: "Quiz prep", desc: "Mock tests and OPPE practice from past papers" },
          { href: "/doubts", title: "Doubts", desc: "Verified answers from mentors and peers" },
        ],
      },
      {
        label: "Connect",
        items: [{ href: "/community", title: "Community", desc: "Study with fellow IITM BS students" }],
      },
    ],
    card: {
      eyebrow: "Contribute",
      title: "Share your notes",
      text: "Upload notes for a subject you know well and help the next batch.",
      href: "/resources",
      label: "Add notes",
    },
  },
  tools: {
    intro: {
      title: "Tools that save you time",
      text: "Work out grades before results and practise code without installing anything.",
      cta: { href: "/tools/gpa-calculator", title: "Open the GPA calculator" },
    },
    columns: [
      {
        label: "GPA",
        items: [
          { href: "/tools/gpa-calculator", title: "GPA calculator", desc: "Course grade and semester GPA" },
          { href: "/tools/gpa-predictor", title: "GPA predictor", desc: "The exam score you need for a target grade" },
        ],
      },
      {
        label: "Code",
        items: [{ href: "/compiler", title: "Compiler", desc: "Run Python, Java, C and C++ in your browser" }],
      },
    ],
    card: {
      eyebrow: "Online compiler",
      title: "Write, run and share code",
      text: "Multi-file editor, instant output and a one-click share link. No setup.",
      href: "/compiler",
      label: "Open the compiler",
    },
  },
}

/** Full-width mega menu. Intro on the left, link columns in the middle, a feature card on the right. */
export function MenuPanelContent({ menu, onNavigate }: { menu: MenuId; onNavigate: () => void }) {
  const { intro, columns, card } = MENUS[menu]
  // Two visual columns: with three groups, the last two share the second column.
  const stacks = columns.length === 3 ? [[columns[0]], [columns[1], columns[2]]] : columns.map((c) => [c])
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-x-10 gap-y-6 px-8 py-8 lg:px-12">
      <div className="col-span-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-black/40">Discover</p>
        <p className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-black">{intro.title}</p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-black/55">{intro.text}</p>
        <Link href={intro.cta.href} onClick={onNavigate} className="group mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#0a192f]">
          {intro.cta.title}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="col-span-6 grid grid-cols-2 gap-x-8">
        {stacks.map((stack, si) => (
          <div key={si} className="space-y-6">
            {stack.map((col) => (
              <div key={col.label}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/40">{col.label}</p>
                <ul className="mt-3 space-y-0.5">
                  {col.items.map((item) => (
                    <li key={item.href + item.title}>
                      <Link href={item.href} onClick={onNavigate} className="group -mx-3 block rounded-xl px-3 py-2 transition-colors hover:bg-black/[0.04]">
                        <span className="block text-[15px] font-bold text-black">{item.title}</span>
                        {item.desc && <span className="mt-0.5 block truncate text-xs font-medium text-black/50">{item.desc}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Link href={card.href} onClick={onNavigate} className="group col-span-3 flex flex-col justify-between rounded-3xl bg-[#0a192f] p-6 text-white">
        <span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">{card.eyebrow}</span>
          <span className="mt-3 block text-xl font-extrabold leading-snug tracking-tight">{card.title}</span>
          <span className="mt-2 block text-sm font-medium leading-relaxed text-white/60">{card.text}</span>
        </span>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold">
          {card.label}
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  )
}

/** The same menus as flat lists for the mobile drawer. */
export function MobileMenuGroup({ menu, onNavigate }: { menu: MenuId; onNavigate: () => void }) {
  const { columns, intro } = MENUS[menu]
  const items = columns.flatMap((c) => c.items)
  return (
    <div className="space-y-0.5 pb-2">
      {items.map((item) => (
        <Link key={item.href + item.title} href={item.href} onClick={onNavigate} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-black/80 hover:bg-black/5">
          {item.title}
        </Link>
      ))}
      {menu === "courses" && (
        <Link href={intro.cta.href} onClick={onNavigate} className="block rounded-xl px-3 py-2.5 text-sm font-bold text-[#0a192f] hover:bg-black/5">
          {intro.cta.title}
        </Link>
      )}
    </div>
  )
}
