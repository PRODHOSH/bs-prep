"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Shield, Eye, Lock, Server, UserCheck, AlertCircle } from "lucide-react"

export default function PrivacyPolicyPage() {
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#3e3098]/5 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <Shield className="w-8 h-8 text-[#3e3098]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Last updated: January 4, 2026
            </p>
          </div>

          {/* Introduction */}
          <div
            ref={section1.ref}
            className={`mb-12 transition-all duration-700 ${
              section1.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Introduction</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Welcome to IITM BS Learning Platform. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit our platform and 
                tell you about your privacy rights and how the law protects you.
              </p>
            </div>
          </div>

          {/* Information We Collect */}
          <div
            ref={section2.ref}
            className={`mb-12 transition-all duration-700 delay-100 ${
              section2.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-[#51b206]" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Name and email address</li>
                    <li>Profile information (student ID, course enrollment)</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Learning progress and course completion</li>
                    <li>Quiz scores and performance analytics</li>
                    <li>Platform interaction patterns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div
            ref={section3.ref}
            className={`mb-12 transition-all duration-700 delay-200 ${
              section3.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-6 h-6 text-[#3e3098]" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How We Use Your Information</h2>
              </div>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="text-[#51b206] mt-1">✓</span>
                  <span>To provide and maintain our educational services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#51b206] mt-1">✓</span>
                  <span>To personalize your learning experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#51b206] mt-1">✓</span>
                  <span>To communicate important updates and notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#51b206] mt-1">✓</span>
                  <span>To improve our platform and develop new features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#51b206] mt-1">✓</span>
                  <span>To ensure platform security and prevent fraud</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div
            ref={section4.ref}
            className={`mb-12 transition-all duration-700 delay-300 ${
              section4.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-[#51b206]" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data Security</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                We have implemented appropriate security measures to prevent your personal data from being accidentally lost, 
                used, or accessed in an unauthorized way. We use industry-standard encryption and security protocols including:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="text-[#3e3098] mt-1">•</span>
                  <span>SSL/TLS encryption for data transmission</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#3e3098] mt-1">•</span>
                  <span>Secure authentication with Supabase</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#3e3098] mt-1">•</span>
                  <span>Regular security audits and updates</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Third-Party Services */}
          <div
            ref={section5.ref}
            className={`mb-12 transition-all duration-700 delay-400 ${
              section5.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-6 h-6 text-[#3e3098]" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Third-Party Services</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                We use the following trusted third-party services to operate our platform:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-white">Supabase</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Authentication and database services</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-white">Vercel Analytics</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Anonymous usage analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div
            ref={section6.ref}
            className={`mb-12 transition-all duration-700 delay-500 ${
              section6.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-[#51b206]" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Rights</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="text-[#3e3098] font-bold">→</span>
                  <span>Access your personal data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#3e3098] font-bold">→</span>
                  <span>Correct inaccurate data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#3e3098] font-bold">→</span>
                  <span>Request deletion of your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#3e3098] font-bold">→</span>
                  <span>Object to processing of your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#3e3098] font-bold">→</span>
                  <span>Withdraw consent at any time</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-[#3e3098] to-[#51b206] rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Questions About Privacy?</h3>
            <p className="mb-6">Contact us at privacy@iitmbs.com</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
