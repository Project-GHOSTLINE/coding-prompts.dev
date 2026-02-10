import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { detectAIEngine } from './lib/ai-user-agent-detector'

/**
 * Middleware pour tracker les visites AI
 * Détecte les crawlers AI et log les informations
 */
export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const detection = detectAIEngine(userAgent)

  // Si c'est une requête AI, logger les informations
  if (detection.isAI) {
    // Log pour debugging (en production, envoyer à Analytics)
    console.log('[AI Visit]', {
      engine: detection.engine,
      type: detection.type,
      path: request.nextUrl.pathname,
      timestamp: new Date().toISOString(),
      userAgent: userAgent.substring(0, 100) // Truncate for logging
    })

    // Ajouter des headers custom pour identification
    const response = NextResponse.next()
    response.headers.set('X-AI-Engine', detection.engine || 'unknown')
    response.headers.set('X-AI-Type', detection.type || 'unknown')

    return response
  }

  return NextResponse.next()
}

// Configurer quels paths doivent être trackés
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|admin).*)',
  ],
}
