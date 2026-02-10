import { BetaAnalyticsDataClient } from '@google-analytics/data'

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON

// Liste des moteurs AI à tracker (referrers)
const AI_ENGINES = {
  'chat.openai.com': 'ChatGPT',
  'chatgpt.com': 'ChatGPT',
  'claude.ai': 'Claude',
  'perplexity.ai': 'Perplexity',
  'gemini.google.com': 'Gemini',
  'bard.google.com': 'Gemini',
  'bing.com/chat': 'Copilot',
  'copilot.microsoft.com': 'Copilot',
  'you.com': 'You.com',
  'phind.com': 'Phind',
  'poe.com': 'Poe'
}

// User-Agent patterns pour crawlers AI
const AI_CRAWLER_PATTERNS = {
  'ChatGPT': /ChatGPT|GPTBot|OpenAI/i,
  'Claude': /Claude|Anthropic|ClaudeBot/i,
  'Gemini': /Gemini|Bard|Google-Extended/i,
  'Perplexity': /PerplexityBot|Perplexity/i,
  'Copilot': /BingPreview|EdgeGPT/i,
  'AI Crawler': /AI2Bot|YouBot/i
}

export interface AITrafficStats {
  totalAISessions: number
  totalAIPageViews: number
  aiVsOrganicRatio: number
  byEngine: Array<{
    engine: string
    sessions: number
    pageViews: number
    avgSessionDuration: number
    bounceRate: number
    change: string
  }>
  timeSeriesData: Array<{
    date: string
    totalAI: number
    chatgpt: number
    claude: number
    perplexity: number
    gemini: number
    other: number
  }>
  topLandingPages: Array<{
    page: string
    aiSessions: number
    topEngine: string
  }>
}

async function getAnalyticsClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('Google Analytics credentials not configured')
  }

  if (!GA4_PROPERTY_ID) {
    throw new Error('GA4 Property ID not configured')
  }

  const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON)

  return new BetaAnalyticsDataClient({
    credentials
  })
}

function categorizeReferrer(referrer: string): string | null {
  if (!referrer) return null

  const lowerReferrer = referrer.toLowerCase()

  for (const [domain, engine] of Object.entries(AI_ENGINES)) {
    if (lowerReferrer.includes(domain)) {
      return engine
    }
  }

  return null
}

function categorizeUserAgent(userAgent: string): string | null {
  if (!userAgent) return null

  for (const [engine, pattern] of Object.entries(AI_CRAWLER_PATTERNS)) {
    if (pattern.test(userAgent)) {
      return engine
    }
  }

  return null
}

export async function getAITrafficData(daysAgo: number = 30): Promise<AITrafficStats> {
  try {
    const analyticsDataClient = await getAnalyticsClient()

    // 1. Get all traffic by referrer
    const [referrerResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 1000
    })

    // 2. Get previous period for comparison
    const [previousResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo * 2}daysAgo`,
          endDate: `${daysAgo + 1}daysAgo`
        }
      ],
      dimensions: [
        { name: 'sessionSource' }
      ],
      metrics: [
        { name: 'sessions' }
      ]
    })

    // Process AI traffic
    const aiTrafficMap = new Map<string, {
      sessions: number
      pageViews: number
      totalDuration: number
      bounceRate: number
      previousSessions: number
    }>()

    let totalAISessions = 0
    let totalAIPageViews = 0
    let totalOrganicSessions = 0

    // Process current period
    referrerResponse.rows?.forEach(row => {
      const source = row.dimensionValues?.[0]?.value || ''
      const medium = row.dimensionValues?.[1]?.value || ''
      const sessions = parseInt(row.metricValues?.[0]?.value || '0')
      const pageViews = parseInt(row.metricValues?.[1]?.value || '0')
      const avgDuration = parseFloat(row.metricValues?.[2]?.value || '0')
      const bounceRate = parseFloat(row.metricValues?.[3]?.value || '0')

      // Identify AI engine
      const engine = categorizeReferrer(source)

      if (engine) {
        totalAISessions += sessions
        totalAIPageViews += pageViews

        const existing = aiTrafficMap.get(engine) || {
          sessions: 0,
          pageViews: 0,
          totalDuration: 0,
          bounceRate: 0,
          previousSessions: 0
        }

        aiTrafficMap.set(engine, {
          sessions: existing.sessions + sessions,
          pageViews: existing.pageViews + pageViews,
          totalDuration: existing.totalDuration + (avgDuration * sessions),
          bounceRate: existing.bounceRate + (bounceRate * sessions),
          previousSessions: existing.previousSessions
        })
      }

      // Track organic search
      if (medium === 'organic' && source === 'google') {
        totalOrganicSessions += sessions
      }
    })

    // Process previous period for comparison
    previousResponse.rows?.forEach(row => {
      const source = row.dimensionValues?.[0]?.value || ''
      const sessions = parseInt(row.metricValues?.[0]?.value || '0')

      const engine = categorizeReferrer(source)

      if (engine) {
        const existing = aiTrafficMap.get(engine)
        if (existing) {
          existing.previousSessions += sessions
        }
      }
    })

    // 3. Get time series data
    const [timeSeriesResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensions: [
        { name: 'date' },
        { name: 'sessionSource' }
      ],
      metrics: [
        { name: 'sessions' }
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    })

    const timeSeriesMap = new Map<string, {
      totalAI: number
      chatgpt: number
      claude: number
      perplexity: number
      gemini: number
      other: number
    }>()

    timeSeriesResponse.rows?.forEach(row => {
      const date = row.dimensionValues?.[0]?.value || ''
      const source = row.dimensionValues?.[1]?.value || ''
      const sessions = parseInt(row.metricValues?.[0]?.value || '0')

      const engine = categorizeReferrer(source)

      if (engine && date) {
        const existing = timeSeriesMap.get(date) || {
          totalAI: 0,
          chatgpt: 0,
          claude: 0,
          perplexity: 0,
          gemini: 0,
          other: 0
        }

        existing.totalAI += sessions

        if (engine === 'ChatGPT') existing.chatgpt += sessions
        else if (engine === 'Claude') existing.claude += sessions
        else if (engine === 'Perplexity') existing.perplexity += sessions
        else if (engine.includes('Gemini')) existing.gemini += sessions
        else existing.other += sessions

        timeSeriesMap.set(date, existing)
      }
    })

    // 4. Get top landing pages from AI
    const [landingPagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensions: [
        { name: 'landingPage' },
        { name: 'sessionSource' }
      ],
      metrics: [
        { name: 'sessions' }
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 50
    })

    const landingPagesMap = new Map<string, Map<string, number>>()

    landingPagesResponse.rows?.forEach(row => {
      const page = row.dimensionValues?.[0]?.value || ''
      const source = row.dimensionValues?.[1]?.value || ''
      const sessions = parseInt(row.metricValues?.[0]?.value || '0')

      const engine = categorizeReferrer(source)

      if (engine && page) {
        if (!landingPagesMap.has(page)) {
          landingPagesMap.set(page, new Map())
        }

        const pageEngines = landingPagesMap.get(page)!
        pageEngines.set(engine, (pageEngines.get(engine) || 0) + sessions)
      }
    })

    // Convert to arrays
    const byEngine = Array.from(aiTrafficMap.entries()).map(([engine, data]) => {
      const change = data.previousSessions > 0
        ? Math.round(((data.sessions - data.previousSessions) / data.previousSessions) * 100)
        : 0

      return {
        engine,
        sessions: data.sessions,
        pageViews: data.pageViews,
        avgSessionDuration: data.sessions > 0 ? Math.round(data.totalDuration / data.sessions) : 0,
        bounceRate: data.sessions > 0 ? Math.round((data.bounceRate / data.sessions) * 100) : 0,
        change: change > 0 ? `+${change}%` : `${change}%`
      }
    }).sort((a, b) => b.sessions - a.sessions)

    const timeSeriesData = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({
        date,
        ...data
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const topLandingPages = Array.from(landingPagesMap.entries())
      .map(([page, engines]) => {
        const totalAISessions = Array.from(engines.values()).reduce((sum, s) => sum + s, 0)
        const topEngine = Array.from(engines.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

        return {
          page,
          aiSessions: totalAISessions,
          topEngine
        }
      })
      .sort((a, b) => b.aiSessions - a.aiSessions)
      .slice(0, 10)

    const aiVsOrganicRatio = totalOrganicSessions > 0
      ? Math.round((totalAISessions / totalOrganicSessions) * 100)
      : 0

    return {
      totalAISessions,
      totalAIPageViews,
      aiVsOrganicRatio,
      byEngine,
      timeSeriesData,
      topLandingPages
    }
  } catch (error) {
    console.error('AI Traffic Analytics error:', error)
    throw error
  }
}
