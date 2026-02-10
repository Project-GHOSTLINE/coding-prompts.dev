import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getSearchConsoleData } from '@/lib/google-search-console'
import { getAnalyticsData } from '@/lib/google-analytics'
import { getAITrafficData } from '@/lib/ai-traffic-analytics'
import { getContentPerformanceData } from '@/lib/content-performance'
import { getAEOAnalytics } from '@/lib/aeo-analytics'

export async function GET() {
  // Check authentication
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
        previousPeriod: {
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0
        },
        topQueries: [],
        topPages: [],
        opportunities: [],
        deviceBreakdown: {
          desktop: { clicks: 0, impressions: 0, ctr: 0 },
          mobile: { clicks: 0, impressions: 0, ctr: 0 },
          tablet: { clicks: 0, impressions: 0, ctr: 0 }
        }
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

    // Fetch AI Traffic data
    let aiTrafficData
    try {
      aiTrafficData = await getAITrafficData(30)
    } catch (error) {
      console.error('AI Traffic error:', error)
      aiTrafficData = {
        totalAISessions: 0,
        totalAIPageViews: 0,
        aiVsOrganicRatio: 0,
        byEngine: [],
        timeSeriesData: [],
        topLandingPages: []
      }
    }

    // Fetch Content Performance data
    let contentPerformanceData
    try {
      contentPerformanceData = await getContentPerformanceData(30)
    } catch (error) {
      console.error('Content Performance error:', error)
      contentPerformanceData = {
        topPagesAI: [],
        topPagesOrganic: [],
        comparison: [],
        overallMetrics: {
          ai: {
            avgSessionDuration: 0,
            avgBounceRate: 0,
            avgPagesPerSession: 0,
            avgEngagementRate: 0
          },
          organic: {
            avgSessionDuration: 0,
            avgBounceRate: 0,
            avgPagesPerSession: 0,
            avgEngagementRate: 0
          }
        }
      }
    }

    // Use GA4 data for traffic (replacing Vercel Analytics)
    const vercelData = {
      pageViews: analyticsData.pageViews,
      uniqueVisitors: analyticsData.uniqueVisitors,
      topPages: analyticsData.topPages
    }

    // Fetch AEO Analytics from Supabase
    let aeoData
    try {
      aeoData = await getAEOAnalytics(30)
    } catch (error) {
      console.error('AEO Analytics error:', error)
      aeoData = {
        overview: {
          totalAIVisits: 0,
          totalCrawlers: 0,
          totalReferrals: 0,
          uniqueEngines: 0,
          avgVisitsPerDay: 0,
          growthRate: 0
        },
        byEngine: [],
        timeline: [],
        topPages: [],
        crawlerActivity: []
      }
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
      searchConsole: searchConsoleData,
      analytics: analyticsData,
      aiTraffic: aiTrafficData,
      contentPerformance: contentPerformanceData,
      vercel: vercelData,
      aeo: aeoData,
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
