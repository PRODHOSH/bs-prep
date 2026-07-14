"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users, TrendingUp, BookOpen } from "lucide-react";
import Link from "next/link";
import { AnimatedCounter } from "@/components/animated-counter";
import dynamic from "next/dynamic";

const CardSwap = dynamic(
  () => import("@/components/card-swap"),
  { ssr: false, loading: () => <div className="h-[400px] bg-white rounded-3xl shadow-xl" /> }
);
const SwapCard = dynamic(
  () => import("@/components/card-swap").then((m) => ({ default: m.Card })),
  { ssr: false }
);

export function Hero() {
  return (
    <div className="bg-transparent text-black relative">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 pt-6 pb-10 md:pt-10 md:pb-12">
        <div className="grid lg:grid-cols-[45%_55%] gap-8 lg:gap-2 items-center">
          
          {/* Left — heading */}
          <div className="space-y-8 lg:pr-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-black"
            >
              Learn IITM BS <br />
              <span className="text-[#0a192f]">With Mentors</span> <br />
              By Your Side
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-md text-sm md:text-base font-medium normal-case tracking-normal text-black/70 leading-relaxed"
            >
              Expert-led learning in Tamil, community support, and peer mentorship for IITM BS students. Master concepts, solve doubts, and ace your exams.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link 
                href="https://docs.google.com/forms/d/e/1FAIpQLSfyhCw9tPgKmMWYPhjV6Kzixp2RdYEi-x7JPL6JUxoLwbnB_g/viewform" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-[#0a192f] text-white px-6 py-3 text-sm font-bold tracking-wide hover:bg-[#112a52] transition-all duration-300 rounded-full"
              >
                Join Community
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center bg-white text-black ring-1 ring-black/10 px-6 py-3 text-sm font-bold tracking-wide hover:bg-black/5 transition-all duration-300 rounded-full shadow-sm"
              >
                Sign In
              </Link>
            </motion.div>
          </div>

          {/* Right: Card Stack */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative h-[250px] md:h-[400px] w-full flex items-center justify-center lg:justify-end mt-8 md:mt-0 hidden sm:flex lg:-mr-4"
          >
            <CardSwap
              width={640}
              height={400}
              cardDistance={40}
              verticalDistance={50}
              delay={3500}
              pauseOnHover={true}
            >
              <SwapCard>
                <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">
                  <img src="/hero-section/image-1.png" alt="Mathematics for Data Science I" className="w-full h-full object-cover" />
                </div>
              </SwapCard>
              <SwapCard>
                <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">
                  <img src="/hero-section/image-2.png" alt="Statistics for Data Science I" className="w-full h-full object-cover" />
                </div>
              </SwapCard>
              <SwapCard>
                <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">
                  <img src="/hero-section/image-3.png" alt="Computational Thinking" className="w-full h-full object-cover" />
                </div>
              </SwapCard>
            </CardSwap>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 lg:mt-6"
        >
          {[
            { label: "Active Students", value: 3000, suffix: "+", icon: Users },
            { label: "Expert Mentors", value: 15, suffix: "+", icon: TrendingUp },
            { label: "Study Materials", value: 500, suffix: "+", icon: BookOpen },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 flex items-center gap-6 shadow-xl shadow-black/5 hover:-translate-y-1 transition-all duration-300 ring-1 ring-black/5">
                <div className="w-12 h-12 rounded-full bg-[#0a192f]/10 text-[#0a192f] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black text-black tracking-tight flex items-baseline">
                    <AnimatedCounter end={stat.value} duration={2000} />
                    <span>{stat.suffix}</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-black/50 mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
