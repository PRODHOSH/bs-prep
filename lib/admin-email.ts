import { marked } from "marked"

// Shared by the inbox preview (browser) and the send route (server) so what you preview is what gets sent.

export const SENDING_DOMAIN = "bsprep.in"
export const MAX_RECIPIENTS = 500

export type EmailFormat = "text" | "markdown" | "html"

const EMAIL_RE = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Pulls every email address out of pasted text or CSV content, deduplicated and lowercased. */
export function extractEmails(input: string): string[] {
  const found = input.match(EMAIL_RE) ?? []
  return Array.from(new Set(found.map((e) => e.toLowerCase())))
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bsprep.in").replace(/\/$/, "")

export const unsubscribeUrl = (email: string) => `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`

const footerHtml = (unsub: string) =>
  `<p style="max-width:600px;margin:16px auto 0;text-align:center;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#a1a1aa;">Sent by BSPrep &middot; <a href="https://bsprep.in" style="color:#a1a1aa;">bsprep.in</a><br>Don&rsquo;t want these emails? <a href="${escapeHtml(unsub)}" style="color:#a1a1aa;text-decoration:underline;">Unsubscribe</a></p>`

const wrap = (inner: string, unsub: string) => `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f4f5;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.6;color:#18181b;">
${inner}
</div>
${footerHtml(unsub)}
</body></html>`

/** `unsub` is the recipient's unsubscribe link; it is added to the footer of every format. */
export function renderEmailHtml(format: EmailFormat, body: string, unsub: string): string {
  if (format === "html") {
    const footer = footerHtml(unsub)
    return /<\/body>/i.test(body) ? body.replace(/<\/body>/i, `${footer}</body>`) : `${body}
${footer}`
  }
  if (format === "markdown") {
    const inner = marked.parse(body, { async: false, gfm: true, breaks: true }) as string
    return wrap(inner, unsub)
  }
  return wrap(`<div style="white-space:pre-wrap;">${escapeHtml(body)}</div>`, unsub)
}

/** Plain-text alternative so clients that block HTML still show something readable. */
export function renderEmailText(format: EmailFormat, body: string, unsub: string): string | undefined {
  if (format === "html") return undefined
  return `${body}

--
BSPrep · bsprep.in
Unsubscribe: ${unsub}`
}
