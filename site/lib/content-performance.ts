import { BetaAnalyticsDataClient } from '@google-analytics/data'

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON

// Liste des moteurs AI pour identification
const AI_ENGINES = [
  'chat.openai.com', 'chatgpt.com', 'claude.ai', 'perplexity.ai',
  'gemini.google.com', 'bard.google.com', 'bing.com/chat', 'you.com',
  'phind.com', 'poe.com'
]

export interface ContentPerformance {
  topPagesAI: Array<{
    page: string
    aiSessions: number
    aiPageViews: number
    aiAvgDuration: number
    aiBounceRate: number
    aiEngagement: number
  }>
  topPagesOrganic: Array<{
    page: string
    organicSessions: number
    organicPageViews: number
    organicAvgDuration: number
    organicBounceRate: number
    organicEngagement: number
  }>
  comparison: Array<{
    page: string
    aiSessions: number
    organicSessions: number
    aiPerformanceScore: number
    organicPerformanceScore: number
    winner: 'AI' | 'Organic' | 'Equal'
    aiAvgDuration: number
    organicAvgDuration: number
  }>
  overallMetrics: {
    ai: {
      avgSessionDuration: number
      avgBounceRate: number
      avgPagesPerSession: number
      avgEngagementRate: number
    }
    organic: {
      avgSessionDuration: number
      avgBounceRate: number
      avgPagesPerSession: number
      avgEngagementRate: number
    }
  }
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

function isAISource(source: string): boolean {
  const lowerSource = source.toLowerCase()
  return AI_ENGINES.some(engine => lowerSource.includes(engine))
}

/**
 * Calcule un score de performance basé sur engagement, durée, et bounce rate
 */
function calculatePerformanceScore(
  sessions: number,
  avgDuration: number,
  bounceRate: number
): number {
  // Score de 0 à 100
  // Facteurs: engagement (40%), durée (40%), bounce rate inversé (20%)
  const durationScore = Math.min(avgDuration / 180, 1) * 40 // Max à 3 minutes
  const bounceScore = (1 - bounceRate) * 20
  const engagementScore = Math.min(sessions / 100, 1) * 40 // Max à 100 sessions

  return Math.round(durationScore + bounceScore + engagementScore)
}

export async function getContentPerformanceData(daysAgo: number = 30): Promise<ContentPerformance> {
  try {
    const analyticsDataClient = await getAnalyticsClient()

    // Commentaire: Récupération des données par page et source
    const [pageSourceResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensions: [
        { name: 'pagePath' },
        { name: 'sessionSource' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'engagementRate' }
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 200
    })

    // Commentaire: Agrégation des données par page et type de source (AI vs Organic)
    const aiPagesMap = new Map<string, {
      sessions: number
      pageViews: number
      totalDuration: number
      totalBounceRate: number
      totalEngagement: number
      count: number
    }>()

    const organicPagesMap = new Map<string, {
      sessions: number
      pageViews: number
      totalDuration: number
      totalBounceRate: number
      totalEngagement: number
      count: number
    }>()

    let totalAISessions = 0
    let totalOrganicSessions = 0

    pageSourceResponse.rows?.forEach(row => {
      const page = row.dimensionValues?.[0]?.value || ''
      const source = row.dimensionValues?.[1]?.value || ''
      const sessions = parseInt(row.metricValues?.[0]?.value || '0')
      const pageViews = parseInt(row.metricValues?.[1]?.value || '0')
      const avgDuration = parseFloat(row.metricValues?.[2]?.value || '0')
      const bounceRate = parseFloat(row.metricValues?.[3]?.value || '0')
      const engagementRate = parseFloat(row.metricValues?.[4]?.value || '0')

      const isAI = isAISource(source)
      const isOrganic = source.toLowerCase() === 'google' || source.toLowerCase().includes('organic')

      if (isAI) {
        totalAISessions += sessions
        const existing = aiPagesMap.get(page) || {
          sessions: 0,
          pageViews: 0,
          totalDuration: 0,
          totalBounceRate: 0,
          totalEngagement: 0,
          count: 0
        }

        aiPagesMap.set(page, {
          sessions: existing.sessions + sessions,
          pageViews: existing.pageViews + pageViews,
          totalDuration: existing.totalDuration + (avgDuration * sessions),
          totalBounceRate: existing.totalBounceRate + (bounceRate * sessions),
          totalEngagement: existing.totalEngagement + (engagementRate * sessions),
          count: existing.count + 1
        })
      }

      if (isOrganic) {
        totalOrganicSessions += sessions
        const existing = organicPagesMap.get(page) || {
          sessions: 0,
          pageViews: 0,
          totalDuration: 0,
          totalBounceRate: 0,
          totalEngagement: 0,
          count: 0
        }

        organicPagesMap.set(page, {
          sessions: existing.sessions + sessions,
          pageViews: existing.pageViews + pageViews,
          totalDuration: existing.totalDuration + (avgDuration * sessions),
          totalBounceRate: existing.totalBounceRate + (bounceRate * sessions),
          totalEngagement: existing.totalEngagement + (engagementRate * sessions),
          count: existing.count + 1
        })
      }
    })

    // Commentaire: Conversion en tableaux triés pour top pages AI
    const topPagesAI = Array.from(aiPagesMap.entries())
      .map(([page, data]) => ({
        page,
        aiSessions: data.sessions,
        aiPageViews: data.pageViews,
        aiAvgDuration: data.sessions > 0 ? Math.round(data.totalDuration / data.sessions) : 0,
        aiBounceRate: data.sessions > 0 ? Math.round((data.totalBounceRate / data.sessions) * 100) : 0,
        aiEngagement: data.sessions > 0 ? Math.round((data.totalEngagement / data.sessions) * 100) : 0
      }))
      .sort((a, b) => b.aiSessions - a.aiSessions)
      .slice(0, 10)

    // Commentaire: Conversion en tableaux triés pour top pages Organic
    const topPagesOrganic = Array.from(organicPagesMap.entries())
      .map(([page, data]) => ({
        page,
        organicSessions: data.sessions,
        organicPageViews: data.pageViews,
        organicAvgDuration: data.sessions > 0 ? Math.round(data.totalDuration / data.sessions) : 0,
        organicBounceRate: data.sessions > 0 ? Math.round((data.totalBounceRate / data.sessions) * 100) : 0,
        organicEngagement: data.sessions > 0 ? Math.round((data.totalEngagement / data.sessions) * 100) : 0
      }))
      .sort((a, b) => b.organicSessions - a.organicSessions)
      .slice(0, 10)

    // Commentaire: Création de la comparaison AI vs Organic pour chaque page
    const allPages = new Set([
      ...Array.from(aiPagesMap.keys()),
      ...Array.from(organicPagesMap.keys())
    ])

    const comparison = Array.from(allPages)
      .map(page => {
        const aiData = aiPagesMap.get(page)
        const organicData = organicPagesMap.get(page)

        const aiSessions = aiData?.sessions || 0
        const organicSessions = organicData?.sessions || 0
        const aiAvgDuration = aiData ? Math.round(aiData.totalDuration / aiData.sessions) : 0
        const organicAvgDuration = organicData ? Math.round(organicData.totalDuration / organicData.sessions) : 0
        const aiBounceRate = aiData ? (aiData.totalBounceRate / aiData.sessions) : 0
        const organicBounceRate = organicData ? (organicData.totalBounceRate / organicData.sessions) : 0

        const aiScore = aiSessions > 0 ? calculatePerformanceScore(aiSessions, aiAvgDuration, aiBounceRate) : 0
        const organicScore = organicSessions > 0 ? calculatePerformanceScore(organicSessions, organicAvgDuration, organicBounceRate) : 0

        let winner: 'AI' | 'Organic' | 'Equal' = 'Equal'
        if (aiScore > organicScore + 10) winner = 'AI'
        else if (organicScore > aiScore + 10) winner = 'Organic'

        return {
          page,
          aiSessions,
          organicSessions,
          aiPerformanceScore: aiScore,
          organicPerformanceScore: organicScore,
          winner,
          aiAvgDuration,
          organicAvgDuration
        }
      })
      .filter(item => item.aiSessions > 0 || item.organicSessions > 0)
      .sort((a, b) => (b.aiSessions + b.organicSessions) - (a.aiSessions + a.organicSessions))
      .slice(0, 10)

    // Commentaire: Calcul des métriques globales AI vs Organic
    const [aiOverallResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'sessionSource',
          stringFilter: {
            matchType: 'CONTAINS',
            value: 'openai'
          }
        }
      },
      metrics: [
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'screenPageViewsPerSession' },
        { name: 'engagementRate' }
      ]
    })

    const [organicOverallResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'sessionSource',
          stringFilter: {
            matchType: 'EXACT',
            value: 'google'
          }
        }
      },
      metrics: [
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'screenPageViewsPerSession' },
        { name: 'engagementRate' }
      ]
    })

    const aiOverall = aiOverallResponse.rows?.[0]?.metricValues || []
    const organicOverall = organicOverallResponse.rows?.[0]?.metricValues || []

    return {
      topPagesAI,
      topPagesOrganic,
      comparison,
      overallMetrics: {
        ai: {
          avgSessionDuration: Math.round(parseFloat(aiOverall[0]?.value || '0')),
          avgBounceRate: Math.round(parseFloat(aiOverall[1]?.value || '0') * 100),
          avgPagesPerSession: Math.round(parseFloat(aiOverall[2]?.value || '0') * 10) / 10,
          avgEngagementRate: Math.round(parseFloat(aiOverall[3]?.value || '0') * 100)
        },
        organic: {
          avgSessionDuration: Math.round(parseFloat(organicOverall[0]?.value || '0')),
          avgBounceRate: Math.round(parseFloat(organicOverall[1]?.value || '0') * 100),
          avgPagesPerSession: Math.round(parseFloat(organicOverall[2]?.value || '0') * 10) / 10,
          avgEngagementRate: Math.round(parseFloat(organicOverall[3]?.value || '0') * 100)
        }
      }
    }
  } catch (error) {
    console.error('Content Performance error:', error)
    throw error
  }
}
