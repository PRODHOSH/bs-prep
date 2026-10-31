/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    // Files in /public are not content-hashed, so cache them for a month and let them refresh in the background.
    const assetCache = [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' }]
    return [
      { source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|mp4|webm|vtt|woff2)', headers: assetCache },
      { source: '/llms.txt', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }, { key: 'Content-Type', value: 'text/plain; charset=utf-8' }] },
      { source: '/llms-full.txt', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }, { key: 'Content-Type', value: 'text/plain; charset=utf-8' }] },
      {
        source: '/calculator/:path*',
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      },
      {
        // Everything except the embeddable exam calculator.
        source: '/((?!calculator/).*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/tools',
        destination: '/tools/gpa-calculator',
        permanent: true,
      },
      {
        source: '/donate',
        destination: 'https://rzp.io/rzp/support-bsprep',
        permanent: true,
      },
      {
        source: '/support',
        destination: 'https://docs.google.com/forms/d/e/1FAIpQLSeqAmEuz6NrH6P-sa7jD9-0272a-cwm9eASrbvHor7nJN_TtQ/viewform?usp=dialog',
        permanent: true,
      },
    ]
  },
  // Environment variable validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

export default nextConfig