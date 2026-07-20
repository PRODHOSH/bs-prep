import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiRateLimiter } from "@/lib/rate-limit";
import { canAccessLiveClass } from "@/lib/live-classes/access";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = await apiRateLimiter.check(ip);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [enrollmentsResult, classResult] = await Promise.all([
      supabase.from('enrollments').select('course_id').eq('user_id', user.id),
      supabase.from('live_classes').select('*').eq('id', id).maybeSingle(),
    ]);

    const enrolledCourseIds = (enrollmentsResult.data || []).map((e: { course_id: string }) => e.course_id);

    const { data: row, error } = classResult;
    if (error) {
      throw error;
    }

    if (!row) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (!canAccessLiveClass(row.course, enrolledCourseIds)) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    return NextResponse.json({
      class: {
        id: row.id,
        course: row.course,
        topic: row.topic,
        meetingLink: row.meeting_link,
        time: row.time,
        date: row.date,
        youtubeLink: row.youtube_link || "",
      },
    });
  } catch (error) {
    console.error("Error fetching live class:", error);
    return NextResponse.json({ error: "Failed to fetch live class" }, { status: 500 });
  }
}
