import { updateSession } from "@/lib/supabase/proxy"
import type { NextRequest } from "next/server"
import { NextResponse } from 'next/server'
import { addSecurityHeaders, getRateLimitHeaders } from './lib/security/headers'

// Simple in-memory rate limiter for middleware (edge-compatible)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded ? forwarded.split(',')[0].trim() : (realIp || 'unknown')
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const record = rateLimit.get(key)

  for (const [k, v] of rateLimit.entries()) {
    if (v.resetTime < now) rateLimit.delete(k)
  }

  if (!record || record.resetTime < now) {
    const resetTime = now + windowMs
    rateLimit.set(key, { count: 1, resetTime })
    return { allowed: true, limit: maxRequests, remaining: maxRequests - 1, reset: resetTime }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, limit: maxRequests, remaining: 0, reset: record.resetTime }
  }

  record.count++
  return { allowed: true, limit: maxRequests, remaining: maxRequests - record.count, reset: record.resetTime }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const key = getRateLimitKey(request)

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    let maxRequests = 60
    let windowMs = 60 * 1000

    if (pathname.includes('/auth/')) {
      maxRequests = 5
      windowMs = 15 * 60 * 1000
    } else if (pathname.includes('/enroll') || pathname.includes('/account/delete')) {
      maxRequests = 3
      windowMs = 60 * 1000
    } else if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      maxRequests = 10
      windowMs = 60 * 1000
    }

    const rateCheck = checkRateLimit(key, maxRequests, windowMs)
    if (!rateCheck.allowed) {
      const response = NextResponse.json(
        { error: 'Too many requests', message: 'Please try again later' },
        { status: 429 }
      )
      const headers = getRateLimitHeaders(rateCheck.limit, rateCheck.remaining, rateCheck.reset)
      Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v))
      return addSecurityHeaders(response)
    }
  }

  // Refresh session
  const response = await updateSession(request)
  const securedResponse = addSecurityHeaders(response)

  // Add rate limit headers to API responses
  if (pathname.startsWith('/api/')) {
    const rateCheck = checkRateLimit(key, 60, 60_000)
    const headers = getRateLimitHeaders(rateCheck.limit, rateCheck.remaining, rateCheck.reset)
    Object.entries(headers).forEach(([k, v]) => securedResponse.headers.set(k, v))
  }

  return securedResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
