// Input validation and sanitization utilities

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  return sanitized
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateUsername(username: string): boolean {
  // 3-30 characters, alphanumeric, hyphens, underscores
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}

export function sanitizeHtml(input: string): string {
  // Basic HTML entity encoding to prevent XSS
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })
  
  return {
    valid: missing.length === 0,
    missing
  }
}

export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export function validateJsonSize(jsonString: string, maxSizeKB: number = 100): boolean {
  const sizeInKB = new Blob([jsonString]).size / 1024
  return sizeInKB <= maxSizeKB
}

export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and special characters
  return filename
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255)
}

// SQL injection prevention (additional layer, Supabase already handles this)
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /('|(\\')|(\\";)|(%27)|(%3B)|(%00))/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

// XSS pattern detection
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

export function validateAndSanitizeInput(input: string, maxLength: number = 1000): {
  valid: boolean
  sanitized: string
  errors: string[]
} {
  const errors: string[] = []
  
  if (typeof input !== 'string') {
    errors.push('Input must be a string')
    return { valid: false, sanitized: '', errors }
  }
  
  if (containsSqlInjection(input)) {
    errors.push('Potential SQL injection detected')
  }
  
  if (containsXss(input)) {
    errors.push('Potential XSS attack detected')
  }
  
  const sanitized = sanitizeString(input, maxLength)
  
  return {
    valid: errors.length === 0,
    sanitized,
    errors
  }
}
