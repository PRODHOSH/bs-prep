import { NextResponse } from "next/server"
import { google } from "googleapis"
import { courses } from "@/lib/course-catalog"

// Cache for 5 minutes
export const revalidate = 300

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const course = courses.find((c) => c.id === courseId)

    if (!course || !course.driveFolderId) {
      return NextResponse.json({ files: [] })
    }

    const serviceAccountKeyStr = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!serviceAccountKeyStr) {
      console.error("Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable")
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 })
    }

    let credentials
    try {
      credentials = JSON.parse(serviceAccountKeyStr)
    } catch (e) {
      console.error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON string")
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 })
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    const drive = google.drive({ version: "v3", auth })

    const response = await drive.files.list({
      q: `'${course.driveFolderId}' in parents and trashed = false`,
      fields: "files(id, name, webViewLink, webContentLink)",
      orderBy: "name",
    })

    return NextResponse.json({ files: response.data.files || [] })
  } catch (error) {
    console.error("Error fetching slides from Google Drive:", error)
    return NextResponse.json({ error: "Failed to fetch slides" }, { status: 500 })
  }
}
