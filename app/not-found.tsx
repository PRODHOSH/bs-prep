import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <div className="max-w-lg w-full text-center">

          {/* 404 number */}
          <h1 className="text-8xl sm:text-9xl font-bold text-black tracking-tight mb-2">404</h1>
          <p className="text-xs uppercase tracking-widest text-black/30 font-medium mb-8">Page not found</p>

          {/* Message card */}
          <div className="bg-white border border-black/10 rounded-2xl shadow-sm px-8 py-8 mb-8">
            <p className="text-base text-black/60 leading-relaxed mb-8">
              The page you&apos;re looking for doesn&apos;t exist or may have been moved.<br />
              Head back and find what you need.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-black/80 transition-colors"
              >
                Go Home
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center border border-black/15 text-black text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-black/5 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "Quiz Prep", href: "/quiz-prep" },
              { label: "Resources", href: "/resources" },
              { label: "Community", href: "/community" },
              { label: "Support", href: "/support" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-black/40 hover:text-black transition-colors underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
