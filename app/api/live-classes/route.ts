import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!sheetId || !apiKey) {
      return NextResponse.json(
        { error: "Google Sheets credentials not configured" },
        { status: 500 }
      );
    }

    // Fetch data from Google Sheets API
    // Range assumes columns: Subject | Topic | Meeting Link | Time | Date
    const range = "Sheet1!A2:E1000"; // Adjust sheet name and range as needed
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    // Transform rows into structured data
    const classes = rows
      .filter((row: string[]) => row.length >= 5) // Ensure row has all required fields
      .map((row: string[]) => ({
        subject: row[0] || "",
        topic: row[1] || "",
        meetingLink: row[2] || "",
        time: row[3] || "",
        date: row[4] || "",
      }))
      .filter((cls: { subject: string; topic: string }) => cls.subject && cls.topic); // Filter out empty rows

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Error fetching live classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch live classes" },
      { status: 500 }
    );
  }
}
