"use client"

import Link from "next/link"
import { useState } from "react"
import { Linkedin, Youtube, Github, Globe, X, Instagram, Twitter } from "lucide-react"

const developers = [
  {
    name: "Prodhosh VS",
    photo: "developers/prodhosh_photo.jpeg",
    linkedin: "https://www.linkedin.com/in/prodhoshvs/",
    github: "https://github.com/PRODHOSH",
    instagram: "https://www.instagram.com/itzprodhosh/",
    twitter: "https://x.com/prodhosh3",
    portfolio: "https://prodhosh.netlify.app/",
    about:
      "Freshman at VIT Chennai and IIT Madras BS Data Science.\nI mainly build SaaS-style web platforms for clubs, communities, and small organizations with focus on usability and scalability.\nCurrently transitioning from full-stack development toward AI engineering by strengthening fundamentals and integrating intelligence into applications.\nGoal: build software that doesn't just run — it learns and adapts.",
  },
  {
    name: "Saran",
    photo: "https://api.dicebear.com/7.x/personas/svg?seed=Saran",
    linkedin: "",
    github: "",
    instagram: "",
    twitter: "",
    portfolio: "",
    about: "",
  },
  {
    name: "Rishwanth",
    photo: "https://api.dicebear.com/7.x/personas/svg?seed=Rishwanth",
    linkedin: "",
    github: "",
    instagram: "",
    twitter: "",
    portfolio: "",
    about: "",
  },
]

export function Footer() {
  const [activeDev, setActiveDev] = useState<string | null>(null)
  const selectedDev = developers.find((d) => d.name === activeDev) ?? null

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Community Guidelines", href: "/community" },
  ]

  const supportLinks = [
    { name: "Contact Us", href: "mailto:bsprep.team@gmail.com" },
    { name: "Support", href: "/support" },
  ]

  return (
    <>
      <footer className="bg-[#FEF9E7]/95 backdrop-blur-sm border-t border-[#E5DBC8] mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.jpeg" alt="BSPrep Logo" className="w-10 h-10 rounded-full object-cover" />
                <span className="text-xl font-bold text-black">BSPrep</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">Learn. Grow. Excel. Together.</p>
              <p className="text-slate-500 text-xs">Community-driven academic support for IIT Madras students.</p>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://www.linkedin.com/company/bs-prep/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0077b5] hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/@DataScienceIITMTamil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Developers */}
            <div>
              <h3 className="font-semibold text-black mb-4">Developers</h3>
              <ul className="space-y-3">
                {developers.map((dev) => (
                  <li key={dev.name}>
                    <button
                      onClick={() => setActiveDev(dev.name)}
                      className="text-slate-600 hover:text-black transition-colors text-sm inline-flex items-center gap-2 group"
                    >
                      <img
                        src={dev.photo}
                        alt={dev.name}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200 bg-white"
                      />
                      <span className="group-hover:translate-x-0.5 transition-transform inline-block">{dev.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-black mb-4">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-slate-600 hover:text-black transition-colors text-sm inline-flex items-center group">
                      <span className="group-hover:translate-x-1 transition-transform inline-block">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-black mb-4">Support</h3>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-slate-600 hover:text-black transition-colors text-sm inline-flex items-center group">
                      <span className="group-hover:translate-x-1 transition-transform inline-block">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm"> 2026 BSPrep. All rights reserved.</p>
              <p className="text-slate-400 text-xs max-w-md text-center md:text-right">
                This platform is not affiliated with IIT Madras.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Individual Developer Modal */}
      {activeDev && selectedDev && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setActiveDev(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Black header */}
            <div className="bg-black px-8 pt-8 pb-16 relative">
              <button
                onClick={() => setActiveDev(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Developer</p>
              <h2 className="text-3xl font-bold text-white mt-1">{selectedDev.name}</h2>
            </div>

            {/* Photo overlapping header/body */}
            <div className="relative px-8">
              <div className="-mt-12 mb-4">
                <img
                  src={selectedDev.photo}
                  alt={selectedDev.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-gray-100"
                />
              </div>

              {/* Socials grid */}
              {(selectedDev.linkedin || selectedDev.github || selectedDev.instagram || selectedDev.twitter || selectedDev.portfolio) ? (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {selectedDev.linkedin && (
                    <a href={selectedDev.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-black hover:border-black hover:bg-black hover:text-white transition-all group">
                      <Linkedin className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="text-[11px] text-gray-400 group-hover:text-white/60 leading-none">LinkedIn</p>
                        <p className="text-xs font-semibold mt-0.5 truncate">prodhoshvs</p>
                      </div>
                    </a>
                  )}
                  {selectedDev.github && (
                    <a href={selectedDev.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-black hover:border-black hover:bg-black hover:text-white transition-all group">
                      <Github className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="text-[11px] text-gray-400 group-hover:text-white/60 leading-none">GitHub</p>
                        <p className="text-xs font-semibold mt-0.5 truncate">PRODHOSH</p>
                      </div>
                    </a>
                  )}
                  {selectedDev.instagram && (
                    <a href={selectedDev.instagram} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-black hover:border-black hover:bg-black hover:text-white transition-all group">
                      <Instagram className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="text-[11px] text-gray-400 group-hover:text-white/60 leading-none">Instagram</p>
                        <p className="text-xs font-semibold mt-0.5 truncate">itzprodhosh</p>
                      </div>
                    </a>
                  )}
                  {selectedDev.twitter && (
                    <a href={selectedDev.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-black hover:border-black hover:bg-black hover:text-white transition-all group">
                      <Twitter className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="text-[11px] text-gray-400 group-hover:text-white/60 leading-none">X / Twitter</p>
                        <p className="text-xs font-semibold mt-0.5 truncate">prodhosh3</p>
                      </div>
                    </a>
                  )}
                  {selectedDev.portfolio && (
                    <a href={selectedDev.portfolio} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-black hover:border-black hover:bg-black hover:text-white transition-all group col-span-2">
                      <Globe className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="text-[11px] text-gray-400 group-hover:text-white/60 leading-none">Portfolio</p>
                        <p className="text-xs font-semibold mt-0.5">prodhosh.netlify.app</p>
                      </div>
                    </a>
                  )}
                </div>
              ) : null}

              {/* Bio */}
              {selectedDev.about ? (
                <>
                  <div className="border-t border-gray-100 pt-5 mb-6">
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium mb-2">About</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selectedDev.about}</p>
                  </div>
                </>
              ) : (
                <div className="pb-8">
                  <p className="text-sm text-gray-400 italic">Details coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

