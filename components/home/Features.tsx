"use client";

import { motion } from "framer-motion";
import { CheckSquare, MonitorPlay, Code2, Users } from "lucide-react";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Features() {
  return (
    <section className="bg-transparent text-black py-20 sm:py-32 px-5 sm:px-8 md:px-12 font-black uppercase">
      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* Dashboard Feature */}
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="order-2 lg:order-1 lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-8 text-[#0a192f] bg-[#0a192f]/10">
              <MonitorPlay className="w-4 h-4" /> LEARNING DASHBOARD
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl tracking-tight mb-6 leading-[1.1]">
              TRACK YOUR <br />
              <span className="text-[#0a192f]">PROGRESS</span>
            </h2>
            <div className="max-w-xl mb-10">
              <p className="text-sm sm:text-base font-bold opacity-60 uppercase leading-relaxed text-black">
                Enrolled courses, GPA predictions, mentor sessions, and leaderboard — all in one clean view. Stay on top of your IITM BS journey.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 uppercase font-bold text-sm text-black/70">
              {["GPA calculator & grade predictor", "Enrolled courses & live sessions", "Community leaderboard & profile"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0a192f]/10 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-3 h-3 text-[#0a192f]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="order-1 lg:order-2 lg:col-span-7 rounded-3xl shadow-2xl bg-white aspect-[16/10] overflow-hidden ring-1 ring-black/5"
          >
            <video
              src="/videos/dashboard.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Compiler Feature */}
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="lg:col-span-7 rounded-3xl shadow-2xl bg-white aspect-[16/10] overflow-hidden ring-1 ring-black/5"
          >
            <video
              src="/videos/compiler.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-8 text-[#0a192f] bg-[#0a192f]/10">
              <Code2 className="w-4 h-4" /> IN-BROWSER COMPILER
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl tracking-tight mb-6 leading-[1.1]">
              PRACTICE <br />
              <span className="text-[#0a192f]">CODE</span>
            </h2>
            <div className="max-w-xl mb-10">
              <p className="text-sm sm:text-base font-bold opacity-60 uppercase leading-relaxed text-black">
                No installs, no setup. Python, Java, C, C++ — write, run, and share with a single link right from your browser.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 uppercase font-bold text-sm text-black/70">
              {["Python, Java, C & C++ support", "Share code via shareable link", "Multi-file editor with tabs"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0a192f]/10 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-3 h-3 text-[#0a192f]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Live Classes Feature */}
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="order-2 lg:order-1 lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-8 text-[#0a192f] bg-[#0a192f]/10">
              <Users className="w-4 h-4" /> LIVE SESSIONS
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl tracking-tight mb-6 leading-[1.1]">
              LEARN WITH <br />
              <span className="text-[#0a192f]">EXPERT MENTORS</span>
            </h2>
            <div className="max-w-xl mb-10">
              <p className="text-sm sm:text-base font-bold opacity-60 uppercase leading-relaxed text-black">
                Weekly sessions per subject in Tamil — ask questions, clear doubts, and stay on track for the qualifier.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 uppercase font-bold text-sm text-black/70">
              {["Weekly sessions per subject", "Live Q&A and doubt clearing", "Recordings available after class"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0a192f]/10 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-3 h-3 text-[#0a192f]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="order-1 lg:order-2 lg:col-span-7 rounded-3xl shadow-2xl bg-white aspect-[16/10] overflow-hidden ring-1 ring-black/5"
          >
            <video
              src="/videos/classes.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
