"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Cta({ setShowLogin }: { setShowLogin: Dispatch<SetStateAction<boolean>> }) {
  return (
    <section className="bg-transparent text-black py-24 sm:py-32 px-5 sm:px-8 md:px-12 font-black uppercase text-center overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10 bg-[#0a192f] rounded-[3rem] p-12 md:p-24 shadow-2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariants}
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl tracking-tight mb-8 leading-[1.1] text-white">
            READY TO TRANSFORM <br />
            <span className="text-white/70">YOUR LEARNING?</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg opacity-80 uppercase font-bold max-w-2xl mx-auto mb-12 text-white/80">
            Join thousands of IITM BS students accelerating their journey with expert mentorship and community support.
          </p>
          
          <button
            onClick={() => setShowLogin(true)}
            className="inline-flex items-center gap-2 bg-white text-[#0a192f] px-10 py-5 text-sm md:text-base font-bold tracking-widest hover:bg-gray-100 hover:scale-105 transition-all rounded-full shadow-xl group"
          >
            GET STARTED
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-12 text-xs opacity-50 tracking-widest font-bold text-white">
            Want to support the initiative?{" "}
            <a href="https://rzp.io/rzp/support-bsprep" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4 hover:opacity-100 transition-opacity">
              Donate to BSPREP
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
