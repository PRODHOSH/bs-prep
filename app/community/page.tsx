"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Heart, MessageCircle, ThumbsUp, Shield, AlertOctagon, Users, Ban } from "lucide-react"

export default function CommunityGuidelinesPage() {
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#3e3098]/5 via-[#51b206]/5 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <Users className="w-8 h-8 text-[#3e3098]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Community Guidelines
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Building a supportive and respectful learning environment together
            </p>
          </div>

          {/* Our Values */}
          <div
            ref={section1.ref}
            className={`mb-12 transition-all duration-700 ${
              section1.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-gradient-to-br from-[#3e3098] to-[#51b206] rounded-2xl p-8 shadow-lg text-white">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8" />
                <h2 className="text-3xl font-bold">Our Core Values</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                  <h3 className="font-bold text-xl mb-2">🤝 Respect</h3>
                  <p className="text-white/90">Treat everyone with dignity and kindness</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                  <h3 className="font-bold text-xl mb-2">📚 Learning First</h3>
                  <p className="text-white/90">Focus on education and growth</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                  <h3 className="font-bold text-xl mb-2">🌟 Inclusivity</h3>
                  <p className="text-white/90">Welcome and support all learners</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
                  <h3 className="font-bold text-xl mb-2">💡 Collaboration</h3>
                  <p className="text-white/90">Help each other succeed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Be Respectful */}
          <div
            ref={section2.ref}
            className={`mb-12 transition-all duration-700 delay-100 ${
              section2.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <ThumbsUp className="w-6 h-6 text-[#51b206]" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Be Respectful & Kind</h2>
              </div>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed">
                  Our community thrives when everyone feels welcome and valued. We expect all members to:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Use respectful language</p>
                      <p className="text-sm mt-1">Communicate professionally and courteously at all times</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Be patient with others</p>
                      <p className="text-sm mt-1">Everyone learns at their own pace. Offer support, not judgment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Provide constructive feedback</p>
                      <p className="text-sm mt-1">Focus on helping others improve, not criticizing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Respect different perspectives</p>
                      <p className="text-sm mt-1">Value diverse viewpoints and learning approaches</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contribute Positively */}
          <div
            ref={section3.ref}
            className={`mb-12 transition-all duration-700 delay-200 ${
              section3.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-6 h-6 text-[#3e3098]" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contribute Positively</h2>
              </div>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed">Help build a thriving learning community by:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-[#51b206] text-lg">→</span>
                    <span><strong className="text-slate-900 dark:text-white">Sharing quality content:</strong> Post helpful resources, notes, and study materials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#51b206] text-lg">→</span>
                    <span><strong className="text-slate-900 dark:text-white">Answering questions:</strong> Help fellow students with their doubts and queries</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#51b206] text-lg">→</span>
                    <span><strong className="text-slate-900 dark:text-white">Participating actively:</strong> Engage in discussions and collaborative learning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#51b206] text-lg">→</span>
                    <span><strong className="text-slate-900 dark:text-white">Giving credit:</strong> Always attribute sources and acknowledge contributors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#51b206] text-lg">→</span>
                    <span><strong className="text-slate-900 dark:text-white">Reporting issues:</strong> Help us maintain quality by flagging inappropriate content</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Zero Tolerance */}
          <div
            ref={section4.ref}
            className={`mb-12 transition-all duration-700 delay-300 ${
              section4.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Ban className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Zero Tolerance Policy</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                The following behaviors are strictly prohibited and will result in immediate action:
              </p>
              <div className="grid gap-3">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-600">
                  <p className="font-semibold text-red-800 dark:text-red-300 mb-1">✗ Harassment & Bullying</p>
                  <p className="text-sm text-red-700 dark:text-red-400">Any form of intimidation, threats, or persistent unwanted contact</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-600">
                  <p className="font-semibold text-red-800 dark:text-red-300 mb-1">✗ Hate Speech & Discrimination</p>
                  <p className="text-sm text-red-700 dark:text-red-400">Content targeting race, religion, gender, sexuality, or any protected characteristic</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-600">
                  <p className="font-semibold text-red-800 dark:text-red-300 mb-1">✗ Plagiarism & Cheating</p>
                  <p className="text-sm text-red-700 dark:text-red-400">Sharing exam answers, copying content without attribution, or academic dishonesty</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-600">
                  <p className="font-semibold text-red-800 dark:text-red-300 mb-1">✗ Spam & Self-Promotion</p>
                  <p className="text-sm text-red-700 dark:text-red-400">Excessive promotional content, advertisements, or irrelevant links</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-600">
                  <p className="font-semibold text-red-800 dark:text-red-300 mb-1">✗ Inappropriate Content</p>
                  <p className="text-sm text-red-700 dark:text-red-400">Adult content, violence, illegal activities, or harmful material</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Integrity */}
          <div
            ref={section5.ref}
            className={`mb-12 transition-all duration-700 delay-400 ${
              section5.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-[#3e3098]" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Integrity</h2>
              </div>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed">
                  We are committed to maintaining high standards of academic honesty:
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-900">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>Use this platform for learning and understanding, not for cheating</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>Do not share ongoing exam questions or assignment solutions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>Always cite your sources when sharing content</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>Respect copyright and intellectual property rights</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Enforcement */}
          <div
            ref={section6.ref}
            className={`mb-12 transition-all duration-700 delay-500 ${
              section6.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <AlertOctagon className="w-6 h-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Enforcement & Consequences</h2>
              </div>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed">
                  Violations of these guidelines may result in:
                </p>
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                    <p className="font-semibold text-amber-900 dark:text-amber-300">1. Warning</p>
                    <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">First-time minor violations</p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                    <p className="font-semibold text-amber-900 dark:text-amber-300">2. Temporary Suspension</p>
                    <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">Repeated violations or moderate infractions</p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                    <p className="font-semibold text-amber-900 dark:text-amber-300">3. Permanent Ban</p>
                    <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">Severe violations or repeated offenses</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mt-4">
                  We review each case individually and may take action at our discretion. Appeals can be submitted to 
                  moderation@iitmbs.com within 14 days of any enforcement action.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-[#3e3098] to-[#51b206] rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Together, We Build a Better Community</h3>
            <p className="mb-6">Report violations or ask questions at community@iitmbs.com</p>
            <p className="text-sm text-white/80">Thank you for being a respectful and contributing member!</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
