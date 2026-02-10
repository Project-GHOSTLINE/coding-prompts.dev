/**
 * AEO Testing - Automated Citation Testing
 * Tests si les moteurs AI citent notre contenu
 */

export interface AEOTestResult {
  model: string
  query: string
  citesOurSite: boolean
  matchScore: number // 0-100
  responseSnippet: string
  citationFound?: string
  testedAt: Date
  error?: string
}

/**
 * Test ChatGPT via OpenAI API
 */
export async function testChatGPT(query: string): Promise<AEOTestResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return {
      model: 'ChatGPT',
      query,
      citesOurSite: false,
      matchScore: 0,
      responseSnippet: '',
      testedAt: new Date(),
      error: 'OpenAI API key not configured'
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Updated to current available model
        messages: [
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const responseText = data.choices[0]?.message?.content || ''

    // Analyser si notre site est mentionné
    const citesOurSite = /coding-prompts\.dev|coding prompts/i.test(responseText)

    // Calculer le match score basé sur la similarité de contenu
    const matchScore = calculateMatchScore(responseText, query)

    return {
      model: 'ChatGPT',
      query,
      citesOurSite,
      matchScore,
      responseSnippet: responseText.substring(0, 200),
      citationFound: citesOurSite ? extractCitation(responseText) : undefined,
      testedAt: new Date()
    }
  } catch (error) {
    console.error('ChatGPT test error:', error)
    return {
      model: 'ChatGPT',
      query,
      citesOurSite: false,
      matchScore: 0,
      responseSnippet: '',
      testedAt: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test Claude via Anthropic API
 */
export async function testClaude(query: string): Promise<AEOTestResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return {
      model: 'Claude',
      query,
      citesOurSite: false,
      matchScore: 0,
      responseSnippet: '',
      testedAt: new Date(),
      error: 'Anthropic API key not configured'
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: query
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    const responseText = data.content[0]?.text || ''

    const citesOurSite = /coding-prompts\.dev|coding prompts/i.test(responseText)
    const matchScore = calculateMatchScore(responseText, query)

    return {
      model: 'Claude',
      query,
      citesOurSite,
      matchScore,
      responseSnippet: responseText.substring(0, 200),
      citationFound: citesOurSite ? extractCitation(responseText) : undefined,
      testedAt: new Date()
    }
  } catch (error) {
    console.error('Claude test error:', error)
    return {
      model: 'Claude',
      query,
      citesOurSite: false,
      matchScore: 0,
      responseSnippet: '',
      testedAt: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test Gemini via Google AI API
 */
export async function testGemini(query: string): Promise<AEOTestResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    return {
      model: 'Gemini',
      query,
      citesOurSite: false,
      matchScore: 0,
      responseSnippet: '',
      testedAt: new Date(),
      error: 'Google AI API key not configured'
    }
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: query
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const responseText = data.candidates[0]?.content?.parts[0]?.text || ''

    const citesOurSite = /coding-prompts\.dev|coding prompts/i.test(responseText)
    const matchScore = calculateMatchScore(responseText, query)

    return {
      model: 'Gemini',
      query,
      citesOurSite,
      matchScore,
      responseSnippet: responseText.substring(0, 200),
      citationFound: citesOurSite ? extractCitation(responseText) : undefined,
      testedAt: new Date()
    }
  } catch (error) {
    console.error('Gemini test error:', error)
    return {
      model: 'Gemini',
      query,
      citesOurSite: false,
      matchScore: 0,
      responseSnippet: '',
      testedAt: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Calcule un score de match entre la réponse et notre contenu
 * 0-100 basé sur la similarité sémantique
 */
function calculateMatchScore(response: string, query: string): number {
  // Mots-clés importants de notre contenu
  const ourKeywords = [
    'claude code',
    'exit code 1',
    'reset-permissions',
    'coding-prompts.dev',
    'troubleshooting',
    'dangerously-skip-permissions'
  ]

  let matches = 0
  const lowerResponse = response.toLowerCase()

  ourKeywords.forEach(keyword => {
    if (lowerResponse.includes(keyword.toLowerCase())) {
      matches++
    }
  })

  // Score basé sur le nombre de keywords trouvés
  const score = Math.min(100, (matches / ourKeywords.length) * 100)

  return Math.round(score)
}

/**
 * Extrait la citation de notre site dans la réponse
 */
function extractCitation(response: string): string {
  const lines = response.split('\n')

  for (const line of lines) {
    if (/coding-prompts\.dev/i.test(line)) {
      return line.trim()
    }
  }

  return response.substring(0, 100) + '...'
}

/**
 * Lance tous les tests AEO en parallèle
 */
export async function runAllAEOTests(query: string): Promise<AEOTestResult[]> {
  const [chatgptResult, claudeResult, geminiResult] = await Promise.all([
    testChatGPT(query),
    testClaude(query),
    testGemini(query)
  ])

  return [chatgptResult, claudeResult, geminiResult]
}

/**
 * Queries de test recommandées
 */
export const TEST_QUERIES = [
  'Claude Code process exited with code 1',
  'How to fix Claude Code exit code 1',
  'Claude Code permission error',
  'Claude Code troubleshooting',
  'Fix dangerously skip permissions Claude Code'
]
