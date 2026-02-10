'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Sidebar from '@/components/Sidebar/Sidebar'
import MobileMenuButton from '@/components/Sidebar/MobileMenuButton'
import CollapsibleSection from '@/components/Dashboard/CollapsibleSection'
import MetricCard from '@/components/Dashboard/MetricCard'
import MiniChart from '@/components/Dashboard/MiniChart'

interface Stats {
  aiTraffic: {
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
  searchConsole: {
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
  contentPerformance: {
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
  vercel: {
    pageViews: { total: number; change: string }
    uniqueVisitors: { total: number; change: string }
    topPages: Array<{ path: string; views: number; change: string }>
  }
  aeoTests: {
    lastTest: string
    nextTest: string
    results: Array<{ model: string; matchScore: number; lastUpdate: string }>
  }
  aeo: {
    overview: {
      totalAIVisits: number
      totalCrawlers: number
      totalReferrals: number
      uniqueEngines: number
      avgVisitsPerDay: number
      growthRate: number
    }
    byEngine: Array<{
      engine: string
      crawlerVisits: number
      referralVisits: number
      totalVisits: number
      uniquePages: number
      avgDuration: number
      bounceRate: number
      lastVisit: string
      trend: 'up' | 'down' | 'stable'
    }>
    timeline: Array<{
      date: string
      crawlers: number
      referrals: number
      total: number
      topEngine: string
    }>
    topPages: Array<{
      path: string
      aiVisits: number
      crawlerVisits: number
      referralVisits: number
      uniqueEngines: number
      topEngine: string
      aeoScore: number
    }>
    crawlerActivity: Array<{
      engine: string
      visits: number
      pagesScanned: number
      lastScan: string
      scanFrequency: string
    }>
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Error loading safeStats. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  // Ensure all required properties exist with safe defaults
  const safeStats = {
    ...stats,
    searchConsole: stats?.searchConsole || {
      totalClicks: 'N/A',
      totalImpressions: 'N/A',
      avgCTR: 'N/A',
      avgPosition: 'N/A',
      previousPeriod: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      topQueries: [],
      topPages: [],
      opportunities: [],
      deviceBreakdown: {
        desktop: { clicks: 0, impressions: 0, ctr: 0 },
        mobile: { clicks: 0, impressions: 0, ctr: 0 },
        tablet: { clicks: 0, impressions: 0, ctr: 0 }
      }
    },
    aiTraffic: stats?.aiTraffic || {
      totalAISessions: 0,
      totalAIPageViews: 0,
      aiVsOrganicRatio: 0,
      byEngine: [],
      timeSeriesData: [],
      topLandingPages: []
    },
    contentPerformance: stats?.contentPerformance || {
      topPagesAI: [],
      topPagesOrganic: [],
      comparison: [],
      overallMetrics: {
        ai: { avgSessionDuration: 0, avgBounceRate: 0, avgPagesPerSession: 0, avgEngagementRate: 0 },
        organic: { avgSessionDuration: 0, avgBounceRate: 0, avgPagesPerSession: 0, avgEngagementRate: 0 }
      }
    },
    aeoTests: stats?.aeoTests || {
      lastTest: 'N/A',
      nextTest: 'N/A',
      results: []
    },
    vercel: stats?.vercel || {
      pageViews: { total: 'N/A', change: 'N/A' },
      uniqueVisitors: { total: 'N/A', change: 'N/A' },
      topPages: []
    },
    aeo: stats?.aeo || {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile menu button */}
      <MobileMenuButton onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content with margin for sidebar */}
      <div className="flex-1 lg:ml-64 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-100 sticky top-0 z-20">
        <div className="max-w-[1920px] mx-auto px-8 lg:px-12 py-6 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard AEO
              </h1>
              <span className="text-xs font-bold font-mono bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-md">
                v1.0.1
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              🎯 coding-prompts.dev • AI Engine Optimization
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Dernière mise à jour</p>
              <p className="text-sm font-medium text-gray-700">
                {lastUpdate.toLocaleTimeString('fr-FR')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1920px] mx-auto px-8 lg:px-12 py-8">
        {/* Dynamic Grid Layout - Key Metrics - Full Width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {/* Large AI Sessions Card */}
          <MetricCard
            title="Total AI Sessions"
            value={safeStats.aiTraffic.totalAISessions.toLocaleString()}
            icon="🤖"
            subtitle="Visites des moteurs AI"
            size="medium"
            trend="up"
            change="+12%"
          >
            <MiniChart
              data={(safeStats.aiTraffic.timeSeriesData ?? []).slice(-7).map(d => d.totalAI)}
              color="blue"
            />
          </MetricCard>

          {/* Organic Clicks */}
          <MetricCard
            title="Organic Clicks"
            value={typeof safeStats.searchConsole.totalClicks === 'number' ? safeStats.searchConsole.totalClicks.toLocaleString() : safeStats.searchConsole.totalClicks}
            icon="🔍"
            subtitle="Google Search"
            size="small"
            trend="up"
            change="+8%"
          />

          {/* Ranking Position */}
          <MetricCard
            title="Ranking Position"
            value={`#${typeof safeStats.searchConsole.avgPosition === 'number' ? safeStats.searchConsole.avgPosition.toFixed(1) : safeStats.searchConsole.avgPosition}`}
            icon="📍"
            subtitle="Position moyenne"
            size="small"
            trend="down"
            change="-2.1"
          />

          {/* AI vs Organic Ratio */}
          <MetricCard
            title="AI vs Organic"
            value={`${safeStats.aiTraffic.aiVsOrganicRatio}%`}
            icon="⚡"
            subtitle="Ratio trafic"
            size="medium"
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">AI</div>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                     style={{ width: `${safeStats.aiTraffic.aiVsOrganicRatio}%` }} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Organic</div>
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                     style={{ width: `${100 - safeStats.aiTraffic.aiVsOrganicRatio}%` }} />
              </div>
            </div>
          </MetricCard>

          {/* Page Views */}
          <MetricCard
            title="Page Views"
            value={typeof safeStats.vercel.pageViews.total === 'number' ? safeStats.vercel.pageViews.total.toLocaleString() : safeStats.vercel.pageViews.total}
            icon="👁️"
            subtitle="Total views"
            size="small"
            trend="up"
            change="+15%"
          />

          {/* Engagement Rate Large Card */}
          <MetricCard
            title="Engagement AI"
            value={`${safeStats.contentPerformance.overallMetrics.ai.avgEngagementRate}%`}
            icon="💎"
            subtitle="Taux engagement moyen"
            size="medium"
          >
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-500">Durée</div>
                <div className="font-semibold text-blue-600">{safeStats.contentPerformance.overallMetrics.ai.avgSessionDuration}s</div>
              </div>
              <div>
                <div className="text-gray-500">Pages/Session</div>
                <div className="font-semibold text-purple-600">{safeStats.contentPerformance.overallMetrics.ai.avgPagesPerSession}</div>
              </div>
            </div>
          </MetricCard>

        </div>

        {/* AEO TRACKING - NEW SECTION */}
        <CollapsibleSection
          title="🎯 AEO Tracking (Answer Engine Optimization)"
          subtitle="Crawlers AI + Trafic Référé • Tracking en temps réel"
          icon="🤖"
          badge={`${safeStats.aeo.overview.totalAIVisits} visites AI • ${safeStats.aeo.overview.uniqueEngines} engines`}
          summary={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-gray-600 text-xs mb-1">Total Visites AI</div>
                <div className="font-bold text-blue-600 text-lg">{safeStats.aeo.overview.totalAIVisits}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {safeStats.aeo.overview.growthRate > 0 ? '+' : ''}{safeStats.aeo.overview.growthRate}%
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-gray-600 text-xs mb-1">Crawlers</div>
                <div className="font-bold text-purple-600 text-lg">{safeStats.aeo.overview.totalCrawlers}</div>
                <div className="text-xs text-gray-500 mt-1">GPTBot, Claude, etc.</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-gray-600 text-xs mb-1">Referrals</div>
                <div className="font-bold text-green-600 text-lg">{safeStats.aeo.overview.totalReferrals}</div>
                <div className="text-xs text-gray-500 mt-1">Depuis AI engines</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-gray-600 text-xs mb-1">Moy/Jour</div>
                <div className="font-bold text-orange-600 text-lg">{safeStats.aeo.overview.avgVisitsPerDay}</div>
                <div className="text-xs text-gray-500 mt-1">{safeStats.aeo.overview.uniqueEngines} engines actifs</div>
              </div>
            </div>
          }
        >
          {/* Stats par Engine */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-md font-semibold text-gray-900">📊 Stats par Moteur AI</h3>
              <p className="text-xs text-gray-600 mt-1">Crawlers + Referrals combinés</p>
            </div>
            {safeStats.aeo.byEngine.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crawlers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pages</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bounce</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tendance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeStats.aeo.byEngine.map((engine, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{engine.engine}</span>
                          {engine.trend === 'up' && <span className="text-green-500">↗</span>}
                          {engine.trend === 'down' && <span className="text-red-500">↘</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {engine.crawlerVisits}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {engine.referralVisits}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{engine.totalVisits}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{engine.uniquePages} pages</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{engine.bounceRate}%</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-xs text-gray-500">
                          {new Date(engine.lastVisit).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p className="text-sm">Aucune visite AI détectée pour le moment.</p>
                <p className="text-xs mt-2">Le middleware trackera automatiquement les prochaines visites!</p>
              </div>
            )}
          </div>

          {/* Top Pages avec Score AEO */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <h3 className="text-md font-semibold text-gray-900">🏆 Top Pages (Score AEO)</h3>
              <p className="text-xs text-gray-600 mt-1">Pages avec le meilleur référencement AI</p>
            </div>
            {safeStats.aeo.topPages.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score AEO</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visites AI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crawlers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engines</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Engine</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeStats.aeo.topPages.slice(0, 10).map((page, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                        {page.path}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                              style={{ width: `${page.aeoScore}%` }}
                            />
                          </div>
                          <span className="font-semibold text-blue-600">{page.aeoScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{page.aiVisits}</td>
                      <td className="px-6 py-4 text-sm text-purple-600">{page.crawlerVisits}</td>
                      <td className="px-6 py-4 text-sm text-green-600">{page.referralVisits}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {page.uniqueEngines}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{page.topEngine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p className="text-sm">Aucune donnée pour le moment.</p>
              </div>
            )}
          </div>

          {/* Crawler Activity */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-md font-semibold text-gray-900">🕷️ Activité des Crawlers</h3>
              <p className="text-xs text-gray-600 mt-1">Fréquence de scan et pages crawlées</p>
            </div>
            {safeStats.aeo.crawlerActivity.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crawler</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visites</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pages Scannées</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernier Scan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fréquence</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeStats.aeo.crawlerActivity.map((crawler, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{crawler.engine}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{crawler.visits}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{crawler.pagesScanned} pages</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(crawler.lastScan).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          crawler.scanFrequency.includes('Multiple') ? 'bg-red-100 text-red-700' :
                          crawler.scanFrequency.includes('Daily') ? 'bg-green-100 text-green-700' :
                          crawler.scanFrequency.includes('Weekly') ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {crawler.scanFrequency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p className="text-sm">Aucun crawler détecté pour le moment.</p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* AI Engine Traffic */}
        <CollapsibleSection
          title="Trafic des Moteurs AI"
          subtitle="ChatGPT, Claude, Perplexity, Gemini et autres"
          icon="🤖"
          badge={`${safeStats.aiTraffic.byEngine.length} moteurs détectés`}
          summary={
            <div className="flex gap-6 text-sm">
              <div className="text-right">
                <div className="text-gray-500">Total Sessions AI</div>
                <div className="font-bold text-gray-900">{safeStats.aiTraffic.totalAISessions.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Page Views</div>
                <div className="font-bold text-gray-900">{safeStats.aiTraffic.totalAIPageViews.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">AI/Organic Ratio</div>
                <div className="font-bold text-gray-900">{safeStats.aiTraffic.aiVsOrganicRatio}%</div>
              </div>
            </div>
          }
        >

          {/* AI Engines Breakdown */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-md font-semibold text-gray-900">Traffic by AI Engine</h3>
            </div>
            {(safeStats.aiTraffic.byEngine?.length ?? 0) > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bounce Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(safeStats.aiTraffic.byEngine ?? []).map((engine, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{engine.engine}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{engine.sessions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{engine.pageViews.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{engine.avgSessionDuration}s</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{engine.bounceRate}%</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`${
                          engine.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {engine.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center text-gray-400">
                <p>No AI traffic detected yet</p>
                <p className="text-xs mt-1">AI engines will appear here when they start referring traffic</p>
              </div>
            )}
          </div>

          {/* Time Series Chart */}
          {(safeStats.aiTraffic.timeSeriesData?.length ?? 0) > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">AI Traffic Evolution (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={safeStats.aiTraffic.timeSeriesData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value.slice(0, 4) + '-' + value.slice(4, 6) + '-' + value.slice(6, 8))
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const dateStr = String(value)
                      const date = new Date(dateStr.slice(0, 4) + '-' + dateStr.slice(4, 6) + '-' + dateStr.slice(6, 8))
                      return date.toLocaleDateString()
                    }}
                  />
                  <Line type="monotone" dataKey="chatgpt" stroke="#10a37f" name="ChatGPT" />
                  <Line type="monotone" dataKey="claude" stroke="#cc785c" name="Claude" />
                  <Line type="monotone" dataKey="perplexity" stroke="#6366f1" name="Perplexity" />
                  <Line type="monotone" dataKey="gemini" stroke="#4285f4" name="Gemini" />
                  <Line type="monotone" dataKey="other" stroke="#9ca3af" name="Other" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Landing Pages from AI */}
          {(safeStats.aiTraffic.topLandingPages?.length ?? 0) > 0 && (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-md font-semibold text-gray-900">Top Pages Referred by AI Engines</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Engine</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(safeStats.aiTraffic.topLandingPages ?? []).map((page, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate" title={page.page}>{page.page}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{page.aiSessions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600 whitespace-nowrap">{page.topEngine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CollapsibleSection>

        {/* Search Console Analytics */}
        <CollapsibleSection
          title="Search Console Analytics"
          subtitle="Opportunités SEO et Performance par Appareil"
          icon="🎯"
          badge="Google Search Console"
          summary={
            <div className="flex gap-6 text-sm">
              <div className="text-right">
                <div className="text-gray-500">Opportunités</div>
                <div className="font-bold text-gray-900">{stats?.searchConsole?.opportunities?.length ?? 0}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Clicks</div>
                <div className="font-bold text-gray-900">{typeof safeStats.searchConsole.totalClicks === 'number' ? safeStats.searchConsole.totalClicks.toLocaleString() : safeStats.searchConsole.totalClicks}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">CTR</div>
                <div className="font-bold text-gray-900">{typeof safeStats.searchConsole.avgCTR === 'number' ? safeStats.searchConsole.avgCTR.toFixed(2) : safeStats.searchConsole.avgCTR}%</div>
              </div>
            </div>
          }
        >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Opportunities */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Opportunités SEO</h3>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Quick wins
              </span>
            </div>
            {(safeStats.searchConsole.opportunities?.length ?? 0) > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                  <p className="text-sm text-blue-900">
                    <strong>Tip:</strong> These queries have high impressions but rank 10-30.
                    Optimize content to move to top 5 positions!
                  </p>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Potential</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(safeStats.searchConsole.opportunities ?? []).map((opp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{opp.query}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            #{opp.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{opp.impressions.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-green-600 font-medium">+{opp.potentialClicks} clicks</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
                <p>No opportunities yet</p>
                <p className="text-xs mt-1">Opportunities will appear when you have search data</p>
              </div>
            )}
          </div>

          {/* Device Performance */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">📱 Performance par Appareil</h2>
            </div>
            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700">
                <strong>💡 Qu'est-ce que c'est?</strong> Répartition de vos clics Google Search par type d'appareil.
                Aide à optimiser l'expérience mobile vs desktop.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-6">
                {/* Desktop */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">💻 Desktop</span>
                    <span className="text-sm text-gray-500">
                      {safeStats.searchConsole.deviceBreakdown.desktop.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (safeStats.searchConsole.deviceBreakdown.desktop.clicks /
                            (safeStats.searchConsole.deviceBreakdown.desktop.clicks +
                              safeStats.searchConsole.deviceBreakdown.mobile.clicks +
                              safeStats.searchConsole.deviceBreakdown.tablet.clicks || 1)) *
                            100,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{safeStats.searchConsole.deviceBreakdown.desktop.impressions.toLocaleString()} impr.</span>
                    <span>CTR: {safeStats.searchConsole.deviceBreakdown.desktop.ctr}%</span>
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">📱 Mobile</span>
                    <span className="text-sm text-gray-500">
                      {safeStats.searchConsole.deviceBreakdown.mobile.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (safeStats.searchConsole.deviceBreakdown.mobile.clicks /
                            (safeStats.searchConsole.deviceBreakdown.desktop.clicks +
                              safeStats.searchConsole.deviceBreakdown.mobile.clicks +
                              safeStats.searchConsole.deviceBreakdown.tablet.clicks || 1)) *
                            100,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{safeStats.searchConsole.deviceBreakdown.mobile.impressions.toLocaleString()} impr.</span>
                    <span>CTR: {safeStats.searchConsole.deviceBreakdown.mobile.ctr}%</span>
                  </div>
                </div>

                {/* Tablet */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">📲 Tablet</span>
                    <span className="text-sm text-gray-500">
                      {safeStats.searchConsole.deviceBreakdown.tablet.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (safeStats.searchConsole.deviceBreakdown.tablet.clicks /
                            (safeStats.searchConsole.deviceBreakdown.desktop.clicks +
                              safeStats.searchConsole.deviceBreakdown.mobile.clicks +
                              safeStats.searchConsole.deviceBreakdown.tablet.clicks || 1)) *
                            100,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{safeStats.searchConsole.deviceBreakdown.tablet.impressions.toLocaleString()} impr.</span>
                    <span>CTR: {safeStats.searchConsole.deviceBreakdown.tablet.ctr}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Clicks</span>
                    <span className="font-medium text-gray-900">
                      {(
                        safeStats.searchConsole.deviceBreakdown.desktop.clicks +
                        safeStats.searchConsole.deviceBreakdown.mobile.clicks +
                        safeStats.searchConsole.deviceBreakdown.tablet.clicks
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </CollapsibleSection>

        {/* Content Performance: AI vs Organic */}
        <CollapsibleSection
          title="Performance de Contenu"
          subtitle="Comparaison AI vs Organic - Score d'engagement"
          icon="📊"
          badge="AI vs Organic"
          summary={
            <div className="flex gap-6 text-sm">
              <div className="text-right">
                <div className="text-gray-500">AI Avg Duration</div>
                <div className="font-bold text-blue-600">{safeStats.contentPerformance.overallMetrics.ai.avgSessionDuration}s</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Organic Avg Duration</div>
                <div className="font-bold text-green-600">{safeStats.contentPerformance.overallMetrics.organic.avgSessionDuration}s</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Comparisons</div>
                <div className="font-bold text-gray-900">{safeStats.contentPerformance.comparison.length} pages</div>
              </div>
            </div>
          }
        >

          {/* Overall Metrics Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* AI Overall Metrics */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-blue-900">🤖 AI Engine Performance</h3>
                <span className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded-full font-medium">Overall</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-700 mb-1">Avg Session Duration</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {safeStats.contentPerformance.overallMetrics.ai.avgSessionDuration}s
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 mb-1">Bounce Rate</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {safeStats.contentPerformance.overallMetrics.ai.avgBounceRate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 mb-1">Pages/Session</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {safeStats.contentPerformance.overallMetrics.ai.avgPagesPerSession}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 mb-1">Engagement Rate</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {safeStats.contentPerformance.overallMetrics.ai.avgEngagementRate}%
                  </p>
                </div>
              </div>
            </div>

            {/* Organic Overall Metrics */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-green-900">🔍 Google Organic Performance</h3>
                <span className="text-xs bg-green-200 text-green-900 px-2 py-1 rounded-full font-medium">Overall</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-700 mb-1">Avg Session Duration</p>
                  <p className="text-2xl font-bold text-green-900">
                    {safeStats.contentPerformance.overallMetrics.organic.avgSessionDuration}s
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Bounce Rate</p>
                  <p className="text-2xl font-bold text-green-900">
                    {safeStats.contentPerformance.overallMetrics.organic.avgBounceRate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Pages/Session</p>
                  <p className="text-2xl font-bold text-green-900">
                    {safeStats.contentPerformance.overallMetrics.organic.avgPagesPerSession}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Engagement Rate</p>
                  <p className="text-2xl font-bold text-green-900">
                    {safeStats.contentPerformance.overallMetrics.organic.avgEngagementRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Page-by-Page Comparison */}
          {safeStats.contentPerformance.comparison.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
                <h3 className="text-md font-semibold text-gray-900">⚖️ Page Performance Comparison</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Performance scores calculated from engagement, duration, and bounce rate
                </p>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organic Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organic Sessions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeStats.contentPerformance.comparison.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.page}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center">
                          <span className={`font-bold ${
                            item.aiPerformanceScore > 70 ? 'text-green-600' :
                            item.aiPerformanceScore > 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {item.aiPerformanceScore}/100
                          </span>
                          <span className="ml-2 text-xs text-gray-500">{item.aiAvgDuration}s</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center">
                          <span className={`font-bold ${
                            item.organicPerformanceScore > 70 ? 'text-green-600' :
                            item.organicPerformanceScore > 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {item.organicPerformanceScore}/100
                          </span>
                          <span className="ml-2 text-xs text-gray-500">{item.organicAvgDuration}s</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.winner === 'AI' ? 'bg-blue-100 text-blue-800' :
                          item.winner === 'Organic' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.winner === 'AI' ? '🤖 AI' : item.winner === 'Organic' ? '🔍 Organic' : '⚖️ Equal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.aiSessions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.organicSessions.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Top Pages Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages AI */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                <h3 className="text-md font-semibold text-gray-900">🤖 Top Pages from AI Engines</h3>
              </div>
              {safeStats.contentPerformance.topPagesAI.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Page</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sessions</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {safeStats.contentPerformance.topPagesAI.slice(0, 5).map((page, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-900 max-w-xs truncate">{page.page}</td>
                        <td className="px-4 py-3 text-xs text-gray-900">{page.aiSessions}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`font-medium ${
                            page.aiEngagement > 70 ? 'text-green-600' :
                            page.aiEngagement > 40 ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {page.aiEngagement}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">
                  <p>No AI traffic data yet</p>
                </div>
              )}
            </div>

            {/* Top Pages Organic */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                <h3 className="text-md font-semibold text-gray-900">🔍 Top Pages from Google Organic</h3>
              </div>
              {safeStats.contentPerformance.topPagesOrganic.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Page</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sessions</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {safeStats.contentPerformance.topPagesOrganic.slice(0, 5).map((page, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-900 max-w-xs truncate">{page.page}</td>
                        <td className="px-4 py-3 text-xs text-gray-900">{page.organicSessions}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`font-medium ${
                            page.organicEngagement > 70 ? 'text-green-600' :
                            page.organicEngagement > 40 ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {page.organicEngagement}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">
                  <p>No organic traffic data yet</p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Traffic & Testing */}
        <CollapsibleSection
          title="Traffic & Testing AEO"
          subtitle="Vercel Analytics et Tests de Citation AI"
          icon="📈"
          badge="Analytics & Tests"
          summary={
            <div className="flex gap-6 text-sm">
              <div className="text-right">
                <div className="text-gray-500">Page Views</div>
                <div className="font-bold text-gray-900">{typeof safeStats.vercel.pageViews.total === 'number' ? safeStats.vercel.pageViews.total.toLocaleString() : safeStats.vercel.pageViews.total}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">AEO Tests</div>
                <div className="font-bold text-gray-900">{safeStats.aeoTests.results.length} moteurs</div>
              </div>
            </div>
          }
        >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traffic Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Page Views</span>
                    {safeStats.vercel.pageViews.change !== 'N/A' && (
                      <span className="text-sm text-green-600">{safeStats.vercel.pageViews.change}</span>
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${
                    typeof safeStats.vercel.pageViews.total === 'string' ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {typeof safeStats.vercel.pageViews.total === 'number'
                      ? safeStats.vercel.pageViews.total.toLocaleString()
                      : safeStats.vercel.pageViews.total}
                  </p>
                  {typeof safeStats.vercel.pageViews.total === 'string' && (
                    <p className="text-xs text-gray-400 mt-1">Configure Vercel Analytics</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Unique Visitors</span>
                    {safeStats.vercel.uniqueVisitors.change !== 'N/A' && (
                      <span className="text-sm text-green-600">{safeStats.vercel.uniqueVisitors.change}</span>
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${
                    typeof safeStats.vercel.uniqueVisitors.total === 'string' ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {typeof safeStats.vercel.uniqueVisitors.total === 'number'
                      ? safeStats.vercel.uniqueVisitors.total.toLocaleString()
                      : safeStats.vercel.uniqueVisitors.total}
                  </p>
                  {typeof safeStats.vercel.uniqueVisitors.total === 'string' && (
                    <p className="text-xs text-gray-400 mt-1">Configure Vercel Analytics</p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Top Pages</h3>
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
              {safeStats.vercel.topPages.length > 0 ? (
                safeStats.vercel.topPages.map((page, idx) => (
                  <div key={idx} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{page.path}</span>
                      <span className="text-sm text-green-600">{page.change}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{page.views.toLocaleString()} views</p>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">
                  <p>No data available</p>
                  <p className="text-xs mt-1">Configure Vercel Analytics to see page stats</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Citation Tests */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Citation Tests</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Last test:</span>
                  <span className="font-medium">{safeStats.aeoTests.lastTest}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next test:</span>
                  <span className="font-medium">{safeStats.aeoTests.nextTest}</span>
                </div>
              </div>

              <div className="space-y-4">
                {safeStats.aeoTests.results.map((result, idx) => {
                  const isNA = typeof result.matchScore === 'string'
                  const score = typeof result.matchScore === 'number' ? result.matchScore : 0

                  return (
                    <div key={idx} className={`border-l-4 ${isNA ? 'border-gray-300' : 'border-blue-500'} pl-4`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{result.model}</span>
                        <span className={`text-2xl font-bold ${isNA ? 'text-gray-400' : 'text-blue-600'}`}>
                          {result.matchScore}{typeof result.matchScore === 'number' ? '/5' : ''}
                        </span>
                      </div>
                      {!isNA && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(score / 5) * 100}%` }}
                          ></div>
                        </div>
                      )}
                      {isNA && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {isNA ? 'Manual testing required' : `Updated: ${result.lastUpdate}`}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Match Score Legend:</strong>
                  <br />
                  1-2: Generic response
                  <br />
                  3-4: Structure/wording similar
                  <br />
                  5: Direct citation or exact match
                </p>
              </div>
            </div>
          </div>
        </div>
        </CollapsibleSection>

        {/* Quick Actions - Always Visible */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:p-8 border border-gray-200 mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/admin/settings"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <p className="font-medium text-gray-900">Paramètres</p>
              <p className="text-sm text-gray-500 mt-1">Configuration du site</p>
            </a>
            <a
              href="/admin/api-config"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <p className="font-medium text-gray-900">Configuration API</p>
              <p className="text-sm text-gray-500 mt-1">Gérer les clés API</p>
            </a>
            <button
              onClick={fetchStats}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
            >
              <p className="font-medium text-gray-900">Refresh Data</p>
              <p className="text-sm text-gray-500 mt-1">Update all metrics</p>
            </button>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon,
  isGood = true,
  subtitle
}: {
  title: string
  value: string | number
  change: string
  icon: string
  isGood?: boolean
  subtitle?: string
}) {
  const isNA = value === 'N/A' || change === 'N/A'
  const isPositive = typeof change === 'string' && change.startsWith('+')

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold mb-1 ${isNA ? 'text-gray-400' : 'text-gray-900'}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
      )}
      {!isNA && change !== 'N/A' && (
        <p className={`text-sm font-medium ${
          isPositive === isGood ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </p>
      )}
      {isNA && (
        <p className="text-xs text-gray-400 italic">Pas encore de données</p>
      )}
    </div>
  )
}
