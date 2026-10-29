import Link from "next/link"
import { HeartHandshake, Instagram, Linkedin, Mail, ShieldCheck, Youtube } from "lucide-react"
import { GooglePreferredSource } from "@/components/google-preferred-source"
import { RazorpayBadge } from "@/components/razorpay-badge"
import { courses, type Course } from "@/lib/course-catalog"
import { LEGAL_LINKS } from "@/lib/legal"

type FooterLink = { name: string; href: string; external?: boolean; soon?: boolean }

const isBundle = (c: Course) => c.id.endsWith("-bundle")
const courseLink = (c: Course): FooterLink => ({ name: c.title, href: `/courses/${c.id}`, soon: !c.available })

const qualifier = courses.filter((c) => c.level === "qualifier" && !isBundle(c) && c.available).map(courseLink)
const foundation = courses.filter((c) => c.level === "foundation" && !isBundle(c)).map(courseLink)
const bundles = courses.filter((c) => isBundle(c) && c.available).map(courseLink)

const FEEDBACK_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSeqAmEuz6NrH6P-sa7jD9-0272a-cwm9eASrbvHor7nJN_TtQ/viewform?usp=dialog"
const CONTACT_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSc8lSGsbLay_yvhHWjL2rtCd0YJCgjXmxNZ3ttB4IcFB0Js8g/viewform?usp=dialog"

const columns: { heading: string; groups: { label?: string; links: FooterLink[] }[] }[] = [
  {
    heading: "Qualifier courses",
    groups: [
      { links: qualifier },
      { label: "Bundles", links: bundles },
    ],
  },
  {
    heading: "Foundation and beyond",
    groups: [
      { label: "Foundation", links: foundation },
      {
        label: "Higher levels",
        links: [
          { name: "Diploma level", href: "/courses", soon: true },
          { name: "Degree level", href: "/courses", soon: true },
        ],
      },
    ],
  },
  {
    heading: "Learn",
    groups: [
      {
        links: [
          { name: "Resources and notes", href: "/resources" },
          { name: "Doubts", href: "/doubts" },
          { name: "Community", href: "/community" },
          { name: "Live classes", href: "/dashboard/live-classes" },
          { name: "Blog", href: "https://blog.bsprep.in", external: true },
        ],
      },
      {
        label: "Tools",
        links: [
          { name: "GPA calculator", href: "/tools/gpa-calculator" },
          { name: "GPA predictor", href: "/tools/gpa-predictor" },
          { name: "Online compiler", href: "/compiler" },
        ],
      },
    ],
  },
  {
    heading: "Company",
    groups: [
      {
        links: [
          { name: "Careers", href: "/careers" },
          { name: "Ambassador portal", href: "https://ambassador.bsprep.in/", external: true },
          { name: "Contact", href: CONTACT_FORM, external: true },
          { name: "Feedback", href: FEEDBACK_FORM, external: true },
          { name: "Donate", href: "https://rzp.io/rzp/support-bsprep", external: true },
        ],
      },
    ],
  },
]

const linkCls = "inline-flex items-center gap-2 text-[13px] font-semibold leading-snug text-black/65 transition-colors hover:text-black"

function FooterItem({ link }: { link: FooterLink }) {
  const content = (
    <>
      <span>{link.name}</span>
      {link.soon && <span className="rounded-full bg-black/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black/70">Soon</span>}
    </>
  )
  if (link.external)
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
        {content}
      </a>
    )
  return (
    <Link href={link.href} className={linkCls}>
      {content}
    </Link>
  )
}

const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/bs-prep/", icon: Linkedin },
  { label: "YouTube", href: "https://www.youtube.com/@DataScienceIITMTamil", icon: Youtube },
  { label: "Instagram", href: "https://www.instagram.com/bsprep.in", icon: Instagram },
]

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-[#FDFBF7] text-black">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8 lg:px-12">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1.2fr_1.1fr_1fr_0.8fr]">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="BSPrep home">
              <span className="size-10 overflow-hidden rounded-full border border-black/10">
                <img src="/new-logo-192.jpg" alt="" className="h-full w-full scale-[1.3] object-cover object-center" />
              </span>
              <span className="text-2xl font-black tracking-tighter">BSPREP</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm font-medium leading-relaxed text-black/60">
              Community-driven academic support for IIT Madras BS students. Learn, grow and excel together.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <a href="mailto:support@bsprep.in" className="inline-flex items-center gap-2.5 text-sm font-semibold text-black/65 transition-colors hover:text-black">
                <Mail className="size-4 text-black/40" />
                support@bsprep.in
              </a>
              <a href="mailto:partnerships@bsprep.in" className="inline-flex items-center gap-2.5 text-sm font-semibold text-black/65 transition-colors hover:text-black">
                <HeartHandshake className="size-4 text-black/40" />
                partnerships@bsprep.in
              </a>
            </div>
            <div className="mt-6 flex items-center gap-2.5">
              {social.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full bg-black/5 text-black/60 transition-all hover:bg-black hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-black/55">{col.heading}</h3>
              <div className="mt-5 space-y-7">
                {col.groups.map((g, gi) => (
                  <div key={gi}>
                    {g.label && <p className="mb-3 text-xs font-bold text-black">{g.label}</p>}
                    <ul className="space-y-3">
                      {g.links.map((l) => (
                        <li key={l.name}>
                          <FooterItem link={l} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-14 flex flex-col gap-4 rounded-3xl border border-black/[0.06] bg-black/[0.02] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <GooglePreferredSource />
            <RazorpayBadge />
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-black/10 bg-white p-1.5 shadow-sm">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://pages.razorpay.com/pl_T7LY917rtczWQU/view"
                alt="Donate QR code"
                width={64}
                height={64}
                className="size-16 object-contain mix-blend-multiply"
              />
            </div>
            <div>
              <p className="text-sm font-bold">Support BSPrep</p>
              <p className="text-xs font-medium text-black/55">Scan to donate</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-5 border-t border-black/[0.06] pt-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-black/70">&copy; 2026 BSPrep. All rights reserved.</p>
            <p className="text-xs font-medium text-black/60">Not affiliated with IIT Madras. Independent student-led platform.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs font-semibold text-black/55 transition-colors hover:text-black">
                {l.name}
              </Link>
            ))}
            <a href="mailto:security@bsprep.in" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/55 transition-colors hover:text-black">
              <ShieldCheck className="size-3.5 text-[#1e3a8a]" />
              Report a vulnerability
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
