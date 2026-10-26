import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("mentor_subject, mentor_subjects")
      .eq("id", user.id)
      .maybeSingle();
      
    let mentorSubjects: string[] = [];
    if (profile?.mentor_subjects && profile.mentor_subjects.length > 0) {
      mentorSubjects = profile.mentor_subjects;
    } else if (profile?.mentor_subject) {
      mentorSubjects = profile.mentor_subject.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    if (mentorSubjects.length === 0) {
      return NextResponse.json({ classes: [], mentorSubjects: [] });
    }

    let query = adminSupabase
      .from("live_classes")
      .select("*")
      .in("course", mentorSubjects)
      .order("created_at", { ascending: false });

    const { data: classes, error } = await query;

    if (error) throw error;

    return NextResponse.json({ classes, mentorSubjects });
  } catch (error: any) {
    console.error("Error fetching live classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.course || !body.topic || !body.meeting_link || !body.time || !body.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("mentor_subject, mentor_subjects")
      .eq("id", user.id)
      .maybeSingle();
      
    let mentorSubjects: string[] = [];
    if (profile?.mentor_subjects && profile.mentor_subjects.length > 0) {
      mentorSubjects = profile.mentor_subjects;
    } else if (profile?.mentor_subject) {
      mentorSubjects = profile.mentor_subject.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    if (mentorSubjects.length === 0) {
      return NextResponse.json({ error: "You are not assigned to a subject" }, { status: 403 });
    }

    const selectedCourse = body.course && mentorSubjects.includes(body.course) ? body.course : mentorSubjects[0];

    const { data, error } = await adminSupabase
      .from("live_classes")
      .insert([{
        course: selectedCourse, // Force mentor's actual subject
        topic: body.topic,
        meeting_link: body.meeting_link,
        youtube_link: body.youtube_link || null,
        time: body.time,
        date: body.date
      }])
      .select()
      .single();

    if (error) throw error;

    // ----- GOOGLE CALENDAR API SYNC -----
    try {
      const { getGoogleAccessToken } = await import("@/lib/google-auth");
      
      const courseIdMap: { [key: string]: string } = {
        'ct': 'qualifier-computational-thinking',
        'stats-1': 'qualifier-stats-1',
        'math-1': 'qualifier-math-1',
        'python': 'python', // Legacy free python
        'qualifier-python': 'qualifier-python',
        'qualifier-java': 'qualifier-java'
      };
      
      const normalizedCourse = selectedCourse.toLowerCase();
      const mappedCourseId = courseIdMap[normalizedCourse] || selectedCourse;
      
      // 1. Fetch enrolled students
      let enrolledUserIds: string[] = [];
      let fetchAllUsers = false;
      
      if (mappedCourseId === 'doubts' || mappedCourseId === 'python') {
        fetchAllUsers = true;
      } else {
        const { data: enrollments, error: enrollError } = await adminSupabase
          .from('enrollments')
          .select('user_id')
          .eq('course_id', mappedCourseId);
          
        if (!enrollError && enrollments) {
          enrolledUserIds = enrollments.map(e => e.user_id);
        }
      }
        
      let attendees: { email: string }[] = [];
      
      if (fetchAllUsers || enrolledUserIds.length > 0) {
        // We use admin listUsers to get emails (max 1000 per page for larger cohorts)
        const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
        
        if (!usersError && users) {
          attendees = users
            .filter(u => (fetchAllUsers || enrolledUserIds.includes(u.id)) && u.email)
            .map(u => ({ email: u.email! }));
        }
      }
      
      // 2. Parse time for Google Calendar
      let hour = 0;
      let min = 0;
      const timeMatches = body.time.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
      if (timeMatches) {
        hour = parseInt(timeMatches[1], 10);
        min = parseInt(timeMatches[2], 10);
        const ampm = timeMatches[3]?.toUpperCase();
        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
      }
      const hourStr = hour.toString().padStart(2, '0');
      const minStr = min.toString().padStart(2, '0');
      
      const startDateTime = `${body.date}T${hourStr}:${minStr}:00`;
      const endHour = (hour + 1).toString().padStart(2, '0');
      const endDateTime = `${body.date}T${endHour}:${minStr}:00`;
      
      const description = `Join the meeting here: ${body.meeting_link}${body.youtube_link ? `\nRecording: ${body.youtube_link}` : ''}\n\nTopic: ${body.topic}`;

      const event = {
        summary: `[BS Prep] ${body.course.toUpperCase()} - ${body.topic}`,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Asia/Kolkata',
        },
        attendees,
        // Optional: send meeting link as location or hangout link if using meet
        location: body.meeting_link.startsWith('http') ? body.meeting_link : undefined
      };

      // 3. Send to Google Calendar API
      const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/calendar.events']);
      const calendarId = 'bsprep.team@gmail.com';
      
      const googleRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
      
      if (!googleRes.ok) {
        const errText = await googleRes.text();
        console.error("Google Calendar API failed:", errText);
        // We do not fail the whole request if Calendar API fails, just log it
      }
    } catch (gcalError) {
      console.error("Error syncing with Google Calendar:", gcalError);
    }
    // ------------------------------------

    return NextResponse.json({ success: true, class: data });
  } catch (error: any) {
    console.error("Error creating live class:", error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing class ID" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from("live_classes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting live class:", error);
    return NextResponse.json({ error: error.message || "Failed to delete class" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, youtube_link } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing class ID" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from("live_classes")
      .update({ youtube_link: youtube_link ? youtube_link.trim() : null })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating live class:", error);
    return NextResponse.json({ error: error.message || "Failed to update class" }, { status: 500 });
  }
}

