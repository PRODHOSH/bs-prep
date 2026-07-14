"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "What is BSPrep?",
    answer: "BSPrep is a community-driven learning platform designed to help IITM BS students prepare better through structured courses, quizzes, and mentor support."
  },
  {
    question: "Are the study materials in Tamil?",
    answer: "Yes! Our core mission is to provide high-quality video lectures, mentorship sessions, and study materials in Tamil to help you grasp complex concepts easily."
  },
  {
    question: "How does the GPA Predictor work?",
    answer: "The GPA Predictor tool uses your current grades and target CGPA to calculate exactly what marks you need in upcoming exams to achieve your goals."
  },
  {
    question: "Are the live mentor sessions recorded?",
    answer: "Absolutely. All weekly live mentorship sessions and doubt-clearing classes are recorded and available in your dashboard for later viewing."
  },
  {
    question: "Is BSPrep officially affiliated with IIT Madras?",
    answer: "No, BSPrep is not officially affiliated with IIT Madras. It is an independent, student-led initiative built to support the community."
  }
];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Faq() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <section className="bg-transparent text-black py-20 sm:py-32 px-5 sm:px-8 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariants}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-8 bg-[#0a192f]/10 text-[#0a192f] uppercase">
            <MessageCircleQuestion className="w-4 h-4" /> FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1] uppercase">
            FREQUENTLY ASKED <br />
            <span className="text-[#0a192f]">QUESTIONS</span>
          </h2>
          <p className="text-sm sm:text-base font-medium text-black/60 leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about BSPrep.
          </p>
        </motion.div>

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
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeUpVariants}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ring-1 ring-black/5 bg-white text-black hover:shadow-md ${openFAQ === index ? "shadow-md" : "shadow-sm"}`}
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left"
              >
                <h3 className="text-base md:text-xl font-black tracking-tight pr-8 uppercase">{faq.question}</h3>
                <ChevronDown
                  className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 text-black/50 ${
                    openFAQ === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFAQ === index ? "max-h-96" : "max-h-0"}`}>
                <div className="p-6 md:p-8 pt-0 text-sm md:text-base normal-case font-medium text-black/70 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10px" }}
          variants={fadeUpVariants}
          className="mt-16 text-center bg-white p-12 rounded-3xl shadow-xl ring-1 ring-black/5"
        >
          <p className="text-xl md:text-2xl tracking-tight mb-2">STILL HAVE QUESTIONS?</p>
          <p className="text-sm font-bold uppercase mb-8 text-black/50">Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <Link href="/support" className="inline-flex items-center gap-2 bg-[#0a192f] text-white px-8 py-5 text-sm tracking-widest font-bold hover:bg-[#112a52] transition-all rounded-full">
            CONTACT SUPPORT
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
