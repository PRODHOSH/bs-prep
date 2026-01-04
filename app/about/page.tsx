
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Target, Heart, Award, Sparkles } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export default function AboutPage() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation()
  const { ref: missionRef, isVisible: missionVisible } = useScrollAnimation()
  const { ref: visionRef, isVisible: visionVisible } = useScrollAnimation()
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation()
  const { ref: teamRef, isVisible: teamVisible } = useScrollAnimation()

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={heroRef}
            className={`text-center space-y-6 transition-all duration-1000 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white">
              About IITM BS Platform
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Empowering IITM BS students with innovative learning tools, community support, and expert guidance to excel in their academic journey.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={missionRef}
            className={`max-w-4xl mx-auto transition-all duration-1000 delay-150 ${
              missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl mb-6">
                <BookOpen className="w-8 h-8 text-white dark:text-slate-900" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Our Story</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                This platform was born from a simple observation: IITM BS students needed a dedicated space to practice, learn, and grow together. What started as a small initiative by fellow students has evolved into a comprehensive learning ecosystem serving thousands of learners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div
              ref={visionRef}
              className={`transition-all duration-1000 delay-200 ${
                visionVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
            >
              <Card className="h-full bg-white/5 dark:bg-white/5 backdrop-blur-sm border-slate-200/20 dark:border-slate-700/30 hover:shadow-lg transition-shadow">
                <CardContent className="pt-12 pb-12 px-8">
                  <div className="flex items-center justify-center w-14 h-14 bg-slate-900 dark:bg-white rounded-xl mb-6">
                    <Target className="w-7 h-7 text-white dark:text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    To democratize access to quality education resources and create an inclusive learning environment where every IITM BS student can reach their full potential through peer collaboration, expert mentorship, and innovative practice tools.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div
              className={`transition-all duration-1000 delay-300 ${
                visionVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
            >
              <Card className="h-full bg-white/5 dark:bg-white/5 backdrop-blur-sm border-slate-200/20 dark:border-slate-700/30 hover:shadow-lg transition-shadow">
                <CardContent className="pt-12 pb-12 px-8">
                  <div className="flex items-center justify-center w-14 h-14 bg-slate-900 dark:bg-white rounded-xl mb-6">
                    <Sparkles className="w-7 h-7 text-white dark:text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Vision</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    To become the most trusted and comprehensive learning companion for IITM BS students, fostering a vibrant community where knowledge flows freely, students support each other, and academic excellence becomes accessible to all.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={valuesRef}
            className={`text-center mb-16 transition-all duration-1000 ${
              valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Community First",
                description: "We believe in the power of peer learning and building strong connections among students.",
              },
              {
                icon: Heart,
                title: "Student Welfare",
                description: "Every decision we make prioritizes the well-being and success of our student community.",
              },
              {
                icon: Award,
                title: "Excellence",
                description: "We strive for the highest quality in content, features, and support we provide.",
              },
            ].map((value, i) => (
              <div
                key={i}
                className={`transition-all duration-1000 delay-${(i + 1) * 100} ${
                  valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <Card className="bg-white/5 dark:bg-white/5 backdrop-blur-sm border-slate-200/20 dark:border-slate-700/30 hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-8 pb-8 px-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 dark:bg-white rounded-xl mb-6">
                      <value.icon className="w-7 h-7 text-white dark:text-slate-900" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{value.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{value.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={teamRef}
            className={`transition-all duration-1000 ${
              teamVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Our Impact</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">Making a difference in the learning journey</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "2,500+", label: "Active Students" },
                { value: "50,000+", label: "Questions Practiced" },
                { value: "160+", label: "Question Papers" },
                { value: "95%", label: "Satisfaction Rate" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-white/5 dark:bg-white/5 backdrop-blur-sm border-slate-200/20 dark:border-slate-700/30">
            <CardContent className="pt-8 pb-8 px-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Important Note:</strong> This platform is independently run by students and is not an official platform of IIT Madras or any IIT institution. We are a community-driven initiative created to support fellow IITM BS students in their learning journey.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
