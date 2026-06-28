import { NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/google-auth';

export async function GET() {
  try {
    const token = await getGoogleAccessToken(['https://www.googleapis.com/auth/calendar.events']);
    const calendarId = 'bsprep.team@gmail.com';
    
    const event = {
      summary: `[BS Prep] TEST - Debugging via Next.js`,
      start: {
        dateTime: '2026-06-28T22:00:00+05:30',
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: '2026-06-28T23:00:00+05:30',
        timeZone: 'Asia/Kolkata',
      }
    };

    const googleRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    });

    if (googleRes.ok) {
      return NextResponse.json({ success: true, result: await googleRes.json() });
    } else {
      return NextResponse.json({ success: false, error: await googleRes.text() });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || String(e) });
  }
}
