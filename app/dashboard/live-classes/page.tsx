"use client";

import { useEffect, useState } from "react";
import { LiveClassCard } from "@/components/live-class-card";
import { Loader2, ArrowLeft, Video } from "lucide-react";
import Link from "next/link";

interface LiveClass {
  course: string;
  topic: string;
  meetingLink: string;
  time: string;
  date: string;
  youtubeLink?: string;
}

type Filter = "all" | "upcoming" | "completed";

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

  useEffect(() => {
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

  const filtered = classes.filter((cls) => {
    if (filter === "all") return true;
    const s = getStatus(cls.date, cls.time);
    if (filter === "upcoming") return s === "upcoming" || s === "live";
    if (filter === "completed") return s === "completed";
    return true;
  });

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-xl px-7 py-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center shrink-0">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black leading-tight">Live Classes</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Join upcoming lectures and watch recordings of past classes.
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-2xl font-bold text-black">{classes.length}</p>
          <p className="text-xs text-gray-500 font-medium">Total Classes</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              filter === tab.key
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className={`ml-1.5 text-xs ${filter === tab.key ? "text-white/70" : "text-gray-400"}`}>
                {classes.filter((c) => {
                  const s = getStatus(c.date, c.time);
                  return tab.key === "upcoming" ? s === "upcoming" || s === "live" : s === "completed";
                }).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-600 font-medium">No {filter === "all" ? "" : filter} classes found.</p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-2 text-sm text-black underline underline-offset-2 hover:no-underline"
            >
              View all classes
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
  );
}
