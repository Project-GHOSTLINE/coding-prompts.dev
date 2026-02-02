import { BetaAnalyticsDataClient } from '@google-analytics/data'

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID
const GA4_CREDENTIALS = process.env.GOOGLE_SERVICE_ACCOUNT_JSON

export interface AnalyticsStats {
  pageViews: {
    total: number | string
    change: string
  }
  uniqueVisitors: {
    total: number | string
    change: string
  }
  avgSessionDuration: number | string
  bounceRate: number | string
  topPages: Array<{
    path: string
    views: number
    change: string
  }>
  topSources: Array<{
    source: string
    users: number
    sessions: number
  }>
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
}

async function getAnalyticsClient() {
  if (!GA4_CREDENTIALS) {
    throw new Error('Google Analytics credentials not configured')
  }

  if (!GA4_PROPERTY_ID) {
    throw new Error('GA4 Property ID not configured')
  }

  const credentials = JSON.parse(GA4_CREDENTIALS)

  return new BetaAnalyticsDataClient({
    credentials
  })
}

export async function getAnalyticsData(daysAgo: number = 30): Promise<AnalyticsStats> {
  try {
    const analyticsDataClient = await getAnalyticsClient()

    // Get current period data
    const [currentResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensions: [],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ]
    })

    // Get previous period for comparison
    const [previousResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo * 2}daysAgo`,
          endDate: `${daysAgo + 1}daysAgo`
        }
      ],
      dimensions: [],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' }
      ]
    })

    const currentData = currentResponse.rows?.[0]?.metricValues || []
    const previousData = previousResponse.rows?.[0]?.metricValues || []

    const pageViews = parseInt(currentData[0]?.value || '0')
    const uniqueVisitors = parseInt(currentData[1]?.value || '0')
    const previousPageViews = parseInt(previousData[0]?.value || '0')
    const previousVisitors = parseInt(previousData[1]?.value || '0')

    // Calculate percentage change
    const pageViewsChange = previousPageViews > 0
      ? Math.round(((pageViews - previousPageViews) / previousPageViews) * 100)
      : 0
    const visitorsChange = previousVisitors > 0
      ? Math.round(((uniqueVisitors - previousVisitors) / previousVisitors) * 100)
      : 0

    // Get top pages
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10
    })

    const topPages = (pagesResponse.rows || []).map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      change: 'N/A' // Would need additional query for change
    }))

    // Get top sources
    const [sourcesResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' }
      ],
      orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      limit: 10
    })

    const topSources = (sourcesResponse.rows || []).map(row => ({
      source: row.dimensionValues?.[0]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0')
    }))

    // Get device breakdown
    const [deviceResponse] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: `${daysAgo}daysAgo`,
          endDate: 'today'
        }
      ],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'totalUsers' }]
    })

    const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 }
    deviceResponse.rows?.forEach(row => {
      const device = row.dimensionValues?.[0]?.value?.toLowerCase() || ''
      const users = parseInt(row.metricValues?.[0]?.value || '0')
      if (device === 'desktop') deviceBreakdown.desktop = users
      else if (device === 'mobile') deviceBreakdown.mobile = users
      else if (device === 'tablet') deviceBreakdown.tablet = users
    })

    return {
      pageViews: {
        total: pageViews,
        change: pageViewsChange > 0 ? `+${pageViewsChange}%` : `${pageViewsChange}%`
      },
      uniqueVisitors: {
        total: uniqueVisitors,
        change: visitorsChange > 0 ? `+${visitorsChange}%` : `${visitorsChange}%`
      },
      avgSessionDuration: Math.round(parseFloat(currentData[2]?.value || '0')),
      bounceRate: Math.round(parseFloat(currentData[3]?.value || '0') * 100),
      topPages,
      topSources,
      deviceBreakdown
    }
  } catch (error) {
    console.error('Google Analytics API error:', error)
    throw error
  }
}
