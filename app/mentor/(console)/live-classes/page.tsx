"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, Video, Pencil, Youtube, X, Search, Filter } from "lucide-react";

type LiveClass = {
  id: string;
  course: string;
  topic: string;
  meeting_link: string;
  time: string;
  date: string;
  youtube_link?: string;
};

function formatDateTime(dateStr: string, timeStr: string) {
  try {
    const dateObj = new Date(dateStr);
    const date = isNaN(dateObj.getTime())
      ? dateStr
      : dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    const timeParts = timeStr.split(":");
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1] || "0", 10);
    if (isNaN(hours)) return { date, time: timeStr };

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const minutesStr = minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`;
    const time = `${hours}${minutesStr} ${ampm}`;

    return { date, time };
  } catch {
    return { date: dateStr, time: timeStr };
  }
}

export default function MentorLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorSubject, setMentorSubject] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "missing" | "recorded">("all");

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

  // Edit YouTube Link State
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [editYoutubeLink, setEditYoutubeLink] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleUpdateYoutubeLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/mentor/live-classes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingClass.id, youtube_link: editYoutubeLink }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update YouTube link");
      }
      await fetchClasses();
      setEditingClass(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.course.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === "missing") return matchesSearch && !cls.youtube_link;
    if (filterType === "recorded") return matchesSearch && !!cls.youtube_link;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-50">Live Classes</h1>
          <p className="text-emerald-100/60 text-sm mt-0.5">Manage student live classes (LMS)</p>
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
        <>
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#15303b]/60 border border-white/5 p-3 rounded-xl">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterType === "all" ? "bg-emerald-500 text-[#061418] shadow" : "text-emerald-100/70 hover:bg-white/5"
                }`}
              >
                All ({classes.length})
              </button>
              <button
                onClick={() => setFilterType("missing")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  filterType === "missing" ? "bg-amber-400 text-[#061418] shadow" : "text-emerald-100/70 hover:bg-white/5"
                }`}
              >
                <span>No Recording</span>
                <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-bold">
                  {classes.filter((c) => !c.youtube_link).length}
                </span>
              </button>
              <button
                onClick={() => setFilterType("recorded")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterType === "recorded" ? "bg-emerald-500 text-[#061418] shadow" : "text-emerald-100/70 hover:bg-white/5"
                }`}
              >
                Recorded ({classes.filter((c) => !!c.youtube_link).length})
              </button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/40" />
              <input
                type="text"
                placeholder="Search class topics..."
                className="w-full bg-[#0f1f26] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-emerald-100 placeholder:text-emerald-100/40 focus:outline-none focus:border-emerald-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="bg-[#15303b] border border-white/5 rounded-xl p-8 text-center text-emerald-100/60 text-sm">
              No live classes match your filter or search query.
            </div>
          ) : (
            <>
              {/* Mobile Cards Layout (< md screens) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredClasses.map((cls) => {
                  const { date, time } = formatDateTime(cls.date, cls.time);
                  return (
                    <div key={cls.id} className="bg-[#15303b] border border-white/10 rounded-2xl p-4 space-y-3.5 shadow-md">
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-[#0f1f26] border border-white/10 rounded px-2.5 py-1 uppercase text-xs font-bold text-emerald-300">
                          {cls.course}
                        </span>
                        <span className="text-xs font-medium text-emerald-100/80">
                          {date} • <span className="text-emerald-300 font-bold">{time}</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-emerald-50 leading-snug">{cls.topic}</h3>
                      </div>

                      <div className="flex items-center gap-4 pt-0.5 text-xs">
                        <a
                          href={cls.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>Meeting Link</span>
                        </a>
                        {cls.youtube_link && (
                          <a
                            href={cls.youtube_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>YouTube Recording</span>
                          </a>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2.5">
                        <button
                          onClick={() => {
                            setEditingClass(cls);
                            setEditYoutubeLink(cls.youtube_link || "");
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f1f26] border border-white/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-colors flex-1 justify-center shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>{cls.youtube_link ? "Edit YouTube" : "+ Add YouTube"}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className="text-rose-400 hover:text-rose-300 bg-[#0f1f26] hover:bg-rose-500/20 border border-white/10 p-2.5 rounded-xl transition-colors shrink-0 shadow-sm"
                          title="Delete class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table Layout (>= md screens) */}
              <div className="hidden md:block bg-[#15303b] border border-white/5 rounded-xl overflow-hidden shadow-sm">
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
                    {filteredClasses.map((cls) => {
                      const { date, time } = formatDateTime(cls.date, cls.time);
                      return (
                        <tr key={cls.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium">
                            <span className="bg-[#0f1f26] border border-white/10 rounded px-2 py-1 uppercase text-xs font-semibold text-emerald-300">
                              {cls.course}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-emerald-50">{cls.topic}</td>
                          <td className="px-6 py-4 font-medium text-emerald-100/90">
                            {date} <span className="text-emerald-300 font-semibold ml-1">({time})</span>
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="block text-emerald-400 hover:underline">Meeting</a>
                            {cls.youtube_link ? (
                              <a href={cls.youtube_link} target="_blank" rel="noopener noreferrer" className="block text-red-400 hover:underline flex items-center gap-1">
                                <span>YouTube</span>
                              </a>
                            ) : null}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingClass(cls);
                                  setEditYoutubeLink(cls.youtube_link || "");
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1f26] border border-white/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-colors"
                                title="Edit YouTube recording link"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>{cls.youtube_link ? "Edit YouTube" : "+ YouTube"}</span>
                              </button>
                              <button
                                onClick={() => handleDelete(cls.id)}
                                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors p-2"
                                title="Delete class"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Edit YouTube Link Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#102329] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4 relative animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-emerald-100 flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <span>Edit YouTube Recording</span>
              </h3>
              <button
                onClick={() => setEditingClass(null)}
                className="text-emerald-100/60 hover:text-emerald-100 p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              Set or update the video recording playback link for <span className="font-semibold text-emerald-300">&ldquo;{editingClass.topic}&rdquo;</span>. This will appear directly in student LMS dashboards.
            </p>

            <form onSubmit={handleUpdateYoutubeLink} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-100/70 mb-1.5">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full bg-[#0f1f26] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-emerald-50 focus:outline-none focus:border-emerald-400"
                  value={editYoutubeLink}
                  onChange={(e) => setEditYoutubeLink(e.target.value)}
                  autoFocus
                />
                <p className="mt-1.5 text-[11px] text-emerald-100/50">
                  Tip: Leave empty and click save if you wish to remove an existing recording link.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-100/70 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-emerald-500 hover:bg-emerald-400 text-[#061418] px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-lg"
                >
                  {isUpdating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : "Save Recording Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
