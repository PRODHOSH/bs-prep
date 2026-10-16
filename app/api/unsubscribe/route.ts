import { NextRequest, NextResponse } from "next/server"
import { addUnsubscribe, verifyEmailToken } from "@/lib/unsubscribe"

// POST only: the page button and mail clients' one-click unsubscribe both land here.
// GET is deliberately not supported so link scanners that prefetch URLs can't unsubscribe anyone.
export async function POST(request: NextRequest) {
  const params = request.nextUrl.searchParams
  let email = params.get("e") ?? ""
  let token = params.get("t") ?? ""
  const oneClick = Boolean(email)

  if (!email) {
    const body = await request.json().catch(() => null)
    email = String(body?.e ?? "")
    token = String(body?.t ?? "")
  }

  if (!email.includes("@") || !verifyEmailToken(email, token)) {
    return NextResponse.json({ error: "This unsubscribe link is invalid." }, { status: 400 })
  }

  try {
    await addUnsubscribe(email, oneClick ? "one-click" : "link")
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Unsubscribe error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
