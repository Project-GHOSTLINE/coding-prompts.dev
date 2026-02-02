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
    // Fetch SEMrush data
    const semrushData = await getSEMrushData('coding-prompts.dev')

    // Mock Vercel Analytics data (replace with real API call)
    const vercelData = {
      pageViews: {
        total: 12450,
        change: '+23%'
      },
      uniqueVisitors: {
        total: 8234,
        change: '+18%'
      },
      topPages: [
        { path: '/troubleshooting/exit-code-1', views: 4234, change: '+45%' },
        { path: '/setup/installation', views: 2856, change: '+12%' },
        { path: '/features/sequential-thinking', views: 1432, change: '+8%' }
      ]
    }

    // Mock AEO test results
    const aeoTests = {
      lastTest: '2026-02-01',
      nextTest: '2026-02-08',
      results: [
        { model: 'ChatGPT', matchScore: 3, lastUpdate: '2026-02-01' },
        { model: 'Claude', matchScore: 2, lastUpdate: '2026-02-01' },
        { model: 'Gemini', matchScore: 4, lastUpdate: '2026-02-01' }
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
