"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LiveClassCard } from "@/components/live-class-card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

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

    if (isAuthenticated) {
      fetchClasses();
      // Auto-refresh every 30 seconds to update status
      const interval = setInterval(fetchClasses, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3e3098] to-[#5842c3] flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Live Classes</h1>
          <p className="text-purple-200 mb-8">
            Join upcoming lectures and access meeting links
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-white">
              {error}
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-white/10 border border-purple-300/20 rounded-lg p-8 text-center text-white">
              <p className="text-lg">No live classes scheduled at the moment.</p>
              <p className="text-purple-200 mt-2">Check back later for updates!</p>
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
      </main>

      <Footer />
    </div>
  );
}
