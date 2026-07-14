"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const COURSES = [
  { id: "qualifier-math-1", title: "Mathematics for Data Science I", description: "Master functions, limits, derivatives, and their applications.", price: 499, originalPrice: 599 },
  { id: "qualifier-stats-1", title: "Statistics for Data Science I", description: "Learn probability, distributions, and descriptive statistics.", price: 499, originalPrice: 599 },
  { id: "qualifier-computational-thinking", title: "Computational Thinking", description: "Develop problem-solving skills and algorithmic logic.", price: 499, originalPrice: 599 },
  { id: "qualifier-english-1", title: "English I", description: "Improve your technical reading and writing skills.", price: 499, originalPrice: 599 },
  { id: "qualifier-python", title: "Programming in Python", description: "Learn Python from scratch and build real-world applications.", price: 499, originalPrice: 599 },
  { id: "qualifier-java", title: "Programming in Java", description: "Master Object Oriented Programming principles with Java.", price: 499, originalPrice: 599 }
];

export function Courses() {
  return (
    <section className="bg-transparent text-black py-20 sm:py-32 px-5 sm:px-8 md:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariants}
          className="mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-8 text-[#0a192f] bg-[#0a192f]/10">
            TAMIL MEDIUM · FOUNDATIONAL LEVEL
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1] uppercase">
            ACCELERATE YOUR <br />
            <span className="text-[#0a192f]">IITM BS JOURNEY</span>
          </h2>
          <div className="max-w-2xl mb-12">
            <p className="text-sm sm:text-base font-medium normal-case text-black/70 leading-relaxed">
              Master Foundation level courses including Qualifier, Python, and Java with comprehensive Tamil tutorials.
            </p>
          </div>

          {/* Pricing Banner */}
          <div className="rounded-3xl bg-[#0a192f] text-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
            <div className="flex-1 w-full text-center md:text-left border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pr-6 md:pb-0">
               <div className="text-xs font-bold tracking-widest mb-2 text-white/60 uppercase">PER COURSE</div>
               <div className="text-4xl md:text-5xl font-black tracking-tighter">₹499 <span className="text-lg line-through opacity-50 font-medium">₹599</span></div>
            </div>
            <Link href="/courses" className="group flex-1 w-full text-center md:text-left border-b border-white/10 pb-6 md:border-b-0 md:border-r md:pr-6 md:pb-0 relative block">
               <div className="flex items-center justify-center md:justify-start justify-between mb-2">
                 <div className="text-xs font-bold tracking-widest text-white/60 uppercase">CODING BUNDLE (PYTHON+JAVA)</div>
                 <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
               </div>
               <div className="text-4xl md:text-5xl font-black tracking-tighter">₹999 <span className="text-lg line-through opacity-50 font-medium">₹1199</span></div>
            </Link>
            <Link href="/courses" className="group flex-1 w-full text-center md:text-left relative block">
               <div className="flex items-center justify-center md:justify-start justify-between mb-2">
                 <div className="text-xs font-bold tracking-widest text-white/60 uppercase">QUALIFIER BUNDLE (4 SUBJECTS)</div>
                 <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
               </div>
               <div className="text-4xl md:text-5xl font-black tracking-tighter">₹1799 <span className="text-lg line-through opacity-50 font-medium">₹1999</span></div>
            </Link>
          </div>
        </motion.div>

        {/* Course Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {COURSES.map((course) => (
            <motion.div key={course.id} variants={fadeUpVariants}>
              <Link href={`/courses/${course.id}`} className="group block h-full">
                <div className="bg-white rounded-3xl p-8 h-full flex flex-col hover:-translate-y-2 transition-all duration-300 shadow-lg shadow-black/5 ring-1 ring-black/5 hover:shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[10px] font-bold tracking-widest text-[#0a192f] bg-[#0a192f]/10 px-3 py-1 rounded-full">IITM BS</span>
                    <ArrowUpRight className="w-5 h-5 text-black/30 group-hover:text-[#0a192f] transition-colors" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight leading-snug mb-3 flex-1 uppercase">{course.title}</h3>
                  <p className="text-xs tracking-wide text-black/60 normal-case font-medium leading-relaxed mb-6">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-black/5 pt-6 mt-auto">
                    <span className="text-xs tracking-widest font-black text-black/40">PRICE</span>
                    <div className="text-xl tracking-tighter text-[#0a192f]">
                      <span className="text-sm line-through opacity-50 mr-2 text-black font-medium">₹{course.originalPrice}</span>
                      ₹{course.price}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10px" }}
          variants={fadeUpVariants}
          className="mt-16 text-center"
        >
          <Link href="/courses" className="inline-flex items-center gap-2 bg-[#0a192f] text-white px-8 py-5 text-sm font-bold uppercase tracking-widest hover:bg-[#112a52] transition-all rounded-full group">
            VIEW ALL COURSES
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
