"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { FileText, Users, Shield, AlertTriangle, Scale, Globe } from "lucide-react"

export default function TermsPage() {
  const section1 = useScrollAnimation()
  const section2 = useScrollAnimation()
  const section3 = useScrollAnimation()
  const section4 = useScrollAnimation()
  const section5 = useScrollAnimation()
  const section6 = useScrollAnimation()

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />
      
      <div className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#51b206]/5 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <FileText className="w-8 h-8 text-[#51b206]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Terms & Conditions
            </h1>
            <p className="text-lg text-black/70">
              Last updated: January 4, 2026
            </p>
          </div>

          {/* Acceptance of Terms */}
          <div
            ref={section1.ref}
            className={`mb-12 transition-all duration-700 ${
              section1.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-black mb-4">Acceptance of Terms</h2>
              <p className="text-black/70 leading-relaxed">
                By accessing and using the IITM BS Learning Platform, you accept and agree to be bound by the terms and 
                provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div
            ref={section2.ref}
            className={`mb-12 transition-all duration-700 delay-100 ${
              section2.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[#3e3098]" />
                <h2 className="text-2xl font-bold text-black">User Accounts</h2>
              </div>
              <div className="space-y-4 text-black/70">
                <p className="leading-relaxed">
                  When you create an account with us, you must provide accurate and complete information. You are responsible for:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-[#51b206] mt-1">✓</span>
                    <span>Maintaining the security of your account credentials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#51b206] mt-1">✓</span>
                    <span>All activities that occur under your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#51b206] mt-1">✓</span>
                    <span>Notifying us immediately of any unauthorized access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#51b206] mt-1">✓</span>
                    <span>Ensuring your account information remains accurate and up-to-date</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acceptable Use */}
          <div
            ref={section3.ref}
            className={`mb-12 transition-all duration-700 delay-200 ${
              section3.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-[#51b206]" />
                <h2 className="text-2xl font-bold text-black">Acceptable Use Policy</h2>
              </div>
              <p className="text-black/70 leading-relaxed mb-4">
                You agree not to use the platform for any purpose that is:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-800 dark:text-red-300">× Unlawful or fraudulent</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-800 dark:text-red-300">× Harmful or abusive</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-800 dark:text-red-300">× Infringing intellectual property</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-800 dark:text-red-300">× Distributing malware</p>
                </div>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div
            ref={section4.ref}
            className={`mb-12 transition-all duration-700 delay-300 ${
              section4.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-[#3e3098]" />
                <h2 className="text-2xl font-bold text-black">Intellectual Property Rights</h2>
              </div>
              <div className="space-y-4 text-black/70">
                <p className="leading-relaxed">
                  The platform and its original content, features, and functionality are owned by IITM BS Learning and are 
                  protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                  <h3 className="font-semibold text-black mb-3">Content Usage Rights:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="text-[#51b206]">✓</span>
                      <span>Personal educational use only</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#51b206]">✓</span>
                      <span>No redistribution without permission</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#51b206]">✓</span>
                      <span>Proper attribution required for shared content</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div
            ref={section5.ref}
            className={`mb-12 transition-all duration-700 delay-400 ${
              section5.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-[#51b206]" />
                <h2 className="text-2xl font-bold text-black">Limitation of Liability</h2>
              </div>
              <p className="text-black/70 leading-relaxed mb-4">
                To the maximum extent permitted by law, IITM BS Learning shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, or any loss of profits or revenues.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>Important:</strong> The platform is provided "as is" without warranties of any kind. 
                  We do not guarantee uninterrupted or error-free service.
                </p>
              </div>
            </div>
          </div>

          {/* Governing Law */}
          <div
            ref={section6.ref}
            className={`mb-12 transition-all duration-700 delay-500 ${
              section6.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-[#3e3098]" />
                <h2 className="text-2xl font-bold text-black">Governing Law</h2>
              </div>
              <p className="text-black/70 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of India, without regard to 
                its conflict of law provisions. Any disputes arising from these terms will be subject to the exclusive 
                jurisdiction of the courts in Chennai, Tamil Nadu.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-[#51b206] to-[#3e3098] rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Questions About Our Terms?</h3>
            <p className="mb-6">Contact us at legal@iitmbs.com</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
