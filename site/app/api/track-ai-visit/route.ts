import { NextRequest, NextResponse } from 'next/server'
import { detectAIEngine } from '@/lib/ai-user-agent-detector'

/**
 * API endpoint pour tracker les visites AI
 * Envoie les événements à Google Analytics 4 via Measurement Protocol
 */
export async function POST(request: NextRequest) {
  try {
    const { userAgent, path, referrer } = await request.json()

    if (!userAgent) {
      return NextResponse.json({ error: 'userAgent required' }, { status: 400 })
    }

    const detection = detectAIEngine(userAgent)

    if (!detection.isAI) {
      return NextResponse.json({ tracked: false, reason: 'not_ai' })
    }

    // Log AI visit
    console.log('[AI Visit Tracked]', {
      engine: detection.engine,
      type: detection.type,
      path,
      referrer,
      timestamp: new Date().toISOString()
    })

    // TODO: Envoyer à GA4 Measurement Protocol si nécessaire
    // Pour l'instant, GA4 collecte déjà via gtag.js côté client

    return NextResponse.json({
      tracked: true,
      engine: detection.engine,
      type: detection.type
    })
  } catch (error) {
    console.error('AI tracking error:', error)
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 })
  }
}

// GET endpoint pour vérifier si un user-agent est AI
export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const detection = detectAIEngine(userAgent)

  return NextResponse.json({
    isAI: detection.isAI,
    engine: detection.engine,
    type: detection.type
  })
}
