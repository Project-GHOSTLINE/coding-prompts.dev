const withMDX = require('@next/mdx')()

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],

  // Security Headers optimized for AEO (AI Engine Optimization)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Clickjacking protection
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // MIME type sniffing protection
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // XSS protection (legacy, but still useful)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer policy (privacy + SEO)
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions policy (restrict features)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // Content Security Policy - Optimized for AEO
          // Allows inline scripts for JSON-LD structured data (critical for AI crawlers)
          // Allows GA4 and analytics
          // Allows Vercel Live for preview and analytics
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://static.cloudflareinsights.com https://vercel.live",
              "frame-src https://vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          },
          // Cache control for AI bots (allow caching but revalidate)
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate'
          },
          // Custom header to signal AEO optimization
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
          },
          // AI-specific metadata (experimental)
          {
            key: 'X-AI-Friendly',
            value: 'structured-data, json-ld, semantic-html'
          }
        ]
      },
      // Robots.txt and sitemap should be highly cacheable
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable'
          }
        ]
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate'
          },
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8'
          }
        ]
      }
    ]
  }
}

module.exports = withMDX(nextConfig)
