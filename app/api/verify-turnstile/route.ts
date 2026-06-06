import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, error: "Security check token is required" }, { status: 400 })
    }

    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ success: false, error: "Server misconfiguration" }, { status: 500 })
    }

    const form = new FormData()
    form.append("secret", secret)
    form.append("response", token)

    const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    })

    const data = await cfRes.json()

    if (data.success) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Security check failed. Please try again." }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, error: "Verification error" }, { status: 500 })
  }
}
