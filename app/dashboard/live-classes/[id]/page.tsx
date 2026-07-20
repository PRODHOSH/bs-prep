"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, ArrowLeft, Video, ShieldAlert, SearchX } from "lucide-react";
import Link from "next/link";

const LiveClassCard = dynamic(
  () => import("@/components/live-class-card").then(mod => ({ default: mod.LiveClassCard })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-3xl bg-gray-100" />
  }
);

interface LiveClass {
  id: string;
  course: string;
  topic: string;
  meetingLink: string;
  time: string;
  date: string;
  youtubeLink?: string;
}

export default function SharedLiveClassPage() {
  const params = useParams<{ id: string }>();
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "not-found" | "forbidden" | "error">("loading");

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setStatus("loading");
        const res = await fetch(`/api/live-classes/${params.id}`);
        if (res.status === 404) {
          setStatus("not-found");
          return;
        }
        if (res.status === 403) {
          setStatus("forbidden");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = await res.json();
        setLiveClass(data.class);
        setStatus("ok");
      } catch (err) {
        console.error("Error fetching live class:", err);
        setStatus("error");
      }
    };
    fetchClass();
  }, [params.id]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link
        href="/dashboard/live-classes"
        className="inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors text-xs font-black uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        All Live Classes
      </Link>

      <div className="bg-[#0a192f] rounded-3xl px-8 py-10 flex items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50 pointer-events-none"></div>
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0 border-2 border-white/20 relative z-10">
          <Video className="w-8 h-8 text-white" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none mb-2">Shared Class</h1>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
            Someone shared this live class with you.
          </p>
        </div>
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-black" />
        </div>
      )}

      {status === "forbidden" && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mb-4" />
          <p className="text-amber-800 font-black uppercase tracking-widest">You don't have access to this class</p>
          <p className="text-amber-700/80 text-sm mt-2">It requires enrollment in that course. Check with your mentor if you think this is a mistake.</p>
        </div>
      )}

      {status === "not-found" && (
        <div className="bg-black/5 border-2 border-black/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
          <SearchX className="w-10 h-10 text-black/30 mb-4" />
          <p className="text-black/60 font-black uppercase tracking-widest">This class link is no longer valid</p>
          <p className="text-black/40 text-sm mt-2">It may have been deleted by the mentor or admin.</p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-red-700 text-sm font-bold uppercase tracking-widest text-center">
          Unable to load this class. Please try again later.
        </div>
      )}

      {status === "ok" && liveClass && (
        <LiveClassCard
          course={liveClass.course}
          topic={liveClass.topic}
          meetingLink={liveClass.meetingLink}
          time={liveClass.time}
          date={liveClass.date}
          youtubeLink={liveClass.youtubeLink}
        />
      )}
    </div>
  );
}
