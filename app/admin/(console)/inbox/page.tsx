"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BadgeCheck, Loader2, Send, TriangleAlert, Upload } from "lucide-react"
import {
  MAX_RECIPIENTS,
  SENDING_DOMAIN,
  extractEmails,
  renderEmailHtml,
  unsubscribeUrl,
  type EmailFormat,
} from "@/lib/admin-email"

type DomainConfig = { configured: boolean; status: string; adminEmail: string }

const FORMATS: { id: EmailFormat; label: string }[] = [
  { id: "markdown", label: "Markdown" },
  { id: "html", label: "HTML" },
  { id: "text", label: "Plain text" },
]

const PLACEHOLDERS: Record<EmailFormat, string> = {
  markdown: "## Hello!\n\nWrite in **Markdown** — lists, links and headings all work.",
  html: "<h2>Hello!</h2>\n<p>Paste or write full HTML here.</p>",
  text: "Write a plain text message…",
}

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary"

function DomainBadge({ config }: { config: DomainConfig | null }) {
  if (!config) return <span className="text-xs text-muted-foreground">Checking domain…</span>
  if (!config.configured)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600">
        <TriangleAlert className="h-3.5 w-3.5" /> RESEND_API_KEY missing
      </span>
    )
  if (config.status === "verified")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <BadgeCheck className="h-3.5 w-3.5" /> {SENDING_DOMAIN} verified
      </span>
    )
  const label = config.status === "unknown" ? "status unavailable" : config.status.replace(/_/g, " ")
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">
      <TriangleAlert className="h-3.5 w-3.5" /> {SENDING_DOMAIN}: {label}
    </span>
  )
}

export default function AdminInboxPage() {
  const [config, setConfig] = useState<DomainConfig | null>(null)
  const [fromName, setFromName] = useState("BSPrep")
  const [fromLocal, setFromLocal] = useState("hello")
  const [replyTo, setReplyTo] = useState("")
  const [toText, setToText] = useState("")
  const [subject, setSubject] = useState("")
  const [format, setFormat] = useState<EmailFormat>("markdown")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/admin/inbox/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setConfig(d))
      .catch(() => setConfig({ configured: true, status: "unknown", adminEmail: "" }))
  }, [])

  const recipients = useMemo(() => extractEmails(toText), [toText])
  const html = useMemo(() => renderEmailHtml(format, body || PLACEHOLDERS[format], unsubscribeUrl(recipients[0] ?? "recipient@example.com")), [format, body, recipients])
  const tooMany = recipients.length > MAX_RECIPIENTS

  async function importFile(file: File) {
    const found = extractEmails(await file.text())
    if (found.length === 0) {
      setNotice({ tone: "error", text: `No email addresses found in ${file.name}` })
      return
    }
    setToText((prev) => extractEmails(`${prev}\n${found.join("\n")}`).join("\n"))
    setNotice({ tone: "ok", text: `Added ${found.length} address${found.length === 1 ? "" : "es"} from ${file.name}` })
  }

  async function send(to: string[]) {
    setSending(true)
    setNotice(null)
    try {
      const res = await fetch("/api/admin/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromName, fromLocal, replyTo, subject, format, body, to }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send")
      const partial = data.failed?.length ? ` ${data.failed.length} failed (${data.error}).` : ""
      const skipped = data.suppressed?.length ? ` Skipped ${data.suppressed.length} unsubscribed.` : ""
      setNotice({
        tone: data.failed?.length ? "error" : "ok",
        text: `Sent to ${data.sent} recipient${data.sent === 1 ? "" : "s"}.${skipped}${partial}`,
      })
    } catch (e) {
      setNotice({ tone: "error", text: e instanceof Error ? e.message : "Failed to send" })
    } finally {
      setSending(false)
    }
  }

  const ready = subject.trim() && body.trim() && fromLocal.trim() && !sending
  const canSend = ready && recipients.length > 0 && !tooMany && config?.configured !== false

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">Compose and send email from BSPrep. Each recipient gets their own copy.</p>
        </div>
        <DomainBadge config={config} />
      </header>

      {notice && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            notice.tone === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="space-y-5 rounded-2xl border border-border bg-card p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">From</label>
            <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
              <input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Display name" className={inputCls} suppressHydrationWarning />
              <div className="flex h-10 items-center rounded-lg border border-border bg-background focus-within:border-primary">
                <input
                  value={fromLocal}
                  onChange={(e) => setFromLocal(e.target.value.replace(/@.*/, "").replace(/\s/g, ""))}
                  placeholder="hello"
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                  suppressHydrationWarning
                />
                <span className="border-l border-border px-3 text-sm text-muted-foreground">@{SENDING_DOMAIN}</span>
              </div>
            </div>
            <input
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="Reply-to (optional)"
              className={`${inputCls} mt-2`}
              suppressHydrationWarning
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary"
              >
                <Upload className="h-3.5 w-3.5" /> Import CSV
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void importFile(f)
                  e.target.value = ""
                }}
              />
            </div>
            <textarea
              value={toText}
              onChange={(e) => setToText(e.target.value)}
              rows={4}
              placeholder="Paste addresses separated by commas, spaces or new lines"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary"
              suppressHydrationWarning
            />
            <p className={`mt-1 text-xs ${tooMany ? "text-rose-600" : "text-muted-foreground"}`}>
              {recipients.length} valid recipient{recipients.length === 1 ? "" : "s"}
              {tooMany ? ` — limit is ${MAX_RECIPIENTS} per send` : ""}. Anything that isn&apos;t an email is ignored.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} suppressHydrationWarning />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Message</label>
              <div className="flex rounded-lg bg-muted p-0.5">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      format === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder={PLACEHOLDERS[format]}
              spellCheck={format === "text"}
              className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary ${
                format === "text" ? "" : "font-mono"
              }`}
              suppressHydrationWarning
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!canSend}
              onClick={() => {
                if (window.confirm(`Send to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}?`)) void send(recipients)
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send{recipients.length > 0 ? ` to ${recipients.length}` : ""}
            </button>
            <button
              type="button"
              disabled={!ready || !config?.adminEmail || config?.configured === false}
              onClick={() => void send([config!.adminEmail])}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send test to me
            </button>
          </div>
        </section>

        <section className="flex min-h-[28rem] flex-col rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Preview</h2>
          </div>
          <div className="mb-3 space-y-0.5 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <p>
              <span className="text-muted-foreground">From:</span> {fromName ? `${fromName} ` : ""}&lt;{fromLocal || "…"}@{SENDING_DOMAIN}&gt;
            </p>
            <p className="truncate">
              <span className="text-muted-foreground">To:</span> {recipients.length ? recipients.slice(0, 2).join(", ") + (recipients.length > 2 ? ` +${recipients.length - 2} more` : "") : "—"}
            </p>
            <p className="truncate">
              <span className="text-muted-foreground">Subject:</span> <span className="text-foreground">{subject || "—"}</span>
            </p>
          </div>
          {/* sandboxed with no permissions: previewed HTML can't run scripts or reach the admin page */}
          <iframe title="Email preview" sandbox="" srcDoc={html} className="min-h-[22rem] w-full flex-1 rounded-lg border border-border bg-card" />
        </section>
      </div>
    </div>
  )
}
