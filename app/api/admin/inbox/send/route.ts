import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hasAdminRole } from "@/lib/security/admin-role"
import {
  MAX_RECIPIENTS,
  SENDING_DOMAIN,
  extractEmails,
  renderEmailHtml,
  renderEmailText,
  type EmailFormat,
} from "@/lib/admin-email"
import { oneClickUnsubscribeUrl, signedUnsubscribeUrl, splitSuppressed } from "@/lib/unsubscribe"

const FORMATS: EmailFormat[] = ["text", "markdown", "html"]
const LOCAL_RE = /^[a-z0-9][a-z0-9._-]{0,63}$/i
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(await hasAdminRole(user.id, user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY is not configured" }, { status: 500 })

  const body = await request.json().catch(() => null)
  const fromName = String(body?.fromName ?? "").replace(/["<>\r\n]/g, "").trim().slice(0, 80)
  const fromLocal = String(body?.fromLocal ?? "").trim()
  const subject = String(body?.subject ?? "").replace(/[\r\n]/g, " ").trim().slice(0, 200)
  const content = String(body?.body ?? "")
  const format = body?.format as EmailFormat
  const replyTo = String(body?.replyTo ?? "").trim()
  const requested = extractEmails(Array.isArray(body?.to) ? body.to.join("\n") : String(body?.to ?? ""))

  if (!LOCAL_RE.test(fromLocal)) return NextResponse.json({ error: "Enter a valid sender address" }, { status: 400 })
  if (!subject) return NextResponse.json({ error: "Subject is required" }, { status: 400 })
  if (!content.trim()) return NextResponse.json({ error: "Message body is empty" }, { status: 400 })
  if (!FORMATS.includes(format)) return NextResponse.json({ error: "Unknown format" }, { status: 400 })
  if (requested.length === 0) return NextResponse.json({ error: "Add at least one recipient" }, { status: 400 })
  if (requested.length > MAX_RECIPIENTS) {
    return NextResponse.json({ error: `Max ${MAX_RECIPIENTS} recipients per send` }, { status: 400 })
  }
  if (replyTo && extractEmails(replyTo).length !== 1) {
    return NextResponse.json({ error: "Reply-to must be a single email address" }, { status: 400 })
  }

  let recipients: string[]
  let suppressed: string[]
  try {
    ;({ allowed: recipients, suppressed } = await splitSuppressed(requested))
  } catch {
    return NextResponse.json(
      { error: "Could not check the unsubscribe list. Has the email_unsubscribes table been created?" },
      { status: 500 },
    )
  }
  if (recipients.length === 0) {
    return NextResponse.json({ error: "Everyone on this list has unsubscribed", suppressed }, { status: 400 })
  }

  const address = `${fromLocal}@${SENDING_DOMAIN}`
  const from = fromName ? `${fromName} <${address}>` : address

  // One message per recipient so nobody sees anyone else's address, each with their own unsubscribe link.
  // Resend batches take up to 100.
  const messages = recipients.map((to) => {
    const unsub = signedUnsubscribeUrl(to)
    const text = renderEmailText(format, content, unsub)
    return {
      from,
      to: [to],
      subject,
      html: renderEmailHtml(format, content, unsub),
      ...(text ? { text } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
      headers: {
        "List-Unsubscribe": `<${oneClickUnsubscribeUrl(to)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }
  })

  let sent = 0
  const failed: string[] = []
  let firstError = ""

  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100)
    if (i > 0) await sleep(600) // stay under Resend's default 2 requests/second
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      })
      if (res.ok) {
        sent += chunk.length
      } else {
        const err = await res.json().catch(() => null)
        firstError ||= err?.message || `Resend responded ${res.status}`
        failed.push(...chunk.map((m) => m.to[0]))
      }
    } catch {
      firstError ||= "Could not reach Resend"
      failed.push(...chunk.map((m) => m.to[0]))
    }
  }

  if (sent === 0) return NextResponse.json({ error: firstError || "Sending failed", failed }, { status: 502 })
  return NextResponse.json({ sent, failed, suppressed, error: failed.length ? firstError : undefined })
}
