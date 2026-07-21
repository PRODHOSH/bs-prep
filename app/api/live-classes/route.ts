import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiRateLimiter } from "@/lib/rate-limit";
import { canAccessLiveClass } from "@/lib/live-classes/access";

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = await apiRateLimiter.check(ip);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [enrollmentsResult, classesResult] = await Promise.all([
      user
        ? supabase.from("enrollments").select("course_id").eq("user_id", user.id)
        : Promise.resolve({ data: [], error: null }),
      supabase.from("live_classes").select("*").order("date", { ascending: true }),
    ]);

    if (enrollmentsResult.error) {
      throw enrollmentsResult.error;
    }

    const enrolledCourseIds = (enrollmentsResult.data || []).map((e: { course_id: string }) => e.course_id);

    const { data: dbClasses, error } = classesResult;
    if (error) {
      throw error;
    }

    const rows = dbClasses || [];

    // Filter classes based on enrollment
    const classes = rows.map(row => ({
      id: row.id,
      course: row.course,
      topic: row.topic,
      meetingLink: row.meeting_link,
      time: row.time,
      date: row.date,
      youtubeLink: row.youtube_link || "",
    })).filter((cls) => canAccessLiveClass(cls.course, enrolledCourseIds));

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Error fetching live classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch live classes" },
      { status: 500 }
    );
  }
}
