/**
 * Send the "We've updated BSPrep" email through Resend.
 *
 *   node scripts/send-update-email.mjs --test you@gmail.com     one test message
 *   node scripts/send-update-email.mjs --dry-run                count recipients, send nothing
 *   node scripts/send-update-email.mjs --all                    send to every student who has not unsubscribed
 *   node scripts/send-update-email.mjs --all --start 100        resume from recipient 100 (useful under a daily cap)
 *   node scripts/send-update-email.mjs --all --limit 100        send at most 100 this run
 *
 * Reads RESEND_API_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Each recipient gets their own message with a signed unsubscribe link, same as the admin inbox.
 */
import { createHmac } from "node:crypto"
import { readFileSync } from "node:fs"

// ── Config ───────────────────────────────────────────────────────────────────
const FROM = "BSPrep <updates@bsprep.in>"
const REPLY_TO = "contact@bsprep.in" // replies land here; change if updates@ has its own inbox
const SUBJECT = "We've updated BSPrep: a new look, a cleaner dashboard and more"
const ONLY_ROLE = "student"
const SITE_URL = "https://bsprep.in"
const TEMPLATE = new URL("../emails/launch-announcement.html", import.meta.url)

const TEXT = (unsub) => `Hi there,

It has been a busy few weeks at BSPrep. We have updated our UI, redesigned the website and improved a lot of things behind the scenes, all to make preparing for IITM BS simpler.

What we updated
1. A redesigned website: ${SITE_URL}
2. A cleaner dashboard: ${SITE_URL}/dashboard
3. A better compiler: ${SITE_URL}/compiler
4. Handier tools: GPA calculator and predictor, plus faster doubt replies

We would love your feedback. Just reply to this email with anything: a feature you would like, something that would make your IITM BS degree easier, a course you want us to add, or any other way we can help.

We are also hiring. Developer and mentor roles are paid, and we have internships in curriculum, marketing and design: ${SITE_URL}/careers

Thank you for being part of this.
The BSPrep team

--
BSPrep | ${SITE_URL}
Unsubscribe: ${unsub}`

// ── Env ──────────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]
    }),
)
const need = (k) => env[k] || process.env[k] || (console.error(`Missing ${k} in .env.local`), process.exit(1))
const RESEND_KEY = need("RESEND_API_KEY")
const SECRET = env.UNSUBSCRIBE_SECRET || process.env.UNSUBSCRIBE_SECRET || need("SUPABASE_SERVICE_ROLE_KEY")

// ── Helpers ──────────────────────────────────────────────────────────────────
const sign = (email) => createHmac("sha256", SECRET).update(email.trim().toLowerCase()).digest("base64url")
const query = (email) => `e=${encodeURIComponent(email)}&t=${sign(email)}`
const unsubUrl = (email) => `${SITE_URL}/unsubscribe?${query(email)}`
const oneClickUrl = (email) => `${SITE_URL}/api/unsubscribe?${query(email)}`
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const template = readFileSync(TEMPLATE, "utf8")
const message = (to) => ({
  from: FROM,
  to: [to],
  reply_to: REPLY_TO,
  subject: SUBJECT,
  html: template.split("{{unsubscribe_url}}").join(escapeHtml(unsubUrl(to))),
  text: TEXT(unsubUrl(to)),
  headers: {
    "List-Unsubscribe": `<${oneClickUrl(to)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  },
})

async function rest(path) {
  const base = need("NEXT_PUBLIC_SUPABASE_URL")
  const key = need("SUPABASE_SERVICE_ROLE_KEY")
  const out = []
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${base}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + 999}` },
    })
    if (!res.ok) throw new Error(`Supabase ${path.split("?")[0]} responded ${res.status}`)
    const rows = await res.json()
    out.push(...rows)
    if (rows.length < 1000) return out
  }
}

async function recipients() {
  const profiles = await rest(`profiles?select=email,role&email=not.is.null&role=eq.${ONLY_ROLE}`)
  let suppressed = new Set()
  try {
    suppressed = new Set((await rest("email_unsubscribes?select=email")).map((r) => r.email.toLowerCase()))
  } catch (e) {
    console.warn("Could not read email_unsubscribes (has scripts/023_create_email_unsubscribes.sql been run?). Continuing without it.")
  }
  const all = [...new Set(profiles.map((p) => p.email.trim().toLowerCase()).filter(Boolean))].sort()
  return { list: all.filter((e) => !suppressed.has(e)), suppressed: all.length - all.filter((e) => !suppressed.has(e)).length }
}

async function send(batch) {
  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(batch),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Resend responded ${res.status}`)
  return body
}

// ── Run ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const flag = (n) => args.indexOf(n)
const value = (n) => (flag(n) >= 0 ? args[flag(n) + 1] : undefined)

if (flag("--test") >= 0) {
  const to = value("--test")
  if (!to || !to.includes("@")) (console.error("Usage: --test you@gmail.com"), process.exit(1))
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(message(to.toLowerCase())),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) (console.error("Failed:", body?.message || res.status), process.exit(1))
  console.log(`Test sent to ${to}. Resend id: ${body.id}`)
} else if (flag("--dry-run") >= 0 || flag("--all") >= 0) {
  const { list, suppressed } = await recipients()
  const start = Number(value("--start") ?? 0)
  const limit = Number(value("--limit") ?? list.length)
  const slice = list.slice(start, start + limit)
  console.log(`${list.length} students can receive this (${suppressed} unsubscribed and skipped).`)
  if (flag("--dry-run") >= 0) {
    console.log(`Dry run: would send ${slice.length} message(s) from recipient ${start}. Nothing was sent.`)
  } else {
    let sent = 0
    for (let i = 0; i < slice.length; i += 100) {
      if (i > 0) await sleep(700)
      const batch = slice.slice(i, i + 100)
      await send(batch.map(message))
      sent += batch.length
      console.log(`Sent ${sent}/${slice.length}`)
    }
    console.log(`Done. Next run can resume with --start ${start + sent}.`)
  }
} else {
  console.log("Use --test <email>, --dry-run or --all. See the comment at the top of this file.")
}
