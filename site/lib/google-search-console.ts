import { google } from 'googleapis'

const GSC_CREDENTIALS = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
const SITE_URL = 'sc-domain:coding-prompts.dev'

export interface SearchConsoleStats {
  totalClicks: number | string
  totalImpressions: number | string
  avgCTR: number | string
  avgPosition: number | string
  previousPeriod: {
    clicks: number
    impressions: number
    ctr: number
    position: number
  }
  topQueries: Array<{
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
    change: string
  }>
  topPages: Array<{
    page: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  opportunities: Array<{
    query: string
    impressions: number
    position: number
    currentCTR: number
    potentialClicks: number
  }>
  deviceBreakdown: {
    desktop: { clicks: number; impressions: number; ctr: number }
    mobile: { clicks: number; impressions: number; ctr: number }
    tablet: { clicks: number; impressions: number; ctr: number }
  }
}

async function getAuthClient() {
  if (!GSC_CREDENTIALS) {
    throw new Error('Google Service Account credentials not configured')
  }

  const credentials = JSON.parse(GSC_CREDENTIALS)

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
  })

  return await auth.getClient()
}

export async function getSearchConsoleData(
  startDate?: string,
  endDate?: string
): Promise<SearchConsoleStats> {
  try {
    const authClient = await getAuthClient()
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient as any })

    // Default to last 30 days
    const end = endDate || new Date().toISOString().split('T')[0]
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get overall stats
    const overallResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: [],
        rowLimit: 1
      }
    })

    const overallData = overallResponse.data.rows?.[0] || {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0
    }

    // Get top queries
    const queriesResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ['query'],
        rowLimit: 10
      }
    })

    const topQueries = (queriesResponse.data.rows || []).map(row => ({
      query: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    }))

    // Get top pages
    const pagesResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ['page'],
        rowLimit: 10
      }
    })

    const topPages = (pagesResponse.data.rows || []).map(row => ({
      page: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    }))

    // Get previous period for comparison
    const previousEnd = new Date(Date.parse(start) - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const previousStart = new Date(Date.parse(start) - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const previousResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: previousStart,
        endDate: previousEnd,
        dimensions: ['query'],
        rowLimit: 100
      }
    })

    const previousQueryMap = new Map(
      (previousResponse.data.rows || []).map(row => [
        row.keys?.[0] || '',
        row.clicks || 0
      ])
    )

    // Add change % to top queries
    const enrichedQueries = topQueries.map(query => {
      const previousClicks = previousQueryMap.get(query.query) || 0
      const change = previousClicks > 0
        ? Math.round(((query.clicks - previousClicks) / previousClicks) * 100)
        : query.clicks > 0 ? 100 : 0

      return {
        ...query,
        change: change > 0 ? `+${change}%` : `${change}%`
      }
    })

    // Find opportunities (high impressions, low position)
    const allQueriesResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ['query'],
        rowLimit: 100
      }
    })

    const opportunities = (allQueriesResponse.data.rows || [])
      .filter(row => {
        const impressions = row.impressions || 0
        const position = row.position || 100
        return impressions > 100 && position > 10 && position < 30
      })
      .map(row => {
        const impressions = row.impressions || 0
        const position = row.position || 0
        const currentCTR = row.ctr || 0

        // Estimate potential CTR if moved to position 3-5
        const targetCTR = 0.10 // 10% CTR for top 5 positions
        const potentialClicks = Math.round(impressions * targetCTR)

        return {
          query: row.keys?.[0] || '',
          impressions,
          position: Math.round(position * 10) / 10,
          currentCTR: Math.round(currentCTR * 10000) / 100,
          potentialClicks
        }
      })
      .sort((a, b) => b.potentialClicks - a.potentialClicks)
      .slice(0, 10)

    // Get device breakdown
    const deviceResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ['device'],
        rowLimit: 10
      }
    })

    const deviceBreakdown = {
      desktop: { clicks: 0, impressions: 0, ctr: 0 },
      mobile: { clicks: 0, impressions: 0, ctr: 0 },
      tablet: { clicks: 0, impressions: 0, ctr: 0 }
    }

    deviceResponse.data.rows?.forEach(row => {
      const device = (row.keys?.[0] || '').toLowerCase()
      const clicks = row.clicks || 0
      const impressions = row.impressions || 0
      const ctr = Math.round((row.ctr || 0) * 10000) / 100

      if (device === 'desktop') deviceBreakdown.desktop = { clicks, impressions, ctr }
      else if (device === 'mobile') deviceBreakdown.mobile = { clicks, impressions, ctr }
      else if (device === 'tablet') deviceBreakdown.tablet = { clicks, impressions, ctr }
    })

    // Get previous period overall
    const previousOverallResponse = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: previousStart,
        endDate: previousEnd,
        dimensions: [],
        rowLimit: 1
      }
    })

    const previousOverallData = previousOverallResponse.data.rows?.[0] || {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0
    }

    return {
      totalClicks: overallData.clicks || 0,
      totalImpressions: overallData.impressions || 0,
      avgCTR: Math.round((overallData.ctr || 0) * 10000) / 100,
      avgPosition: Math.round((overallData.position || 0) * 10) / 10,
      previousPeriod: {
        clicks: previousOverallData.clicks || 0,
        impressions: previousOverallData.impressions || 0,
        ctr: Math.round((previousOverallData.ctr || 0) * 10000) / 100,
        position: Math.round((previousOverallData.position || 0) * 10) / 10
      },
      topQueries: enrichedQueries,
      topPages,
      opportunities,
      deviceBreakdown
    }
  } catch (error) {
    console.error('Google Search Console API error:', error)
    throw error
  }
}
