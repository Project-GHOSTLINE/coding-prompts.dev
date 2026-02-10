import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { runAllAEOTests, testChatGPT, testClaude, testGemini, TEST_QUERIES } from '@/lib/aeo-testing'

/**
 * API endpoint pour lancer les tests AEO automatiques
 */
export async function POST(request: NextRequest) {
  // Check authentication
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { query, model } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'query parameter required' }, { status: 400 })
    }

    // Test un modèle spécifique ou tous
    if (model) {
      let result
      switch (model.toLowerCase()) {
        case 'chatgpt':
          result = await testChatGPT(query)
          break
        case 'claude':
          result = await testClaude(query)
          break
        case 'gemini':
          result = await testGemini(query)
          break
        default:
          return NextResponse.json({ error: 'Invalid model' }, { status: 400 })
      }

      return NextResponse.json({ result })
    }

    // Tester tous les modèles
    const results = await runAllAEOTests(query)

    return NextResponse.json({
      query,
      testedAt: new Date().toISOString(),
      results
    })
  } catch (error) {
    console.error('AEO test error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint pour récupérer les queries de test recommandées
 */
export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    testQueries: TEST_QUERIES,
    supportedModels: ['ChatGPT', 'Claude', 'Gemini']
  })
}
