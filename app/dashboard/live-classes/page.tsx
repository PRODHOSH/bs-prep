"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2, ArrowLeft, Video, Search, X, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const LiveClassCard = dynamic(
  () => import("@/components/live-class-card").then(mod => ({ default: mod.LiveClassCard })),
  {
    ssr: false,
    loading: () => <div className="h-36 animate-pulse rounded-xl bg-gray-100" />
  }
);

interface LiveClass {
  course: string;
  topic: string;
  meetingLink: string;
  time: string;
  date: string;
  youtubeLink?: string;
}

type Filter = "all" | "upcoming" | "completed";

const COURSE_LABELS: Record<string, string> = {
  "ct": "Computational Thinking",
  "math-1": "Mathematics I",
  "stats-1": "Statistics I",
  "python": "Programming in Python (Free)",
  "qualifier-python": "Programming in Python",
  "qualifier-java": "Programming in Java",
  "math-2": "Mathematics II",
  "stats-2": "Statistics II",
  "english-1": "English I",
  "english-2": "English II",
  "doubts": "Doubt Session",
};

function getStatus(date: string, time: string): "live" | "upcoming" | "completed" {
  const classDate = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  classDate.setHours(hours, minutes, 0, 0);
  const diffMins = Math.floor((classDate.getTime() - Date.now()) / 60000);
  if (diffMins < -60) return "completed";
  if (diffMins <= 15 && diffMins >= -60) return "live";
  return "upcoming";
}

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
    
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/live-classes");
        if (!response.ok) throw new Error("Failed to fetch live classes");
        const data = await response.json();
        setClasses(data.classes || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Unable to load live classes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
    const interval = setInterval(fetchClasses, 30000);
    return () => clearInterval(interval);
  }, []);


  // Unique course codes present in data
  const availableCourses = useMemo(() => {
    const codes = Array.from(new Set(classes.map(c => c.course.toLowerCase())));
    return codes.sort();
  }, [classes]);

  const toggleCourse = (code: string) => {
    setSelectedCourses(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const filtered = classes.filter((cls) => {
    // Status filter
    if (filter !== "all") {
      const s = getStatus(cls.date, cls.time);
      if (filter === "upcoming" && s !== "upcoming" && s !== "live") return false;
      if (filter === "completed" && s !== "completed") return false;
    }
    // Topic search
    if (search.trim() && !cls.topic.toLowerCase().includes(search.trim().toLowerCase())) return false;
    // Course filter
    if (selectedCourses.length > 0 && !selectedCourses.includes(cls.course.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const statusA = getStatus(a.date, a.time);
    const statusB = getStatus(b.date, b.time);
    
    // Ensure we parse correctly (date + time)
    const dtA = new Date(`${a.date}T${a.time}`).getTime();
    const dtB = new Date(`${b.date}T${b.time}`).getTime();

    // Group by status (live first, then upcoming, then completed)
    const rank: Record<string, number> = { live: 0, upcoming: 1, completed: 2 };
    
    if (rank[statusA] !== rank[statusB]) {
      return rank[statusA] - rank[statusB];
    }

    // Sort within the same group
    if (statusA === "completed") {
      // most recent completed first
      return dtB - dtA;
    } else {
      // soonest upcoming/live first
      return dtA - dtB;
    }
  });

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
  ];

  const hasActiveFilters = search.trim() || selectedCourses.length > 0;

  return (
    <div id="tour-live-classes-page" className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors text-xs font-black uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Page Header */}
      <div id="tour-live-classes" className="bg-[#0a192f] rounded-3xl px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50 pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0 border-2 border-white/20">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none mb-2">LIVE CLASSES</h1>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
              JOIN UPCOMING LECTURES AND WATCH RECORDINGS OF PAST CLASSES.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right hidden sm:block bg-white/10 px-6 py-4 rounded-2xl border border-white/20">
            <p className="text-3xl font-black text-white leading-none mb-1">{classes.length}</p>
            <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">TOTAL CLASSES</p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-black pointer-events-none transition-colors" />
        <input
          type="text"
          placeholder="SEARCH BY TOPIC…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-14 pr-12 py-5 rounded-full border-2 border-black/10 bg-white text-black text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-black transition-all hover:shadow-md"
          suppressHydrationWarning
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar filter */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border border-black/10 rounded-3xl p-6 space-y-8 sticky top-24">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-4">STATUS</p>
            <div className="space-y-1.5">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    filter === tab.key ? "bg-black text-white shadow-md" : "text-black/60 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {tab.label}
                  {tab.key !== "all" && (
                    <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${filter === tab.key ? "bg-white/20 text-white" : "bg-black/5 text-black/60"}`}>
                      {classes.filter(c => {
                        const s = getStatus(c.date, c.time);
                        return tab.key === "upcoming" ? s === "upcoming" || s === "live" : s === "completed";
                      }).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {availableCourses.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-4">COURSE</p>
              <div className="space-y-1.5">
                {availableCourses.map(code => {
                  const label = COURSE_LABELS[code] ?? code;
                  const active = selectedCourses.includes(code);
                  return (
                    <button
                      key={code}
                      onClick={() => toggleCourse(code)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                        active ? "bg-black text-white shadow-md" : "text-black/60 hover:bg-black/5 hover:text-black"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 transition-colors ${active ? "bg-white border-white" : "border-black/20"}`} />
                      <span className="line-clamp-1">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(""); setSelectedCourses([]); setFilter("all"); }}
              className="w-full text-[10px] text-red-500 hover:text-red-700 font-black uppercase tracking-widest py-2 transition-colors flex justify-center items-center gap-1 bg-red-50 hover:bg-red-100 rounded-xl"
            >
              <X className="w-3 h-3" />
              CLEAR FILTERS
            </button>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Mobile filter tabs */}
          <div className="flex lg:hidden items-center gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border-2 ${
                  filter === tab.key
                    ? "bg-black text-white border-black shadow-md"
                    : "bg-white text-black/60 border-black/10 hover:border-black hover:text-black"
                }`}
              >
                {tab.label}
                {tab.key !== "all" && (
                  <span className={`ml-1.5 text-[10px] ${filter === tab.key ? "text-white/70" : "text-black/40"}`}>
                    {classes.filter((c) => {
                      const s = getStatus(c.date, c.time);
                      return tab.key === "upcoming" ? s === "upcoming" || s === "live" : s === "completed";
                    }).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!loading && !error && (
            <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">
              {filtered.length} {filtered.length === 1 ? "CLASS" : "CLASSES"} FOUND
              {hasActiveFilters && " · "}
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearch(""); setSelectedCourses([]); setFilter("all"); }}
                  className="text-red-500 hover:text-red-700 underline underline-offset-2"
                >
                  CLEAR FILTERS
                </button>
              )}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-black" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-red-700 text-sm font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-black/5 border-2 border-black/10 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
              <Search className="w-12 h-12 text-black/20 mb-4" />
              <p className="text-black/60 font-black uppercase tracking-widest">NO CLASSES MATCH YOUR FILTERS.</p>
              <button
                onClick={() => { setSearch(""); setSelectedCourses([]); setFilter("all"); }}
                className="mt-6 text-xs text-white bg-black hover:bg-black/80 px-6 py-3 rounded-full font-black uppercase tracking-widest transition-colors shadow-md"
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((cls, index) => (
                <LiveClassCard
                  key={index}
                  course={cls.course}
                  topic={cls.topic}
                  meetingLink={cls.meetingLink}
                  time={cls.time}
                  date={cls.date}
                  youtubeLink={cls.youtubeLink}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
