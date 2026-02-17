# Security Implementation Guide

## Overview
This document outlines the security measures implemented in the IITM BS platform to protect against common web vulnerabilities and attacks.

## Security Features Implemented

### 1. Rate Limiting
**Location:** `lib/rate-limit.ts`, `proxy.ts`

Rate limiting prevents abuse by limiting the number of requests from a single IP address:

- **API Routes:** 60 requests per minute
- **Authentication:** 5 attempts per 15 minutes
- **Enrollment:** 3 enrollments per minute
- **Write Operations:** 10 requests per minute

**How it works:**
- Uses in-memory storage for development
- For production, consider using Redis or Upstash for distributed rate limiting
- Returns 429 (Too Many Requests) when limit is exceeded
- Includes rate limit headers in responses

### 2. Security Headers
**Location:** `lib/security/headers.ts`, `next.config.mjs`, `proxy.ts`

Security headers protect against various attacks:

- **X-Frame-Options:** Prevents clickjacking attacks
- **X-Content-Type-Options:** Prevents MIME type sniffing
- **X-XSS-Protection:** Enables browser XSS protection
- **Content-Security-Policy:** Restricts resource loading
- **Strict-Transport-Security (HSTS):** Enforces HTTPS
- **Referrer-Policy:** Controls referrer information
- **Permissions-Policy:** Restricts browser features

### 3. Input Validation & Sanitization
**Location:** `lib/security/validation.ts`

All user inputs are validated and sanitized:

- **Email validation:** Regex pattern matching
- **URL validation:** Only allows http/https protocols
- **Username validation:** 3-30 alphanumeric characters
- **SQL injection detection:** Pattern matching
- **XSS prevention:** HTML entity encoding
- **UUID validation:** Proper UUID format checking

### 4. Authentication & Authorization
**Location:** All API routes

- User authentication verified on every API call
- Role-based access control (RBAC) for admin endpoints
- User can only access/modify their own data
- JWT tokens managed by Supabase

### 5. Request Size Limits

Different limits for different endpoints:
- **Announcements:** 10KB
- **Enrollment:** 1KB
- **Profile updates:** 50KB

Prevents DoS attacks through large payloads.

### 6. CSRF Protection

- Supabase handles CSRF tokens automatically
- All state-changing operations require authentication
- Same-origin policy enforced

### 7. Database Security

**Supabase Row Level Security (RLS):**
- Users can only read their own profile data
- Enrollment records are user-specific
- Announcements are read-only for non-admins

**Best Practices:**
- Parameterized queries (handled by Supabase)
- No raw SQL injections possible
- Prepared statements for all queries

## Security Checklist

### Before Deployment

- [ ] Enable Supabase RLS policies on all tables
- [ ] Set up proper authentication rules
- [ ] Configure CORS for production domains
- [ ] Use Redis/Upstash for production rate limiting
- [ ] Enable HTTPS only (disable HTTP)
- [ ] Set secure environment variables
- [ ] Review and update CSP headers
- [ ] Test rate limiting thoroughly
- [ ] Enable logging and monitoring
- [ ] Set up error tracking (Sentry)

### Environment Variables

Required (add to `.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Optional for production:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production
```

### Supabase Security Settings

1. **Enable Row Level Security (RLS):**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE user_profiles_extended ENABLE ROW LEVEL SECURITY;
   ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
   ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
   
   -- User profiles - users can only read/update their own
   CREATE POLICY "Users can view own profile"
     ON user_profiles_extended FOR SELECT
     USING (auth.uid() = id);
   
   CREATE POLICY "Users can update own profile"
     ON user_profiles_extended FOR UPDATE
     USING (auth.uid() = id);
   
   -- Enrollments - users can only see their own
   CREATE POLICY "Users can view own enrollments"
     ON enrollments FOR SELECT
     USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can create enrollments"
     ON enrollments FOR INSERT
     WITH CHECK (auth.uid() = user_id);
   
   -- Courses - public read access
   CREATE POLICY "Anyone can view courses"
     ON courses FOR SELECT
     TO public
     USING (true);
   
   -- Announcements - public read, admin write
   CREATE POLICY "Anyone can view announcements"
     ON announcements FOR SELECT
     TO public
     USING (true);
   
   CREATE POLICY "Admins can create announcements"
     ON announcements FOR INSERT
     TO authenticated
     USING (
       EXISTS (
         SELECT 1 FROM user_profiles_extended
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

2. **Configure Auth Settings:**
   - Enable email confirmation
   - Set password requirements (min 8 characters)
   - Enable multi-factor authentication (optional)
   - Set session timeout appropriately

3. **Storage Security:**
   - Enable RLS on storage buckets
   - Restrict file types and sizes
   - Scan uploads for malware (if possible)

## Common Vulnerabilities Addressed

### ✅ SQL Injection
- All queries use Supabase parameterized queries
- Additional pattern detection in validation layer

### ✅ XSS (Cross-Site Scripting)
- Input sanitization with HTML entity encoding
- CSP headers restrict script execution
- React's built-in XSS protection

### ✅ CSRF (Cross-Site Request Forgery)
- Supabase handles CSRF tokens
- Same-origin policy enforced
- Authentication required for state changes

### ✅ Clickjacking
- X-Frame-Options: DENY
- CSP frame-ancestors directive

### ✅ DDoS/Brute Force
- Rate limiting on all endpoints
- Stricter limits on auth endpoints
- IP-based throttling

### ✅ Information Disclosure
- Generic error messages to users
- Detailed errors only in server logs
- No stack traces in production

### ✅ Insecure Direct Object References
- User can only access their own resources
- UUID validation
- Authorization checks on every request

## Monitoring & Logging

### Recommended Setup:

1. **Error Tracking:**
   - Use Sentry or similar service
   - Track API errors and security violations

2. **Rate Limit Monitoring:**
   - Log rate limit violations
   - Alert on suspicious patterns

3. **Authentication Monitoring:**
   - Track failed login attempts
   - Alert on multiple failures from same IP

4. **Security Audit Log:**
   - Log all admin actions
   - Track profile changes
   - Monitor enrollment patterns

## Production Upgrade Path

### Rate Limiting with Redis:

```typescript
// Replace in-memory store with Redis
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export class RateLimiter {
  async check(identifier: string) {
    const key = `rate-limit:${identifier}`
    const count = await redis.incr(key)
    
    if (count === 1) {
      await redis.expire(key, this.config.interval / 1000)
    }
    
    return {
      success: count <= this.config.maxRequests,
      // ... rest of response
    }
  }
}
```

## Security Updates

This security implementation should be reviewed and updated:
- Monthly for dependency updates
- When new vulnerabilities are discovered
- Before major feature releases
- After security audits

## Contact

For security issues, please contact the security team immediately.

**DO NOT** create public GitHub issues for security vulnerabilities.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
