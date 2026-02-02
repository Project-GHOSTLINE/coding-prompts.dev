import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getSEMrushData } from '@/lib/semrush'
import { getSearchConsoleData } from '@/lib/google-search-console'
import { getAnalyticsData } from '@/lib/google-analytics'

export async function GET() {
  // Check authentication
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch REAL SEMrush data
    let semrushData
    try {
      semrushData = await getSEMrushData('coding-prompts.dev')
    } catch (error) {
      console.error('SEMrush error:', error)
      semrushData = {
        totalKeywords: 'N/A',
        avgPosition: 'N/A',
        estimatedTraffic: 'N/A',
        totalBacklinks: 'N/A',
        topKeywords: []
      }
    }

    // Fetch REAL Google Search Console data
    let searchConsoleData
    try {
      searchConsoleData = await getSearchConsoleData()
    } catch (error) {
      console.error('Google Search Console error:', error)
      searchConsoleData = {
        totalClicks: 'N/A',
        totalImpressions: 'N/A',
        avgCTR: 'N/A',
        avgPosition: 'N/A',
        topQueries: [],
        topPages: []
      }
    }

    // Fetch REAL Google Analytics 4 data
    let analyticsData
    try {
      analyticsData = await getAnalyticsData(30)
    } catch (error) {
      console.error('Google Analytics error:', error)
      analyticsData = {
        pageViews: { total: 'N/A', change: 'N/A' },
        uniqueVisitors: { total: 'N/A', change: 'N/A' },
        avgSessionDuration: 'N/A',
        bounceRate: 'N/A',
        topPages: [],
        topSources: [],
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 }
      }
    }

    // Use GA4 data for traffic (replacing Vercel Analytics)
    const vercelData = {
      pageViews: analyticsData.pageViews,
      uniqueVisitors: analyticsData.uniqueVisitors,
      topPages: analyticsData.topPages
    }

    // AEO Test Results - N/A (manual testing only)
    const aeoTests = {
      lastTest: 'N/A',
      nextTest: 'Manual testing required',
      results: [
        { model: 'ChatGPT', matchScore: 'N/A', lastUpdate: 'Not tested' },
        { model: 'Claude', matchScore: 'N/A', lastUpdate: 'Not tested' },
        { model: 'Gemini', matchScore: 'N/A', lastUpdate: 'Not tested' }
      ]
    }

    return NextResponse.json({
      semrush: semrushData,
      searchConsole: searchConsoleData,
      analytics: analyticsData,
      vercel: vercelData,
      aeoTests
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
