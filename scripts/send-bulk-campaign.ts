/**
 * Send the May 2026 marketing email to all students via Resend.
 *
 * How to run:
 *   DRY RUN first (no emails sent, just shows who would receive it):
 *     npx tsx scripts/send-bulk-campaign.ts --dry-run
 *
 *   Send to students only:
 *     npx tsx scripts/send-bulk-campaign.ts
 *
 *   Send to a single test email first:
 *     npx tsx scripts/send-bulk-campaign.ts --test you@gmail.com
 *
 * Resend batch API sends up to 100 emails per call.
 * 71 emails = 1 single batch call.
 *
 * OPTION A — Use template ID from Resend dashboard (recommended):
 *   Set RESEND_TEMPLATE_ID in your .env
 *
 * OPTION B — Send raw HTML directly (template ID not needed):
 *   The HTML from emails/may-2026-term.html is used automatically.
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// ── Config ──────────────────────────────────────────────────────────────────

const FROM_NAME    = "BSPrep"
const FROM_EMAIL   = "noreply@bsprep.in"          // must be a verified Resend domain
const SUBJECT      = "Your May 2026 Qualifier prep starts here — BSPrep"
const ONLY_ROLE    = "student"                     // set to null to include all roles
const RESEND_KEY   = process.env.RESEND_API_KEY!
const TEMPLATE_ID  = process.env.RESEND_TEMPLATE_ID ?? null  // from Resend dashboard (optional)

// ── Supabase ─────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string | null
}

type ResendPayload = {
  from: string
  to: string[]
  subject: string
  html?: string
  template_id?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchStudentEmails(): Promise<Profile[]> {
  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role")
    .not("email", "is", null)
    .neq("email", "")

  if (ONLY_ROLE) query = query.eq("role", ONLY_ROLE)

  const { data, error } = await query
  if (error) throw new Error(`Supabase error: ${error.message}`)
  return (data ?? []) as Profile[]
}

function loadHtmlTemplate(): string {
  const filePath = path.join(process.cwd(), "emails", "may-2026-term.html")
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template not found at ${filePath}`)
  }
  return fs.readFileSync(filePath, "utf-8")
}

async function sendBatch(payloads: ResendPayload[]): Promise<void> {
  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payloads),
  })

  const body = await res.json()

  if (!res.ok) {
    console.error("Resend API error:", JSON.stringify(body, null, 2))
    throw new Error(`Resend batch failed: ${res.status}`)
  }

  console.log(`Batch sent. Response:`, JSON.stringify(body, null, 2))
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes("--dry-run")
  const testIndex = args.indexOf("--test")
  const testEmail = testIndex !== -1 ? args[testIndex + 1] : null

  if (!RESEND_KEY) {
    console.error("RESEND_API_KEY is missing from .env")
    process.exit(1)
  }

  // Load HTML template (if not using Resend template ID)
  let html: string | undefined
  if (!TEMPLATE_ID) {
    console.log("No RESEND_TEMPLATE_ID set — loading HTML from emails/may-2026-term.html")
    html = loadHtmlTemplate()
  } else {
    console.log(`Using Resend template ID: ${TEMPLATE_ID}`)
  }

  // Single test send
  if (testEmail) {
    console.log(`\nSending test email to: ${testEmail}`)
    const payload: ResendPayload = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [testEmail],
      subject: `[TEST] ${SUBJECT}`,
      ...(TEMPLATE_ID ? { template_id: TEMPLATE_ID } : { html }),
    }
    await sendBatch([payload])
    console.log("Test email sent.")
    return
  }

  // Fetch recipients
  console.log(`\nFetching ${ONLY_ROLE ?? "all"} profiles from Supabase...`)
  const profiles = await fetchStudentEmails()

  if (profiles.length === 0) {
    console.log("No profiles found. Nothing to send.")
    return
  }

  console.log(`Found ${profiles.length} recipients:`)
  profiles.forEach((p, i) => {
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "—"
    console.log(`  ${String(i + 1).padStart(3)}. ${p.email}  (${name})`)
  })

  if (isDryRun) {
    console.log(`\nDRY RUN: No emails sent. Remove --dry-run to send for real.`)
    return
  }

  // Confirm before sending
  console.log(`\nAbout to send ${profiles.length} emails via Resend.`)
  console.log(`Subject: "${SUBJECT}"`)
  console.log(`From: ${FROM_NAME} <${FROM_EMAIL}>`)
  console.log("\nPress Ctrl+C within 5 seconds to cancel...")
  await new Promise((r) => setTimeout(r, 5000))

  // Build payloads — Resend batch max is 100 per call
  const BATCH_SIZE = 100
  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const chunk = profiles.slice(i, i + BATCH_SIZE)
    const payloads: ResendPayload[] = chunk.map((p) => ({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [p.email],
      subject: SUBJECT,
      ...(TEMPLATE_ID ? { template_id: TEMPLATE_ID } : { html }),
    }))

    console.log(`\nSending batch ${Math.floor(i / BATCH_SIZE) + 1}: emails ${i + 1}–${i + chunk.length}...`)
    await sendBatch(payloads)

    // Small delay between batches (only matters if > 100 total)
    if (i + BATCH_SIZE < profiles.length) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  console.log(`\nDone. ${profiles.length} emails sent.`)
}

main().catch((err) => {
  console.error("Fatal error:", err.message)
  process.exit(1)
})
