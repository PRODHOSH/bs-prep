"use client";

import { useState, useEffect } from "react";
import { SkRows } from "@/components/dashboard/skeleton"
import { ExternalLink, Plus, Trash2, Video } from "lucide-react";
import { Modal } from "@/components/dashboard/controls";
import { EmptyState, Field, Notice, PageHeader, TableCard, Tag, btnGhost, btnPrimary, field, td, th } from "@/components/dashboard/ui";

type LiveClass = {
  id: string;
  course: string;
  topic: string;
  meeting_link: string;
  time: string;
  date: string;
  youtube_link?: string;
};

export default function MentorLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch(`/api/admin/live-classes?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      setClasses(data.classes || []);
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
      const res = await fetch("/api/admin/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save class");
      await fetchClasses();
      setShowForm(false);
      setFormData({
        course: "python",
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
      const res = await fetch(`/api/admin/live-classes?id=${id}`, {
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

  const set = (patch: Partial<LiveClass>) => setFormData((prev) => ({ ...prev, ...patch }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live classes"
        description="Schedule and manage student live classes."
        actions={
          <button onClick={() => setShowForm(true)} className={btnPrimary}>
            <Plus className="size-4" /> Add class
          </button>
        }
      />

      {loading ? (
        <SkRows rows={4} />
      ) : error ? (
        <Notice tone="error">{error}</Notice>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No live classes scheduled"
          hint="Add the first class to show it on student dashboards."
          action={<button onClick={() => setShowForm(true)} className={btnPrimary}><Plus className="size-4" /> Add class</button>}
        />
      ) : (
        <TableCard footer={<span className="text-muted-foreground">{classes.length} classes</span>}>
          <thead className="bg-muted/50">
            <tr>
              <th className={th}>Course</th>
              <th className={th}>Topic</th>
              <th className={th}>Date & time</th>
              <th className={th}>Links</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {classes.map((cls) => (
              <tr key={cls.id} className="transition-colors hover:bg-muted/40">
                <td className={td}><Tag>{cls.course}</Tag></td>
                <td className={`${td} font-semibold`}>{cls.topic}</td>
                <td className={`${td} text-muted-foreground`}>{cls.date} · {cls.time}</td>
                <td className={td}>
                  <span className="flex flex-col gap-1 text-xs font-semibold">
                    <a href={cls.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Meeting <ExternalLink className="size-3" /></a>
                    {cls.youtube_link && <a href={cls.youtube_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-destructive hover:underline">Recording <ExternalLink className="size-3" /></a>}
                  </span>
                </td>
                <td className={`${td} text-right`}>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="grid size-8 place-items-center rounded-lg border text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive ml-auto"
                    title="Delete class"
                    aria-label="Delete class"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New live class" width="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Course code" hint="python, math-1, stats-1, ct, english-1, java">
              <input required placeholder="e.g. qualifier-python" className={field} value={formData.course} onChange={(e) => set({ course: e.target.value })} />
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
    </div>
  );
}
