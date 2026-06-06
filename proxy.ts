import { updateSession } from "@/lib/supabase/proxy"
import type { NextRequest } from "next/server"
import { NextResponse } from 'next/server'
import { addSecurityHeaders, getRateLimitHeaders } from './lib/security/headers'

// Simple in-memory rate limiter for proxy
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0].trim() : (realIp || 'unknown')
  return ip
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): {
  allowed: boolean; limit: number; remaining: number; reset: number
} {
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── API routes: rate-limit only, no Supabase (handlers do their own auth) ──
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request)
    let maxRequests = 600
    let windowMs = 60_000

    if (pathname.includes('/auth/') || pathname.startsWith('/api/account/') || pathname.startsWith('/api/profile')) {
      maxRequests = 60; windowMs = 15 * 60_000
    } else if (pathname.startsWith('/api/payment/webhook')) {
      maxRequests = 300
    } else if (pathname.startsWith('/api/compiler/execute')) {
      maxRequests = 240
    } else if (pathname.startsWith('/api/payment/')) {
      maxRequests = 120
    } else if (pathname.startsWith('/api/enroll')) {
      maxRequests = 10
    } else if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      maxRequests = 200
    }

    const rateCheck = checkRateLimit(key, maxRequests, windowMs)
    if (!rateCheck.allowed) {
      const res = NextResponse.json({ error: 'Too many requests', message: 'Please try again later' }, { status: 429 })
      const headers = getRateLimitHeaders(rateCheck.limit, rateCheck.remaining, rateCheck.reset)
      Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v))
      return addSecurityHeaders(res, request)
    }

    const res = NextResponse.next({ request })
    const headers = getRateLimitHeaders(rateCheck.limit, rateCheck.remaining, rateCheck.reset)
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v))
    return addSecurityHeaders(res, request)
  }

  // ── Routes that need a Supabase session check ──
  const needsAuth =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/mentor') ||
    pathname.startsWith('/dashboard')

  if (!needsAuth) {
    // Public pages: zero Supabase calls — instant response
    return addSecurityHeaders(NextResponse.next({ request }), request)
  }

  // ── Protected routes: one Supabase session call ──
  const { response, user } = await updateSession(request)

  if (pathname.startsWith('/dashboard/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/users'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/signin') {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/signin'
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/mentor') && pathname !== '/mentor/signin') {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/mentor/signin'
      return NextResponse.redirect(url)
    }
  }

  return addSecurityHeaders(response, request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
