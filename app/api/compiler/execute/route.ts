import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

type RequestLanguage = "java" | "c" | "cpp"

type PaizaLanguage = "java" | "c" | "cpp"

const PAIZA_API_BASE = "https://api.paiza.io"
const MAX_CODE_LENGTH = 100_000
const MAX_STDIN_LENGTH = 20_000
const POLL_INTERVAL_MS = 350
const MAX_POLL_ATTEMPTS = 24

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const real = request.headers.get("x-real-ip")?.trim()
  const cf = request.headers.get("cf-connecting-ip")?.trim()
  const ip = forwarded || real || cf

  if (!ip || ip.toLowerCase() === "unknown") {
    return null
  }

  return ip
}

function toStringField(input: unknown): string {
  return typeof input === "string" ? input : ""
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toPaizaLanguage(language: RequestLanguage): PaizaLanguage {
  if (language === "java") return "java"
  if (language === "c") return "c"
  return "cpp"
}

async function createPaizaJob(params: {
  language: PaizaLanguage
  code: string
  stdin: string
  apiKey: string
}) {
  const body = new URLSearchParams({
    source_code: params.code,
    language: params.language,
    input: params.stdin,
    api_key: params.apiKey,
  })

  const response = await fetch(`${PAIZA_API_BASE}/runners/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    cache: "no-store",
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(text || "Execution provider rejected create request")
  }

  return response.json() as Promise<{ id?: string; error?: string }>
}

async function getPaizaJobResult(id: string, apiKey: string) {
  const query = new URLSearchParams({ id, api_key: apiKey })

  const response = await fetch(`${PAIZA_API_BASE}/runners/get_details?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(text || "Execution provider rejected status request")
  }

  return response.json() as Promise<{
    status?: string
    build_stdout?: string | null
    build_stderr?: string | null
    stdout?: string | null
    stderr?: string | null
    result?: string | null
    error?: string | null
  }>
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (ip) {
      const rl = await checkRateLimit(ip, {
        maxRequests: 240,
        windowMs: 60 * 1000,
        keyPrefix: "compiler-exec",
      })

      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Too many run requests. Please retry in a moment." },
          { status: 429, headers: getRateLimitHeaders(rl) },
        )
      }
    }

    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    const languageRaw = toStringField(body.language).toLowerCase()
    const code = toStringField(body.code)
    const stdin = toStringField(body.stdin)

    if (languageRaw !== "java" && languageRaw !== "c" && languageRaw !== "cpp") {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 })
    }

    if (!code.trim()) {
      return NextResponse.json({ error: "No code to execute" }, { status: 400 })
    }

    if (code.length > MAX_CODE_LENGTH) {
      return NextResponse.json({ error: "Code is too large" }, { status: 413 })
    }

    if (stdin.length > MAX_STDIN_LENGTH) {
      return NextResponse.json({ error: "Input is too large" }, { status: 413 })
    }

    const apiKey = process.env.PAIZA_API_KEY || "guest"
    const language = toPaizaLanguage(languageRaw)

    const create = await createPaizaJob({
      language,
      code,
      stdin,
      apiKey,
    })

    if (create.error) {
      return NextResponse.json({ error: create.error }, { status: 502 })
    }

    if (!create.id) {
      return NextResponse.json({ error: "Execution provider did not return a job id" }, { status: 502 })
    }

    let details: {
      status?: string
      build_stdout?: string | null
      build_stderr?: string | null
      stdout?: string | null
      stderr?: string | null
      result?: string | null
      error?: string | null
    } | null = null

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      details = await getPaizaJobResult(create.id, apiKey)

      if (details.error) {
        return NextResponse.json({ error: details.error }, { status: 502 })
      }

      if (details.status && details.status !== "running") {
        break
      }

      await wait(POLL_INTERVAL_MS)
    }

    if (!details || details.status === "running") {
      return NextResponse.json(
        { error: "Execution timed out on provider. Please try again." },
        { status: 504 },
      )
    }

    const stdout = [details.build_stdout, details.stdout]
      .filter((value): value is string => Boolean(value && value.length > 0))
      .join("")

    const stderr = [details.build_stderr, details.stderr]
      .filter((value): value is string => Boolean(value && value.length > 0))
      .join("\n")

    return NextResponse.json({
      stdout,
      stderr,
    })
  } catch (error) {
    console.error("Compiler execute API error:", error)
    return NextResponse.json({ error: "Failed to execute code" }, { status: 500 })
  }
}
