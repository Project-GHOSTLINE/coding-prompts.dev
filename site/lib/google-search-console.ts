import { google } from 'googleapis'

const GSC_CREDENTIALS = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
const SITE_URL = 'sc-domain:coding-prompts.dev'

export interface SearchConsoleStats {
  totalClicks: number | string
  totalImpressions: number | string
  avgCTR: number | string
  avgPosition: number | string
  topQueries: Array<{
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  topPages: Array<{
    page: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
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

    return {
      totalClicks: overallData.clicks || 0,
      totalImpressions: overallData.impressions || 0,
      avgCTR: Math.round((overallData.ctr || 0) * 10000) / 100, // Convert to percentage
      avgPosition: Math.round((overallData.position || 0) * 10) / 10,
      topQueries,
      topPages
    }
  } catch (error) {
    console.error('Google Search Console API error:', error)
    throw error
  }
}
