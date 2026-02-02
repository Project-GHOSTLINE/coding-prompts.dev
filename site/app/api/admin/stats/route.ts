import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getSEMrushData } from '@/lib/semrush'

export async function GET() {
  // Check authentication
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch REAL SEMrush data only
    let semrushData
    try {
      semrushData = await getSEMrushData('coding-prompts.dev')
    } catch (error) {
      // Return N/A if SEMrush fails
      semrushData = {
        totalKeywords: 'N/A',
        avgPosition: 'N/A',
        estimatedTraffic: 'N/A',
        totalBacklinks: 'N/A',
        topKeywords: []
      }
    }

    // Vercel Analytics - N/A (no API integration yet)
    const vercelData = {
      pageViews: {
        total: 'N/A',
        change: 'N/A'
      },
      uniqueVisitors: {
        total: 'N/A',
        change: 'N/A'
      },
      topPages: []
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
