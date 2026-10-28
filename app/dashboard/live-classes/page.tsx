"use client";

import { useEffect, useState } from "react";
import { getUserCached } from "@/lib/supabase/cached-user"
import { LiveClassesView, type LiveClass } from "@/components/dashboard/views/live-classes-view";

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
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


  return <LiveClassesView classes={classes} loading={loading} error={error} />;
}
