import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Generates an iCalendar (.ics) string from live classes
function generateICS(classes: any[]) {
  const events = classes.map((cls) => {
    // Parse the date and time (assumes date is YYYY-MM-DD, time is HH:MM or HH:MM AM/PM)
    // For simplicity, we just use the raw strings, but for standard ICS, we need to convert to UTC format: YYYYMMDDTHHMMSSZ
    
    let startStr = "";
    let endStr = "";
    
    try {
      // Very basic parsing - assuming IST (UTC+5:30)
      const dateParts = cls.date.split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      const day = dateParts[2];
      
      let hourStr = "00";
      let minStr = "00";
      
      const timeMatches = cls.time.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
      if (timeMatches) {
        let hour = parseInt(timeMatches[1], 10);
        const min = timeMatches[2];
        const ampm = timeMatches[3]?.toUpperCase();
        
        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        
        hourStr = hour.toString().padStart(2, '0');
        minStr = min.toString().padStart(2, '0');
      }

      // We'll output floating time, which Google Calendar will interpret in the user's timezone.
      // Better yet, specify IST timezone since these are IST times.
      startStr = `${year}${month}${day}T${hourStr}${minStr}00`;
      
      // Assume 1 hour duration
      const endHour = (parseInt(hourStr) + 1).toString().padStart(2, '0');
      endStr = `${year}${month}${day}T${endHour}${minStr}00`;
    } catch (e) {
      startStr = "20240101T000000";
      endStr = "20240101T010000";
    }

    const description = `Join the meeting here: ${cls.meeting_link}\\n\\nTopic: ${cls.topic}`;

    return [
      "BEGIN:VEVENT",
      `UID:${cls.id || Math.random().toString(36).substring(2)}@bsprep.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;TZID=Asia/Kolkata:${startStr}`,
      `DTEND;TZID=Asia/Kolkata:${endStr}`,
      `SUMMARY:[BS Prep] ${cls.course.toUpperCase()} - ${cls.topic}`,
      `DESCRIPTION:${description}`,
      `URL:${cls.meeting_link}`,
      "END:VEVENT"
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BS Prep//Live Classes//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:BS Prep Live Classes",
    "X-WR-TIMEZONE:Asia/Kolkata",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "X-LIC-LOCATION:Asia/Kolkata",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId"); // Simple auth for calendar feed
    
    // In a production app, you'd want a secure, unguessable token for calendar feeds,
    // not just the raw user ID, to prevent calendar scraping.
    
    const supabase = createServiceRoleClient();
    
    // If no userId, we can just return all public classes (Python/Doubts)
    let enrolledCourseIds: string[] = [];
    
    if (userId) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId);
      
      if (enrollments) {
        enrolledCourseIds = enrollments.map(e => e.course_id);
      }
    }

    const { data: dbClasses, error } = await supabase
      .from('live_classes')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    const rows = dbClasses || [];

    const classes = rows.filter((cls) => {
      const code = cls.course.toLowerCase();
      if (code === 'python' || code === 'doubts') return true;

      const courseIdMap: { [key: string]: string } = {
        'ct': 'qualifier-computational-thinking',
        'stats-1': 'qualifier-stats-1',
        'math-1': 'qualifier-math-1',
        'python': 'foundation-programming-python'
      };
      const courseId = courseIdMap[code];
      return courseId ? enrolledCourseIds.includes(courseId) : false;
    });

    const icsContent = generateICS(classes);

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bsprep-classes.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    console.error("Calendar export error:", error);
    return NextResponse.json({ error: "Failed to generate calendar" }, { status: 500 });
  }
}
