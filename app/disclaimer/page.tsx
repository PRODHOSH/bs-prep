"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { AlertTriangle, Info, Building2, BookOpen, Phone, Mail } from "lucide-react"

export default function DisclaimerPage() {
  const section1 = useScrollAnimation()
  const section2 = useScrollAnimation()
  const section3 = useScrollAnimation()
  const section4 = useScrollAnimation()
  const section5 = useScrollAnimation()

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />
      
      <div className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Disclaimer
            </h1>
            <p className="text-lg text-black/70">
              Important information about our platform and services
            </p>
          </div>

          {/* General Disclaimer */}
          <div
            ref={section1.ref}
            className={`mb-12 transition-all duration-700 ${
              section1.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-8 shadow-sm border-2 border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <h2 className="text-2xl font-bold text-black">General Disclaimer</h2>
              </div>
              <p className="text-black/90 leading-relaxed">
                The information provided by IITM BS Learning Platform on this website is for general informational 
                and educational purposes only. All information on the platform is provided in good faith, however, 
                we make no representation or warranty of any kind, express or implied, regarding the accuracy, 
                adequacy, validity, reliability, availability, or completeness of any information on the platform.
              </p>
            </div>
          </div>

          {/* Not Affiliated */}
          <div
            ref={section2.ref}
            className={`mb-12 transition-all duration-700 delay-100 ${
              section2.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-[#3e3098]" />
                <h2 className="text-2xl font-bold text-black">Not Affiliated with IIT Madras</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-red-800 dark:text-red-300 font-semibold mb-2">Important Notice</p>
                  <p className="text-red-700 dark:text-red-400 text-sm leading-relaxed">
                    This platform is NOT officially affiliated with, endorsed by, or sponsored by the Indian Institute 
                    of Technology Madras (IIT Madras). We are an independent, community-driven learning platform created 
                    by students for students.
                  </p>
                </div>
                <p className="text-black/70 leading-relaxed">
                  All course content, materials, and resources provided on this platform are created and curated by our 
                  community members and mentors. They do not represent the official curriculum or materials of IIT Madras.
                </p>
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div
            ref={section3.ref}
            className={`mb-12 transition-all duration-700 delay-200 ${
              section3.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-[#51b206]" />
                <h2 className="text-2xl font-bold text-black">Educational Content Disclaimer</h2>
              </div>
              <div className="space-y-4 text-black/70">
                <p className="leading-relaxed">
                  While we strive to provide accurate and helpful educational content:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">⚠</span>
                    <div>
                      <strong className="text-black">No Guarantee of Accuracy:</strong>
                      <p className="text-sm mt-1">
                        We cannot guarantee that all information is completely accurate, current, or applicable to your specific situation.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">⚠</span>
                    <div>
                      <strong className="text-black">Supplementary Resource:</strong>
                      <p className="text-sm mt-1">
                        This platform should be used as a supplementary learning resource, not as a replacement for official course materials.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">⚠</span>
                    <div>
                      <strong className="text-black">Personal Responsibility:</strong>
                      <p className="text-sm mt-1">
                        You are solely responsible for verifying information and ensuring its applicability to your academic work.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* No Professional Advice */}
          <div
            ref={section4.ref}
            className={`mb-12 transition-all duration-700 delay-300 ${
              section4.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-black mb-4">No Professional Advice</h2>
              <p className="text-black/70 leading-relaxed mb-4">
                The information on this platform does not constitute professional academic advice. Always consult with your 
                official course instructors, academic advisors, or IIT Madras faculty for:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="font-semibold text-black mb-2">✓ Exam preparation guidance</p>
                  <p className="text-sm text-black/70">Official syllabus and exam patterns</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="font-semibold text-black mb-2">✓ Academic decisions</p>
                  <p className="text-sm text-black/70">Course selection and career advice</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="font-semibold text-black mb-2">✓ Grade concerns</p>
                  <p className="text-sm text-black/70">Official grade disputes and appeals</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="font-semibold text-black mb-2">✓ Policy clarifications</p>
                  <p className="text-sm text-black/70">Official institutional policies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Changes to Disclaimer */}
          <div
            ref={section5.ref}
            className={`mb-12 transition-all duration-700 delay-400 ${
              section5.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-black mb-4">Changes to This Disclaimer</h2>
              <p className="text-black/70 leading-relaxed">
                We may update our disclaimer from time to time. We will notify you of any changes by posting the new 
                disclaimer on this page and updating the "last updated" date. You are advised to review this disclaimer 
                periodically for any changes.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Questions or Concerns?</h3>
                <p>We're here to help clarify any doubts</p>
              </div>
              <div className="flex gap-4">
                <a
                  href="mailto:support@iitmbs.com"
                  className="flex items-center gap-2 bg-white text-amber-600 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
