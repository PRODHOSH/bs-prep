"use client";

import { useEffect, useState } from "react";
import { LiveClassCard } from "@/components/live-class-card";
import { Loader2 } from "lucide-react";

interface LiveClass {
  subject: string;
  topic: string;
  meetingLink: string;
  time: string;
  date: string;
}

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/live-classes");
        
        if (!response.ok) {
          throw new Error("Failed to fetch live classes");
        }

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
    // Auto-refresh every 30 seconds to update status
    const interval = setInterval(fetchClasses, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
          Live Classes
        </h1>
        <p className="text-gray-400">
          Join upcoming lectures and access meeting links
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-white">
          {error}
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white/5 border border-gray-700 rounded-lg p-8 text-center text-white">
          <p className="text-lg">No live classes scheduled at the moment.</p>
          <p className="text-gray-400 mt-2">Check back later for updates!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, index) => (
            <LiveClassCard
              key={index}
              subject={cls.subject}
              topic={cls.topic}
              meetingLink={cls.meetingLink}
              time={cls.time}
              date={cls.date}
            />
          ))}
        </div>
      )}
    </div>
  );
}
