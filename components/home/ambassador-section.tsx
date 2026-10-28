"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";

export function AmbassadorSection() {
  return (
    <section className="py-24 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* The Premium Highlight Card */}
        <div className="relative w-full rounded-[2rem] md:rounded-[3rem] bg-gradient-to-b from-[#f8f9fa] to-white border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-visible">
          
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center p-8 md:p-12 lg:p-16 lg:pb-8">
            
            {/* Left Content */}
            <div className="space-y-8 z-20 pb-8 lg:pb-0">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a192f]/5 border border-[#0a192f]/10 text-[#0a192f] text-sm font-bold tracking-wide">
                <Trophy className="w-4 h-4" />
                <span>Applications closed</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                Become a <br />
                <span className="text-[#0a192f]">Student Ambassador</span>
              </h2>
              
              <p className="text-lg md:text-xl text-black/60 max-w-lg leading-relaxed font-medium">
                Represent BSPrep at your campus. Build leadership skills, get exclusive perks, and help your peers excel in the IITM BS Degree. 
              </p>
              
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-5">
                <span
                  aria-disabled="true"
                  className="inline-flex shrink-0 cursor-not-allowed items-center gap-2 whitespace-nowrap rounded-full bg-black/5 px-8 py-4 font-bold text-black/40"
                >
                  Applications closed
                </span>
                <p className="max-w-xs text-sm leading-relaxed text-black/55">
                  Thank you to everyone who applied. The next round will be announced on{" "}
                  <Link
                    href="https://instagram.com/bsprep.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#0a192f] underline underline-offset-2"
                  >
                    Instagram
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Right SVG - Designed to "break out" of the card bounds on desktop */}
            <div className="relative w-full flex justify-center items-center h-full z-30 mt-4 lg:mt-0">
               <div className="absolute inset-0 bg-[#0a192f]/5 blur-3xl rounded-full scale-75" />
               <img 
                  src="/leader.svg" 
                  alt="Ambassador Program"
                  className="relative z-10 w-full max-w-[400px] lg:scale-125 lg:origin-bottom lg:-translate-y-12 drop-shadow-xl"
               />
            </div>
            
          </div>

          {/* Integrated Sponsor Bar at the bottom of the card */}
          <div className="relative z-20 border-t border-black/5 bg-black/[0.02] rounded-b-[2rem] md:rounded-b-[3rem] px-8 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold uppercase tracking-widest text-black/40 shrink-0">Supported by</p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-6 md:gap-10 items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               <img src="/sponsors/unstop.png" alt="Unstop" className="h-6 md:h-8 w-auto object-contain" />
               <img src="/sponsors/truscholar.png" alt="Truscholar" className="h-6 md:h-8 w-auto object-contain" />
               <img src="/sponsors/stickerfever.png" alt="Stickerfever" className="h-6 md:h-8 w-auto object-contain" />
               <img src="/sponsors/xyz.png" alt=".xyz" className="h-5 md:h-7 w-auto object-contain" />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
