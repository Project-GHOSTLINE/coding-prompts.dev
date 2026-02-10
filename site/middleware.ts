/**
 * Next.js Middleware - Admin Auth + AEO Tracking
 *
 * 1. Protège les routes admin
 * 2. Track automatiquement les visites AI (crawlers + referrals)
 *
 * Date: 2026-02-10
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/auth'
import { detectAISource } from './lib/ai-user-agent-detector'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for AEO tracking
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const canTrack = supabaseUrl && supabaseKey

let supabase: ReturnType<typeof createClient> | null = null

if (canTrack) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Log une visite AI dans Supabase
 */
async function logAIVisit(
  request: NextRequest,
  detection: ReturnType<typeof detectAISource>
) {
  if (!supabase || !detection.isAI) return

  const userAgent = request.headers.get('user-agent') || ''
  const referrer = request.headers.get('referer') || request.headers.get('referrer') || ''
  const path = request.nextUrl.pathname

  // Extraire l'IP (en tenant compte des proxies)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'

  try {
    // @ts-ignore - Table créée manuellement, types non générés
    await supabase.from('aeo_tracking').insert({
      source_type: detection.sourceType,
      engine_name: detection.engine,
      user_agent: userAgent,
      referrer: referrer,
      ip_address: ip !== 'unknown' ? ip : null,
      page_path: path,
      page_title: null,
      session_id: null,
      session_duration: null,
      pages_viewed: 1,
      bounce: true,
      metadata: {
        method: request.method,
        host: request.headers.get('host'),
        timestamp: new Date().toISOString()
      }
    })

    // Log pour debugging (uniquement en dev)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🤖 AEO: ${detection.engine} (${detection.sourceType}) → ${path}`)
    }
  } catch (error) {
    // Fail silently
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logging AI visit:', error)
    }
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // ========================================================================
  // 1. AEO TRACKING - Track AI visits (non-blocking)
  // ========================================================================

  const userAgent = request.headers.get('user-agent') || ''
  const referrer = request.headers.get('referer') || request.headers.get('referrer') || ''
  const detection = detectAISource(userAgent, referrer)

  if (detection.isAI && canTrack) {
    // Log de manière asynchrone (ne bloque pas la requête)
    logAIVisit(request, detection).catch(() => {
      // Ignore errors silently
    })
  }

  // ========================================================================
  // 2. ADMIN AUTHENTICATION - Protect admin routes
  // ========================================================================

  // Protect admin routes (except login)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const token = request.cookies.get('admin_session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const session = await verifySession(token)

    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Redirect /admin to /admin/dashboard
  if (path === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

/**
 * Configuration du middleware
 * Appliqué sur toutes les routes sauf fichiers statiques
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico
     * - fichiers publics (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
}
