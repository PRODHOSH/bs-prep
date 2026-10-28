"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Pencil, Plus, Trash2, Video, Youtube } from "lucide-react";
import { SkRows } from "@/components/dashboard/skeleton"
import { Modal, SearchBox, Tabs } from "@/components/dashboard/controls";
import { EmptyState, Field, IconTile, Notice, PageHeader, Tag, btnGhost, btnPrimary, field } from "@/components/dashboard/ui";

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
  const [mentorSubjects, setMentorSubjects] = useState<string[]>([]);

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
      
      if (data.mentorSubjects && data.mentorSubjects.length > 0) {
        setMentorSubjects(data.mentorSubjects);
        setFormData(prev => ({ ...prev, course: data.mentorSubjects[0] }));
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
        course: mentorSubjects[0] || "python",
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

  const set = (patch: Partial<LiveClass>) => setFormData((prev) => ({ ...prev, ...patch }));
  const missingCount = classes.filter((c) => !c.youtube_link).length;
  const recordedCount = classes.length - missingCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live classes"
        description="Schedule classes and attach recordings for your students."
        actions={
          <button onClick={() => setShowForm(true)} className={btnPrimary}>
            <Plus className="size-4" /> Add class
          </button>
        }
      />

      <div>
        <Tabs
          tabs={[
            { id: "all", label: "All", count: classes.length },
            { id: "missing", label: "Needs recording", count: missingCount },
            { id: "recorded", label: "Recorded", count: recordedCount },
          ]}
          value={filterType}
          onChange={setFilterType}
        />
        <div className="mt-5">
          <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search by topic or course" className="max-w-sm" />
        </div>
      </div>

      {loading ? (
        <SkRows rows={4} />
      ) : error ? (
        <Notice tone="error">{error}</Notice>
      ) : filteredClasses.length === 0 ? (
        <EmptyState icon={Video} title="No classes found" hint="No live classes match your filter or search." />
      ) : (
        <ul className="space-y-3">
          {filteredClasses.map((cls) => {
            const { date, time } = formatDateTime(cls.date, cls.time);
            return (
              <li key={cls.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <IconTile icon={cls.youtube_link ? Youtube : Video} tone={cls.youtube_link ? "amber" : "primary"} className="size-11 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Tag>{cls.course}</Tag>
                      {cls.youtube_link ? <Tag tone="green">Recorded</Tag> : <Tag tone="amber">Needs recording</Tag>}
                      <span className="font-medium text-muted-foreground">{date} · {time}</span>
                    </div>
                    <h3 className="mt-1.5 text-[15px] font-bold leading-snug">{cls.topic}</h3>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <a href={cls.meeting_link} target="_blank" rel="noreferrer" className={`${btnGhost} h-9 px-3 text-xs`}>
                      Meeting <ExternalLink className="size-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        setEditingClass(cls);
                        setEditYoutubeLink(cls.youtube_link || "");
                      }}
                      className={`${btnGhost} h-9 px-3 text-xs`}
                    >
                      <Pencil className="size-3.5" /> {cls.youtube_link ? "Edit recording" : "Add recording"}
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      className="grid size-9 place-items-center rounded-xl border text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      title="Delete class"
                      aria-label="Delete class"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New live class" width="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Course">
              {mentorSubjects.length > 1 ? (
                <select className={field} value={formData.course} onChange={(e) => set({ course: e.target.value })}>
                  {mentorSubjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              ) : (
                <input required className={field} value={formData.course} disabled={mentorSubjects.length === 1} onChange={(e) => set({ course: e.target.value })} />
              )}
            </Field>
            <Field label="Topic">
              <input required placeholder="e.g. Week 1: Basics" className={field} value={formData.topic} onChange={(e) => set({ topic: e.target.value })} />
            </Field>
          </div>
          <Field label="Meeting link (GMeet or Zoom)">
            <input required type="url" placeholder="https://meet.google.com/..." className={field} value={formData.meeting_link} onChange={(e) => set({ meeting_link: e.target.value })} />
          </Field>
          <Field label="YouTube recording link (optional)">
            <input type="url" placeholder="https://youtube.com/..." className={field} value={formData.youtube_link} onChange={(e) => set({ youtube_link: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date"><input required type="date" className={field} value={formData.date} onChange={(e) => set({ date: e.target.value })} /></Field>
            <Field label="Time"><input required type="time" className={field} value={formData.time} onChange={(e) => set({ time: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className={btnGhost}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={btnPrimary}>{isSubmitting ? "Saving…" : "Save class"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editingClass} onClose={() => setEditingClass(null)} title="Class recording">
        {editingClass && (
          <form onSubmit={handleUpdateYoutubeLink} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set the playback link for <span className="font-semibold text-foreground">&ldquo;{editingClass.topic}&rdquo;</span>. It appears on student dashboards.
            </p>
            <Field label="YouTube link" hint="Leave empty to remove the recording.">
              <input type="url" placeholder="https://youtube.com/..." className={field} value={editYoutubeLink} onChange={(e) => setEditYoutubeLink(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingClass(null)} className={btnGhost}>Cancel</button>
              <button type="submit" disabled={isUpdating} className={btnPrimary}>{isUpdating ? "Saving…" : "Save link"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
