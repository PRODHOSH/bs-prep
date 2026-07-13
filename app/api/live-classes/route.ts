import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiRateLimiter } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = await apiRateLimiter.check(ip);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let enrolledCourseIds: string[] = [];
    if (user) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);
      
      if (enrollments) {
        enrolledCourseIds = enrollments.map(e => e.course_id);
      }
    }

    // Fetch classes from Supabase instead of Google Sheets
    const { data: dbClasses, error } = await supabase
      .from('live_classes')
      .select('*')
      .order('date', { ascending: true });

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
    })).filter((cls) => {
      // Keep Python and Doubts classes visible for everyone in dashboard.
      const code = cls.course.toLowerCase();
      if (code === 'python' || code === 'doubts') {
        return true;
      }

      // Match course code -> course ID for enrollment filtering.
      const courseIdMap: { [key: string]: string } = {
        'ct': 'qualifier-computational-thinking',
        'stats-1': 'qualifier-stats-1',
        'math-1': 'qualifier-math-1',
        'qualifier-python': 'qualifier-python',
        'qualifier-java': 'qualifier-java'
      };
      const courseId = courseIdMap[code];
      return courseId ? enrolledCourseIds.includes(courseId) : false;
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Error fetching live classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch live classes" },
      { status: 500 }
    );
  }
}
