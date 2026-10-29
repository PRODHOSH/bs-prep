"use client";

import { motion } from "framer-motion";
import { CheckSquare, MonitorPlay, Code2, Calculator } from "lucide-react";
import { useEffect, useRef } from "react";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const VIDEOS = [
  { src: "/videos/dashboard-tour.mp4", poster: "/videos/dashboard-tour.jpg" },
  { src: "/videos/compiler-demo.mp4", poster: "/videos/compiler-demo.jpg" },
  { src: "/videos/gpa-tools.mp4", poster: "/videos/gpa-tools.jpg" },
];

function ForcePlayVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const forcePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Force play immediately
    v.play().catch(() => {});

    // Resume on visibility change (tab focus/blur)
    const onVisibilityChange = () => {
      if (!document.hidden) v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Resume whenever video enters the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            v.play().catch(() => {});
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(v);

    // Poll every 2 seconds as a last resort safety net
    const interval = setInterval(() => {
      if (v.paused && !document.hidden) v.play().catch(() => {});
    }, 2000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted={true}
      playsInline
      preload="auto"
      poster={poster}
      onCanPlay={forcePlay}
      onLoadedData={forcePlay}
      onPause={forcePlay}
      onStalled={forcePlay}
      onWaiting={forcePlay}
      className={className}
    >
      <source src={src} type="video/mp4" />
      <track kind="captions" srcLang="en" label="English" src={src.replace(/\.mp4$/, ".vtt")} />
    </video>
  );
}

export function Features() {
  return (
    <section className="bg-transparent text-black py-20 sm:py-32 px-5 sm:px-8 md:px-12">
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
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-8 text-[#0a192f] bg-[#0a192f]/10">
              <MonitorPlay className="w-4 h-4" /> Learning dashboard
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Your whole IITM BS journey, <br />
              <span className="text-[#0a192f]">in one place</span>
            </h2>
            <div className="max-w-xl mb-10">
              <p className="text-base sm:text-lg font-medium text-black/60 leading-relaxed">
                Live classes, courses, doubts and tools together in one clean student dashboard.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 font-medium text-base text-black/70">
              {["Live classes with recordings and slides", "Ask doubts to the BSPrep AI and mentors", "GPA calculator, predictor and exam calendar", "Community notes for every subject"].map((item, i) => (
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
            className="order-1 lg:order-2 lg:col-span-7 rounded-3xl shadow-2xl bg-black overflow-hidden ring-1 ring-black/5"
          >
            <ForcePlayVideo
              src={VIDEOS[0].src}
              poster={VIDEOS[0].poster}
              className="w-full h-auto block"
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
            className="lg:col-span-7 rounded-3xl shadow-2xl bg-black overflow-hidden ring-1 ring-black/5"
          >
            <ForcePlayVideo
              src={VIDEOS[1].src}
              poster={VIDEOS[1].poster}
              className="w-full h-auto block"
            />
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-8 text-[#0a192f] bg-[#0a192f]/10">
              <Code2 className="w-4 h-4" /> Built-in compiler
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Practice code <br />
              <span className="text-[#0a192f]">anywhere</span>
            </h2>
            <div className="max-w-xl mb-10">
              <p className="text-base sm:text-lg font-medium text-black/60 leading-relaxed">
                No installs, no setup. Write, run and share Python, Java, C and C++ right from your browser.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 font-medium text-base text-black/70">
              {["Python, Java, C and C++", "Share your code with one link", "Multi-file editor with tabs", "Run with Ctrl + Enter"].map((item, i) => (
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

        {/* GPA tools Feature */}
        <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="order-2 lg:order-1 lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-8 text-[#0a192f] bg-[#0a192f]/10">
              <Calculator className="w-4 h-4" /> GPA tools
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Know your grade <br />
              <span className="text-[#0a192f]">before the exam</span>
            </h2>
            <div className="max-w-xl mb-10">
              <p className="text-base sm:text-lg font-medium text-black/60 leading-relaxed">
                Work out your course grade, track your semester GPA and see the score you need in the final exam for the grade you want.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 font-medium text-base text-black/70">
              {["Course grade calculator", "Semester GPA and CGPA in one place", "Predict the exam score you need for a target grade"].map((item, i) => (
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
            className="order-1 lg:order-2 lg:col-span-7 rounded-3xl shadow-2xl bg-black overflow-hidden ring-1 ring-black/5"
          >
            <ForcePlayVideo
              src={VIDEOS[2].src}
              poster={VIDEOS[2].poster}
              className="w-full h-auto block"
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
