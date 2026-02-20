"use client"

import Link from "next/link"
import { Mail, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  const footerLinks = {
    platform: [
      { name: "About Us", href: "#" },
      { name: "Mentors", href: "#" },
      { name: "Roadmap", href: "#" },
      { name: "Blog", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms & Conditions", href: "/terms" },
      { name: "Disclaimer", href: "/disclaimer" },
      { name: "Community Guidelines", href: "/community" },
    ],
    support: [
      { name: "Contact Us", href: "mailto:support@iitmbs.com" },
      { name: "Report Issue", href: "#" },
      { name: "FAQ", href: "#" },
      { name: "Help Center", href: "#" },
    ],
  }

  return (
    <footer className="bg-[#FEF9E7]/95 backdrop-blur-sm border-t border-[#E5DBC8] mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpeg" 
                alt="IITM BS Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-xl font-bold text-black">IITM BS</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Learn. Grow. Excel. Together.
            </p>
            <p className="text-slate-500 text-xs">
              Community-driven academic support for IIT Madras students.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <Link
                href="#"
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#3e3098] hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#3e3098] hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Github className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#3e3098] hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <div className="animate-on-scroll">
            <h3 className="font-semibold text-black mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-[#3e3098] transition-colors text-sm inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform inline-block">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="animate-on-scroll" style={{ animationDelay: "0.1s" }}>
            <h3 className="font-semibold text-black mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-[#3e3098] transition-colors text-sm inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform inline-block">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="animate-on-scroll" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-semibold text-black mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-[#3e3098] transition-colors text-sm inline-flex items-center group"
                  >
                    {link.name === "Contact Us" && <Mail className="w-4 h-4 mr-2" />}
                    <span className="group-hover:translate-x-1 transition-transform inline-block">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 IITM BS Learning. All rights reserved.
            </p>
            <p className="text-slate-400 text-xs max-w-md text-center md:text-right">
              This platform is not affiliated with IIT Madras. Community-driven academic support only.
            </p>
          </div>
        </div>
      </div>

      {/* Add smooth animation styles */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-on-scroll {
          animation: slideInUp 0.6s ease-out forwards;
        }
      `}</style>
    </footer>
  )
}
