import { readFileSync } from 'fs'
import { createSign } from 'crypto'

type ServiceAccountKey = {
  client_email: string
  private_key: string
  token_uri: string
}

function normalizeEnvJson(raw: string): string {
  const trimmed = raw.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

function parseInlineServiceAccount(raw: string): ServiceAccountKey | null {
  const normalized = normalizeEnvJson(raw)

  // Direct JSON object string.
  if (normalized.startsWith('{') && normalized.endsWith('}')) {
    return JSON.parse(normalized) as ServiceAccountKey
  }

  // JSON-stringified JSON object string.
  const once = JSON.parse(normalized)
  if (typeof once === 'string') {
    const nested = once.trim()
    if (nested.startsWith('{') && nested.endsWith('}')) {
      return JSON.parse(nested) as ServiceAccountKey
    }
  }

  return null
}

/**
 * Load Google service account credentials.
 *
 * Priority:
 *  1. GOOGLE_APPLICATION_CREDENTIALS env var (path to a JSON file)
 *  2. GOOGLE_SERVICE_ACCOUNT_KEY env var (single-line JSON string)
 *
 * This project intentionally avoids hardcoded file fallbacks so deployments
 * fail with explicit configuration errors rather than ENOENT file-system errors.
 */
function loadServiceAccountKey(): ServiceAccountKey {
  // 1. Try a file-path env var first (most explicit)
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credPath) {
    try {
      const raw = readFileSync(credPath, 'utf-8')
      return JSON.parse(raw)
    } catch (error) {
      throw new Error(
        `Invalid GOOGLE_APPLICATION_CREDENTIALS path or JSON at ${credPath}. ` +
          `Provide a valid service-account JSON file path. Original error: ${String(error)}`,
      )
    }
  }

  // 2. Try the inline env var (only works when set as a single-line JSON)
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim()
  if (inline) {
    try {
      const parsed = parseInlineServiceAccount(inline)
      if (parsed) {
        return parsed
      }
    } catch (error) {
      throw new Error(
        `GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON. ` +
          `Set it as a single-line JSON string (quoted or unquoted is fine). Original error: ${String(error)}`,
      )
    }
  }

  // 3. Base64-encoded JSON credentials (safer for env transports)
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64?.trim()
  if (base64) {
    try {
      const decoded = Buffer.from(base64, 'base64').toString('utf-8')
      const parsed = parseInlineServiceAccount(decoded)
      if (parsed) {
        return parsed
      }

      throw new Error('Decoded base64 value is not a JSON service-account object')
    } catch (error) {
      throw new Error(
        `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 is not valid base64 JSON. Original error: ${String(error)}`,
      )
    }
  }

  // 4. Split env vars for environments where JSON is hard to store.
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim()
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY?.trim()
  if (clientEmail && privateKeyRaw) {
    return {
      client_email: clientEmail,
      private_key: privateKeyRaw.replace(/\\n/g, '\n'),
      token_uri: process.env.GOOGLE_TOKEN_URI?.trim() || 'https://oauth2.googleapis.com/token',
    }
  }

  throw new Error(
    "Google credentials are missing. Set GOOGLE_APPLICATION_CREDENTIALS (path), GOOGLE_SERVICE_ACCOUNT_KEY (single-line JSON), GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY.",
  )
}

/**
 * Obtain a short-lived Google OAuth2 access token via service-account JWT flow.
 * The private key NEVER leaves the server.
 */
export async function getGoogleAccessToken(scopes: string[]): Promise<string> {
  const key = loadServiceAccountKey()

  const tokenUri = key.token_uri ?? 'https://oauth2.googleapis.com/token'

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: key.client_email,
    sub: key.client_email,
    scope: scopes.join(' '),
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  }

  const b64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')

  const toSign = `${b64url(header)}.${b64url(payload)}`

  const sign = createSign('RSA-SHA256')
  sign.update(toSign)
  const signature = sign.sign(key.private_key, 'base64url')
  const jwt = `${toSign}.${signature}`

  const tokenRes = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`Google OAuth token error: ${err}`)
  }

  const json = (await tokenRes.json()) as { access_token: string }
  return json.access_token
}
