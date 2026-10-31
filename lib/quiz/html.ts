// The paper data comes from a third party and contains raw HTML. Everything shown to a student goes
// through this allowlist first: a few formatting tags, images from one known host, no attributes.

const ALLOWED_TAGS = new Set(["b", "strong", "i", "em", "u", "sub", "sup", "br", "p", "div", "span", "ul", "ol", "li", "code", "pre", "table", "thead", "tbody", "tr", "td", "th"])
const VOID_TAGS = new Set(["br"])
const IMAGE_HOSTS = new Set(["saram.blr1.cdn.digitaloceanspaces.com"])

const ENTITIES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'" }

const decode = (s: string) => s.replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (_, e: string) => ENTITIES[e] ?? "")
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export function safeImageUrl(url: unknown): string | null {
  if (typeof url !== "string") return null
  try {
    const u = new URL(url)
    if (u.protocol !== "https:" || !IMAGE_HOSTS.has(u.hostname)) return null
    // The dataset links option images under /app/, which the CDN refuses. The same files are public without it.
    u.pathname = u.pathname.replace(/^\/app\//, "/")
    return u.toString()
  } catch {
    return null
  }
}

const TOKEN = /<\/?[a-zA-Z][^<>]*>|[^<]+|</g

/** Returns safe HTML. Unknown tags are dropped but their text is kept. */
export function safeHtml(input: string | null | undefined): string {
  if (!input) return ""
  const out: string[] = []
  const open: string[] = []
  let skipping: string | null = null // inside <script> or <style>: drop the text as well
  for (const token of input.match(TOKEN) ?? []) {
    if (skipping) {
      if (token.toLowerCase().startsWith(`</${skipping}`)) skipping = null
      continue
    }
    if (token[0] !== "<" || token.length === 1) {
      out.push(escape(decode(token)))
      continue
    }
    const m = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^<>]*)>$/.exec(token)
    if (!m) continue
    const closing = m[1] === "/"
    const tag = m[2].toLowerCase()

    if (tag === "img" && !closing) {
      const src = /\ssrc\s*=\s*(?:'([^']*)'|"([^"]*)")/i.exec(m[3])
      const url = safeImageUrl(src?.[1] ?? src?.[2])
      if (url) out.push(`<img src="${url}" alt="" loading="lazy" referrerpolicy="no-referrer">`)
      continue
    }
    if ((tag === "script" || tag === "style") && !closing) {
      skipping = tag
      continue
    }
    if (!ALLOWED_TAGS.has(tag)) continue
    if (VOID_TAGS.has(tag)) {
      if (!closing) out.push(`<${tag}>`)
      continue
    }
    if (closing) {
      const at = open.lastIndexOf(tag)
      if (at === -1) continue
      // close anything left open inside it first, so the output is always well nested
      while (open.length > at) out.push(`</${open.pop()}>`)
    } else {
      open.push(tag)
      out.push(`<${tag}>`)
    }
  }
  while (open.length) out.push(`</${open.pop()}>`)
  return out.join("").replace(/(<br>\s*){3,}/g, "<br><br>").trim()
}

/** True when there is nothing visible: no text and no image. */
export const isBlank = (html: string) => !/<img\b/.test(html) && html.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "") === ""
