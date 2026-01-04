import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { StaggerTestimonials } from "@/components/stagger-testimonials"
import { AnimatedCounter } from "@/components/animated-counter"
import { BookOpen, Users, TrendingUp, CheckCircle, Zap, Award, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen text-foreground">
      <Navbar isAuthenticated={false} />

      <section className="relative overflow-hidden pt-20 md:pt-32 pb-20 md:pb-40">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="block text-slate-900 dark:text-white mb-3">Learn IITM BS</span>
              <span className="block text-slate-900 dark:text-white">
                With Mentors by Your Side
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Expert-led learning, community support, and peer mentorship for IITM BS students. Master concepts, solve
              doubts, and ace your exams with our comprehensive platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/sign-up">
                <Button className="group bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-8 py-6 text-lg rounded-full transition-all duration-300 shadow-md hover:shadow-lg font-medium">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-6 text-lg rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white transition-all duration-300 font-medium">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-20">
            {[
              { label: "Active Students", value: 2500, suffix: "+" },
              { label: "Expert Mentors", value: 150, suffix: "+" },
              { label: "Study Materials", value: 500, suffix: "+" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 cursor-default border border-slate-200/20 dark:border-slate-700/30"
              >
                <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2500} />
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Three simple steps to transform your learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Access Materials",
                description: "Get comprehensive notes and video lectures from experienced mentors",
                icon: BookOpen,
              },
              {
                number: "02",
                title: "Connect with Mentors",
                description: "Request personalized guidance and get doubts solved in real-time",
                icon: Users,
              },
              {
                number: "03",
                title: "Track Progress",
                description: "Practice with quizzes and compete on the leaderboard",
                icon: TrendingUp,
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/20 dark:border-slate-700/30 hover:border-slate-300/30 dark:hover:border-slate-600/40 transition-all duration-300 hover:shadow-lg"
              >
                <div className="text-5xl font-bold text-slate-200 dark:text-slate-700 mb-4">
                  {step.number}
                </div>
                <step.icon className="w-10 h-10 text-slate-900 dark:text-white mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Why Choose IITM Learning?</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Everything you need to succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Study Materials", desc: "500+ curated notes and resources" },
              { icon: CheckCircle, title: "Live Classes", desc: "Weekly mentoring sessions" },
              { icon: Zap, title: "Practice Quizzes", desc: "200+ questions with solutions" },
              { icon: Award, title: "Certifications", desc: "Earn recognition badges" },
              { icon: Users, title: "Community", desc: "Connect with 2500+ students" },
              { icon: TrendingUp, title: "Analytics", desc: "Track your growth in detail" },
            ].map((feature, i) => (
              <Card
                key={i}
                className="bg-white/5 dark:bg-white/5 backdrop-blur-sm border-slate-200/20 dark:border-slate-700/30 hover:border-slate-300/30 dark:hover:border-slate-600/40 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="pt-8 pb-6 px-6">
                  <feature.icon className="w-8 h-8 text-slate-900 dark:text-white mb-4" />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <StaggerTestimonials />

      <section className="relative py-20 md:py-28">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-12 md:p-16 border border-slate-200/20 dark:border-slate-700/30 shadow-lg">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of IITM BS students accelerating their journey with expert mentorship and community support.
          </p>
          <Link href="/auth/sign-up">
            <Button className="group bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-12 py-7 text-lg rounded-full transition-all duration-300 shadow-md hover:shadow-lg font-medium">
              Get Started Now – It's Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
