"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, Video, Share2, Copy, Check, Mail, MessageCircle, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LiveClass = {
  id: string;
  course: string;
  topic: string;
  meeting_link: string;
  time: string;
  date: string;
  youtube_link?: string;
};

function buildShareMessage(cls: LiveClass): string {
  const lectureUrl = `${window.location.origin}/dashboard/live-classes/${cls.id}`;
  return [
    `Course: ${cls.course.toUpperCase()}`,
    `Topic: ${cls.topic}`,
    `Date & Time: ${cls.date} at ${cls.time}`,
    `Join here: ${lectureUrl}`,
  ].join("\n");
}

export default function MentorLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorSubject, setMentorSubject] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<LiveClass>>({
    course: "python", // default
    topic: "",
    meeting_link: "",
    time: "19:00",
    date: new Date().toISOString().split('T')[0],
    youtube_link: "",
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/mentor/live-classes?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      setClasses(data.classes || []);
      
      if (data.mentorSubject) {
        setMentorSubject(data.mentorSubject);
        setFormData(prev => ({ ...prev, course: data.mentorSubject }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/mentor/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save class");
      await fetchClasses();
      setShowForm(false);
      setFormData({
        course: mentorSubject || "python",
        topic: "",
        meeting_link: "",
        time: "19:00",
        date: new Date().toISOString().split('T')[0],
        youtube_link: "",
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async (cls: LiveClass) => {
    try {
      await navigator.clipboard.writeText(buildShareMessage(cls));
      setCopiedId(cls.id);
      setTimeout(() => setCopiedId((current) => (current === cls.id ? null : current)), 2000);
    } catch {
      alert("Failed to copy to clipboard");
    }
  };

  const handleShareWhatsApp = (cls: LiveClass) => {
    const url = `https://wa.me/?text=${encodeURIComponent(buildShareMessage(cls))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareTelegram = (cls: LiveClass) => {
    const lectureUrl = `${window.location.origin}/dashboard/live-classes/${cls.id}`;
    const text = [
      `Course: ${cls.course.toUpperCase()}`,
      `Topic: ${cls.topic}`,
      `Date & Time: ${cls.date} at ${cls.time}`,
    ].join("\n");
    const url = `https://t.me/share/url?url=${encodeURIComponent(lectureUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareEmail = (cls: LiveClass) => {
    const subject = `Live Class: ${cls.course.toUpperCase()} - ${cls.topic}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildShareMessage(cls))}`;
    window.location.href = url;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`/api/mentor/live-classes?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete class");
      }
      await fetchClasses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-emerald-50">Live Classes</h1>
            <div className="group relative flex cursor-help items-center justify-center rounded-full bg-emerald-500/20 w-5 h-5 text-xs font-bold text-emerald-300">
              ?
              <div className="absolute left-1/2 top-full z-50 mt-2 hidden w-64 -translate-x-1/2 rounded-lg border border-emerald-500/30 bg-[#0f1f26] p-3 text-xs font-normal text-emerald-100/90 shadow-xl group-hover:block">
                <p className="mb-2 font-semibold text-emerald-300">Valid Course Codes:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><code>python</code></li>
                  <li><code>math-1</code></li>
                  <li><code>stats-1</code></li>
                  <li><code>ct</code></li>
                  <li><code>english-1</code></li>
                  <li><code>java</code></li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-emerald-100/60 text-sm">Manage student live classes (LMS)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add Class</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#15303b] border border-white/5 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-emerald-50">Create New Class</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-emerald-100/70 mb-1">Course Code</label>
              <input
                required
                type="text"
                disabled={!!mentorSubject}
                placeholder="e.g. qualifier-python, ct, stats-1"
                className="w-full bg-[#0f1f26] border border-white/10 rounded-lg px-3 py-2 text-emerald-50 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.course}
                onChange={e => setFormData({ ...formData, course: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100/70 mb-1">Topic</label>
              <input
                required
                type="text"
                placeholder="e.g. Week 1: Basics"
                className="w-full bg-[#0f1f26] border border-white/10 rounded-lg px-3 py-2 text-emerald-50 focus:outline-none focus:border-emerald-500"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100/70 mb-1">Meeting Link (GMeet/Zoom)</label>
              <input
                required
                type="url"
                placeholder="https://meet.google.com/..."
                className="w-full bg-[#0f1f26] border border-white/10 rounded-lg px-3 py-2 text-emerald-50 focus:outline-none focus:border-emerald-500"
                value={formData.meeting_link}
                onChange={e => setFormData({ ...formData, meeting_link: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100/70 mb-1">YouTube Recording Link (Optional)</label>
              <input
                type="url"
                placeholder="https://youtube.com/..."
                className="w-full bg-[#0f1f26] border border-white/10 rounded-lg px-3 py-2 text-emerald-50 focus:outline-none focus:border-emerald-500"
                value={formData.youtube_link}
                onChange={e => setFormData({ ...formData, youtube_link: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100/70 mb-1">Date</label>
              <input
                required
                type="date"
                className="w-full bg-[#0f1f26] border border-white/10 rounded-lg px-3 py-2 text-emerald-50 focus:outline-none focus:border-emerald-500"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100/70 mb-1">Time</label>
              <input
                required
                type="time"
                className="w-full bg-[#0f1f26] border border-white/10 rounded-lg px-3 py-2 text-emerald-50 focus:outline-none focus:border-emerald-500"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Class"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-xl text-sm">
          {error}
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-[#15303b] border border-white/5 rounded-xl p-10 text-center">
          <Video className="w-10 h-10 text-emerald-100/30 mx-auto mb-3" />
          <p className="text-emerald-100/70 font-medium">No live classes scheduled.</p>
        </div>
      ) : (
        <div className="bg-[#15303b] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-emerald-100">
            <thead className="bg-[#1c3c48] text-xs uppercase text-emerald-100/60 font-semibold">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Topic</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Links</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    <span className="bg-[#0f1f26] border border-white/10 rounded px-2 py-1 uppercase text-xs">
                      {cls.course}
                    </span>
                  </td>
                  <td className="px-6 py-4">{cls.topic}</td>
                  <td className="px-6 py-4">
                    {cls.date} at {cls.time}
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <a href={cls.meeting_link} target="_blank" className="block text-emerald-400 hover:underline">Meeting</a>
                    {cls.youtube_link && (
                      <a href={cls.youtube_link} target="_blank" className="block text-red-400 hover:underline">YouTube</a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="text-emerald-400 hover:text-emerald-300 transition-colors p-2"
                            title="Share class"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#15303b] border-white/10 text-emerald-100">
                          <DropdownMenuItem onClick={() => handleCopyLink(cls)} className="gap-2 cursor-pointer">
                            {copiedId === cls.id ? (
                              <>
                                <Check className="w-4 h-4" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" /> Copy Link
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareWhatsApp(cls)} className="gap-2 cursor-pointer">
                            <MessageCircle className="w-4 h-4" /> WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareTelegram(cls)} className="gap-2 cursor-pointer">
                            <Send className="w-4 h-4" /> Telegram
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareEmail(cls)} className="gap-2 cursor-pointer">
                            <Mail className="w-4 h-4" /> Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <button
                        onClick={() => handleDelete(cls.id)}
                        className="text-rose-400 hover:text-rose-300 transition-colors p-2"
                        title="Delete class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
