"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AboutSection() {
  return (
    <div className="bg-transparent text-black relative border-t border-black/5">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left — Text */}
          <div className="space-y-6 lg:pr-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest mb-8 text-[#0a192f] bg-[#0a192f]/10 uppercase">
                About Us
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-black leading-[1.1]">
                <span className="text-black/70">By Students,</span> <br />
                For Students.
              </h3>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="pl-5 border-l-2 border-black/10"
            >
              <p className="max-w-lg text-base md:text-lg font-medium text-black/60 leading-relaxed">
                We are on a mission to make the IIT Madras BS Degree accessible, engaging, and deeply collaborative. BSPrep is an independent ecosystem built to help you thrive through peer mentorship and structured preparation.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="pt-4"
            >
              <Link 
                href="https://docs.google.com/forms/d/e/1FAIpQLSfyhCw9tPgKmMWYPhjV6Kzixp2RdYEi-x7JPL6JUxoLwbnB_g/viewform" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-[#0a192f] text-white px-6 py-3 text-sm font-bold tracking-wide hover:bg-[#112a52] transition-colors rounded-full"
              >
                Join the Community
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right — Static Image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-square max-w-xl mx-auto"
          >
            <Image 
              src="/team.svg" 
              alt="Team collaboration" 
              fill 
              className="object-contain"
            />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
