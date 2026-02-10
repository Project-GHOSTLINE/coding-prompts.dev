'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts'
import Sidebar from '@/components/Sidebar/Sidebar'
import MobileMenuButton from '@/components/Sidebar/MobileMenuButton'
import CollapsibleSection from '@/components/Dashboard/CollapsibleSection'
import MetricCard from '@/components/Dashboard/MetricCard'
import MiniChart from '@/components/Dashboard/MiniChart'
import TrendIndicator from '@/components/Dashboard/TrendIndicator'
import ProgressBar from '@/components/Dashboard/ProgressBar'
import StatComparison from '@/components/Dashboard/StatComparison'
import AEOChart from '@/components/Dashboard/AEOChart'
import DonutChart from '@/components/Dashboard/DonutChart'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Error loading stats. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

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

  // Prepare data for charts
  const trafficDistribution = safeStats.aiTraffic.byEngine.map(engine => ({
    name: engine.engine,
    value: engine.sessions,
    color: engine.engine === 'ChatGPT' ? '#10a37f' :
           engine.engine === 'Claude' ? '#cc785c' :
           engine.engine === 'Perplexity' ? '#6366f1' :
           engine.engine === 'Gemini' ? '#4285f4' : '#9ca3af'
  }))

  const deviceData = [
    { name: 'Desktop', value: safeStats.searchConsole.deviceBreakdown.desktop.clicks, color: '#3b82f6' },
    { name: 'Mobile', value: safeStats.searchConsole.deviceBreakdown.mobile.clicks, color: '#10b981' },
    { name: 'Tablet', value: safeStats.searchConsole.deviceBreakdown.tablet.clicks, color: '#8b5cf6' }
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileMenuButton onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 lg:ml-64 min-h-screen">
        {/* Enhanced Header */}
        <header className="bg-white shadow-lg border-b-4 border-blue-600 sticky top-0 z-20">
          <div className="max-w-[1920px] mx-auto px-8 lg:px-12 py-6">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Dashboard AEO Pro
                    </h1>
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      AI Engine Optimization • coding-prompts.dev
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Last Update</p>
                  <p className="text-sm font-bold text-gray-900">
                    {lastUpdate.toLocaleTimeString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full max-w-[1920px] mx-auto px-8 lg:px-12 py-8 space-y-8">
          {/* Hero Metrics - Key Performance Indicators */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xl shadow-md">📊</span>
              Key Performance Indicators
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="AI Sessions"
                value={safeStats.aiTraffic.totalAISessions.toLocaleString()}
                icon="🤖"
                subtitle="Total AI Engine Visits"
                trend="up"
                change="+12.5%"
                color="blue"
                highlight={true}
              >
                <MiniChart
                  data={(safeStats.aiTraffic.timeSeriesData ?? []).slice(-7).map(d => d.totalAI)}
                  color="blue"
                  height={50}
                />
              </MetricCard>

              <MetricCard
                title="Organic Clicks"
                value={typeof safeStats.searchConsole.totalClicks === 'number' ? safeStats.searchConsole.totalClicks.toLocaleString() : safeStats.searchConsole.totalClicks}
                icon="🔍"
                subtitle="Google Search Traffic"
                trend="up"
                change="+8.3%"
                color="green"
              />

              <MetricCard
                title="Avg Position"
                value={`#${typeof safeStats.searchConsole.avgPosition === 'number' ? safeStats.searchConsole.avgPosition.toFixed(1) : safeStats.searchConsole.avgPosition}`}
                icon="📍"
                subtitle="Search Ranking"
                trend="down"
                change="-2.1"
                color="purple"
              />

              <MetricCard
                title="AEO Score"
                value={`${safeStats.aeo.overview.totalAIVisits}`}
                icon="⭐"
                subtitle="AI Optimization Score"
                trend="up"
                change="+15.2%"
                color="orange"
              />
            </div>
          </div>

          {/* AEO Tracking - Enhanced Section */}
          <CollapsibleSection
            id="aeo-tests"
            title="🎯 AEO Tracking Dashboard"
            subtitle="Real-time AI Engine Activity & Crawler Monitoring"
            icon="🤖"
            badge={`${safeStats.aeo.overview.totalAIVisits} AI visits • ${safeStats.aeo.overview.uniqueEngines} engines`}
            summary={
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
                  <div className="text-xs font-bold uppercase mb-2 opacity-90">Total AI Visits</div>
                  <div className="text-3xl font-black">{safeStats.aeo.overview.totalAIVisits}</div>
                  <TrendIndicator
                    value={`${safeStats.aeo.overview.growthRate > 0 ? '+' : ''}${safeStats.aeo.overview.growthRate}%`}
                    trend={safeStats.aeo.overview.growthRate > 0 ? 'up' : 'down'}
                    size="sm"
                  />
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white">
                  <div className="text-xs font-bold uppercase mb-2 opacity-90">Crawlers</div>
                  <div className="text-3xl font-black">{safeStats.aeo.overview.totalCrawlers}</div>
                  <div className="text-xs mt-2 opacity-75">Bot Activity</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white">
                  <div className="text-xs font-bold uppercase mb-2 opacity-90">Referrals</div>
                  <div className="text-3xl font-black">{safeStats.aeo.overview.totalReferrals}</div>
                  <div className="text-xs mt-2 opacity-75">From AI Engines</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg text-white">
                  <div className="text-xs font-bold uppercase mb-2 opacity-90">Daily Avg</div>
                  <div className="text-3xl font-black">{safeStats.aeo.overview.avgVisitsPerDay}</div>
                  <div className="text-xs mt-2 opacity-75">{safeStats.aeo.overview.uniqueEngines} Engines</div>
                </div>
              </div>
            }
          >
            {/* AEO Chart */}
            <AEOChart data={safeStats.aeo.byEngine} />

            {/* AEO Timeline */}
            {safeStats.aeo.timeline.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">AI Activity Timeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={safeStats.aeo.timeline}>
                    <defs>
                      <linearGradient id="crawlers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="referrals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="crawlers" stroke="#8b5cf6" fillOpacity={1} fill="url(#crawlers)" name="Crawlers" />
                    <Area type="monotone" dataKey="referrals" stroke="#10b981" fillOpacity={1} fill="url(#referrals)" name="Referrals" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CollapsibleSection>

          {/* AI Traffic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {trafficDistribution.length > 0 && (
              <DonutChart
                data={trafficDistribution}
                title="AI Traffic Distribution"
                centerText={safeStats.aiTraffic.totalAISessions.toLocaleString()}
              />
            )}

            {deviceData.some(d => d.value > 0) && (
              <DonutChart
                data={deviceData}
                title="Device Breakdown"
                centerText={`${deviceData.reduce((sum, d) => sum + d.value, 0).toLocaleString()} clicks`}
              />
            )}
          </div>

          {/* Performance Comparisons */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-700 text-white text-xl shadow-md">📈</span>
              Performance Comparisons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatComparison
                title="Session Duration"
                current={safeStats.contentPerformance.overallMetrics.ai.avgSessionDuration}
                previous={safeStats.contentPerformance.overallMetrics.organic.avgSessionDuration}
                format="duration"
                color="blue"
              />
              <StatComparison
                title="Bounce Rate"
                current={safeStats.contentPerformance.overallMetrics.ai.avgBounceRate}
                previous={safeStats.contentPerformance.overallMetrics.organic.avgBounceRate}
                format="percentage"
                color="purple"
              />
              <StatComparison
                title="Pages/Session"
                current={safeStats.contentPerformance.overallMetrics.ai.avgPagesPerSession}
                previous={safeStats.contentPerformance.overallMetrics.organic.avgPagesPerSession}
                format="number"
                color="green"
              />
              <StatComparison
                title="Engagement Rate"
                current={safeStats.contentPerformance.overallMetrics.ai.avgEngagementRate}
                previous={safeStats.contentPerformance.overallMetrics.organic.avgEngagementRate}
                format="percentage"
                color="orange"
              />
            </div>
          </div>

          {/* AI Traffic Trends */}
          {(safeStats.aiTraffic.timeSeriesData?.length ?? 0) > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Traffic Evolution (30 Days)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={safeStats.aiTraffic.timeSeriesData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value.slice(0, 4) + '-' + value.slice(4, 6) + '-' + value.slice(6, 8))
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="chatgpt" stroke="#10a37f" strokeWidth={2} name="ChatGPT" />
                  <Line type="monotone" dataKey="claude" stroke="#cc785c" strokeWidth={2} name="Claude" />
                  <Line type="monotone" dataKey="perplexity" stroke="#6366f1" strokeWidth={2} name="Perplexity" />
                  <Line type="monotone" dataKey="gemini" stroke="#4285f4" strokeWidth={2} name="Gemini" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 border-2 border-blue-200">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={fetchStats}
                className="p-4 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all text-center group"
              >
                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Refresh Data</p>
                <p className="text-sm text-gray-500 mt-1">Update all metrics</p>
              </button>
              <a
                href="/AEO-VERIFICATION.md"
                target="_blank"
                className="p-4 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all text-center group"
              >
                <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">AEO Report</p>
                <p className="text-sm text-gray-500 mt-1">Full verification</p>
              </a>
              <a
                href="/AEO-TEST-RESULTS.md"
                target="_blank"
                className="p-4 bg-white border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all text-center group"
              >
                <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">Test Results</p>
                <p className="text-sm text-gray-500 mt-1">AI citations</p>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
