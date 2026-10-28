"use client";

import { useEffect, useState, useMemo } from "react";
import { getUserCached } from "@/lib/supabase/cached-user"
import { SkCards } from "@/components/dashboard/skeleton"
import { X, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LiveClassTile, COURSE_NAMES, classStatus } from "@/components/dashboard/live-class-tile";
import { SearchBox, Tabs } from "@/components/dashboard/controls";
import { EmptyState, Notice, PageHeader, Tag, btnPrimary } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

interface LiveClass {
  course: string;
  topic: string;
  meetingLink: string;
  time: string;
  date: string;
  youtubeLink?: string;
}

type Filter = "all" | "upcoming" | "completed";

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
      const { data: { user } } = await getUserCached();
      if (user) setUserId(user.id);
    };
    fetchUser();

    const fetchClasses = async (isInitial: boolean) => {
      try {
        if (isInitial) setLoading(true);
        const response = await fetch("/api/live-classes");
        if (!response.ok) throw new Error("Failed to fetch live classes");
        const data = await response.json();
        setClasses(data.classes || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Unable to load live classes. Please try again later.");
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchClasses(true);

    let interval: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (interval) return;
      interval = setInterval(() => fetchClasses(false), 30000);
    };
    const stopPolling = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchClasses(false);
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
      const s = classStatus(cls.date, cls.time);
      if (filter === "upcoming" && s !== "upcoming" && s !== "live") return false;
      if (filter === "completed" && s !== "completed") return false;
    }
    // Topic search
    if (search.trim() && !cls.topic.toLowerCase().includes(search.trim().toLowerCase())) return false;
    // Course filter
    if (selectedCourses.length > 0 && !selectedCourses.includes(cls.course.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const statusA = classStatus(a.date, a.time);
    const statusB = classStatus(b.date, b.time);
    
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

  const counts = {
    all: classes.length,
    upcoming: classes.filter((c) => classStatus(c.date, c.time) !== "completed").length,
    completed: classes.filter((c) => classStatus(c.date, c.time) === "completed").length,
  }
  const clear = () => {
    setSearch("")
    setSelectedCourses([])
    setFilter("all")
  }
  const hasActiveFilters = Boolean(search.trim()) || selectedCourses.length > 0

  return (
    <div id="tour-live-classes-page" className="space-y-6">
      <PageHeader
        title="Live classes"
        description="Join upcoming lectures and watch recordings of past classes."
        actions={<span id="tour-live-classes"><Tag>{classes.length} total</Tag></span>}
      />

      <div>
        <Tabs
          tabs={[
            { id: "all", label: "All", count: counts.all },
            { id: "upcoming", label: "Upcoming", count: counts.upcoming },
            { id: "completed", label: "Completed", count: counts.completed },
          ]}
          value={filter}
          onChange={setFilter}
        />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {availableCourses.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableCourses.map((code) => {
                const active = selectedCourses.includes(code)
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleCourse(code)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
                      active ? "border-primary/30 bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {COURSE_NAMES[code] ?? code}
                    {active && <X className="size-3.5" />}
                  </button>
                )
              })}
            </div>
          )}
          <SearchBox value={search} onChange={setSearch} placeholder="Search by topic" className="ml-auto w-full sm:w-64" />
        </div>
      </div>

      {!loading && !error && (
        <p className="text-sm font-bold">
          {filtered.length} {filtered.length === 1 ? "class" : "classes"}
          {hasActiveFilters && (
            <button onClick={clear} className="ml-3 text-sm font-semibold text-primary">
              Clear filters
            </button>
          )}
        </p>
      )}

      {loading ? (
        <SkCards count={6} image={false} />
      ) : error ? (
        <Notice tone="error">{error}</Notice>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No classes match your filters"
          hint="Try a different course or search term."
          action={hasActiveFilters ? <button onClick={clear} className={btnPrimary}>Clear filters</button> : undefined}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((cls, index) => (
            <LiveClassTile
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
  )
}
