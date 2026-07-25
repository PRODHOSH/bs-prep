import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get("fileId")

  if (!fileId) {
    return new NextResponse("Missing fileId", { status: 400 })
  }

  const serviceAccountRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!serviceAccountRaw) {
    return new NextResponse("Service account not configured", { status: 503 })
  }

  try {
    // Build a fresh access token (the Drive service caches it)
    const sa = JSON.parse(serviceAccountRaw)
    const now = Math.floor(Date.now() / 1000)
    const { createSign } = await import("crypto")

    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
    const payload = Buffer.from(
      JSON.stringify({
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      })
    ).toString("base64url")

    const signingInput = `${header}.${payload}`
    const sign = createSign("RSA-SHA256")
    sign.update(signingInput)
    const signature = sign.sign(sa.private_key, "base64url")
    const jwt = `${signingInput}.${signature}`

    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    })

    const { access_token } = await tokenResp.json()

    const driveResp = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    )

    if (!driveResp.ok) {
      return new NextResponse("File not found or inaccessible", { status: 404 })
    }

    const contentType = driveResp.headers.get("content-type") || "application/octet-stream"
    const buffer = await driveResp.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (err) {
    console.error("Media proxy error:", err)
    return new NextResponse("Failed to proxy file", { status: 500 })
  }
}
