// Environment variable validation
// Run this at application startup to ensure all required env vars are set

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
}

export function validateEnvironment(): EnvConfig {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ] as const

  const missing: string[] = []
  const config: Partial<EnvConfig> = {}

  for (const varName of requiredEnvVars) {
    const value = process.env[varName]
    
    if (!value) {
      missing.push(varName)
    } else {
      config[varName] = value
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      'Please check your .env.local file.'
    )
  }

  // Validate Supabase URL format
  if (config.NEXT_PUBLIC_SUPABASE_URL && !config.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must start with https://')
  }

  // Validate Supabase key is not empty
  if (config.NEXT_PUBLIC_SUPABASE_ANON_KEY && config.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 20) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid')
  }

  return config as EnvConfig
}

// Check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// Check if running in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// Get allowed origins for CORS
export function getAllowedOrigins(): string[] {
  if (isProduction()) {
    // In production, restrict to your actual domains
    const allowedOrigins = process.env.ALLOWED_ORIGINS
    return allowedOrigins ? allowedOrigins.split(',') : []
  }
  
  // In development, allow localhost
  return ['http://localhost:3000', 'http://127.0.0.1:3000']
}
