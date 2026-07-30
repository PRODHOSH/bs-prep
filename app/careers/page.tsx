"use client";

import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const JOBS = [
  {
    id: "marketing-intern",
    title: "Marketing Intern",
    type: "Internship",
    duration: "Flexible",
    description: "Help us spread the word about BSPrep across student communities. You'll be managing social media, planning campaigns, and working directly with the core team.",
  },
  {
    id: "full-stack-intern",
    title: "Full Stack Intern",
    type: "Internship",
    duration: "1 Month",
    description: "Join us for a fast-paced 1-month sprint to build and ship high-impact features for the BSPrep platform. Expect to work with Next.js, Tailwind, and Supabase.",
  },
  {
    id: "mentor",
    title: "Mentor",
    type: "Part-Time",
    duration: "Ongoing",
    description: "Are you a top performer in your courses? Join us as a mentor to host live sessions, clear doubts, and guide the next batch of IITM BS students.",
  },
  {
    id: "curriculum-developer",
    title: "Curriculum Developer",
    type: "Internship",
    duration: "Flexible",
    description: "Design custom practice problems, hidden test cases, and edge-case solutions for our upcoming competitive programming platform tailored for IITM BS students.",
  }
];

export default function CareersPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const filteredJobs = JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || job.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-white text-black font-[family-name:var(--font-sora)] flex flex-col relative">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50 z-0"></div>
      
      <Navbar />

      <main className="flex-1 flex flex-col items-center py-24 px-6 relative z-10 w-full max-w-6xl mx-auto">
        <div className="w-full text-left mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-[1.1] mb-4 uppercase">
            JOIN <span className="text-[#0a192f]">OUR TEAM</span>
          </h1>
          <p className="text-black/60 font-bold text-base max-w-2xl">
            BSPrep is built by students, for students. We're an independent team on a mission to make the IITM BS degree more accessible. Come build with us.
          </p>
        </div>

        <div className="w-full mb-12 flex flex-col gap-6">
          <h2 className="text-2xl font-black text-black tracking-tight uppercase">
            OPEN ROLES
          </h2>
          
          <div className="relative w-full max-w-3xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-black/40" />
            <input 
              type="text" 
              placeholder="SEARCH OPPORTUNITIES..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 h-16 bg-white border border-black/10 rounded-2xl text-black font-black uppercase placeholder:text-black/30 text-base md:text-lg shadow-sm focus:ring-2 focus:ring-[#0a192f]/20 focus:border-[#0a192f] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {["All", "Internship", "Part-Time", "Full-Time"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-1 shadow-sm ring-1 ${
                  filterType === type
                    ? "bg-[#0a192f] text-white ring-transparent shadow-md"
                    : "bg-white text-black/60 hover:bg-black/5 ring-black/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="w-full py-12 text-center text-black/50 font-medium">
            No roles found matching "{search}".
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <a 
                key={job.id} 
                href="https://forms.gle/VnwzpeuJ1G6VLTuZ9"
                target="_blank"
                rel="noopener noreferrer"
                className="group block col-span-1 relative bg-white ring-1 ring-black/5 p-8 rounded-3xl cursor-pointer hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden min-h-[320px] flex flex-col"
              >
                <div className="relative z-10 flex flex-col h-full">
                  <span className="text-xs font-black uppercase tracking-widest text-black/40 block mb-3">{job.type} • {job.duration}</span>
                  <h3 className="text-2xl font-black uppercase tracking-tight leading-[1.1] mb-4 text-[#0a192f]">
                    {job.title}
                  </h3>
                  
                  <p className="text-sm text-black/60 font-medium leading-relaxed mb-8 flex-1 line-clamp-4">
                    {job.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between w-full">
                    <span className="inline-flex items-center justify-center h-10 bg-[#0a192f] text-white text-xs font-black uppercase px-5 rounded-full shadow-md gap-1.5">
                      APPLY NOW
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#0a192f]/5 flex items-center justify-center group-hover:bg-[#0a192f] group-hover:text-white transition-colors">
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
