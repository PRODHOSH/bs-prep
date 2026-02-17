// Simple in-memory rate limiter
// For production, use Redis or Upstash for distributed rate limiting

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max number of unique tokens
  maxRequests: number // Max requests per interval
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async check(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const key = identifier

    // Clean up old entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })

    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + this.config.interval
      }
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        reset: store[key].resetTime
      }
    }

    if (store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + this.config.interval
      }
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        reset: store[key].resetTime
      }
    }

    if (store[key].count >= this.config.maxRequests) {
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset: store[key].resetTime
      }
    }

    store[key].count++
    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - store[key].count,
      reset: store[key].resetTime
    }
  }
}

// Pre-configured rate limiters
export const apiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  maxRequests: 60 // 60 requests per minute
})

export const authRateLimiter = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
  maxRequests: 5 // 5 login attempts per 15 minutes
})

export const enrollmentRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  maxRequests: 3 // 3 enrollments per minute
})

export const writeRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  maxRequests: 10 // 10 write operations per minute
})
