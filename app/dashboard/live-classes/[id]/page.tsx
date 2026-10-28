"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, SearchX, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { LiveClassTile } from "@/components/dashboard/live-class-tile";
import { EmptyState, Notice, PageHeader } from "@/components/dashboard/ui";

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
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard/live-classes" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All live classes
      </Link>

      <PageHeader title="Shared class" description="Someone shared this live class with you." />

      {status === "loading" && <div className="h-48 animate-pulse rounded-2xl bg-muted" />}

      {status === "forbidden" && (
        <EmptyState
          icon={ShieldAlert}
          title="You don't have access to this class"
          hint="It requires enrollment in that course. Check with your mentor if you think this is a mistake."
        />
      )}

      {status === "not-found" && (
        <EmptyState icon={SearchX} title="This class link is no longer valid" hint="It may have been deleted by the mentor or admin." />
      )}

      {status === "error" && <Notice tone="error">Unable to load this class. Please try again later.</Notice>}

      {status === "ok" && liveClass && (
        <LiveClassTile
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
