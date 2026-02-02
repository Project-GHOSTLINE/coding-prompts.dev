'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  semrush: {
    totalKeywords: number
    avgPosition: number
    estimatedTraffic: number
    totalBacklinks: number
    topKeywords: Array<{
      keyword: string
      position: number
      volume: number
      traffic: number
      url: string
    }>
  }
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
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

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
    return <div>Error loading stats</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard AEO
              </h1>
              <span className="text-xs font-bold font-mono bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-md">
                v1.0.0
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
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
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Overview - Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Vue d'ensemble AEO</h2>
          <p className="text-blue-100 mb-6 text-sm">
            Suivi de votre optimisation pour les moteurs AI (ChatGPT, Claude, Perplexity, etc.)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-100">Total AI Sessions</span>
                <span className="text-2xl">🤖</span>
              </div>
              <p className="text-3xl font-bold">{stats.aiTraffic.totalAISessions.toLocaleString()}</p>
              <p className="text-xs text-blue-100 mt-2">
                Visites provenant des moteurs AI
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-100">Organic Clicks</span>
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-3xl font-bold">
                {typeof stats.searchConsole.totalClicks === 'number'
                  ? stats.searchConsole.totalClicks.toLocaleString()
                  : stats.searchConsole.totalClicks}
              </p>
              <p className="text-xs text-blue-100 mt-2">
                Clics depuis Google Search
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-100">Ranking Position</span>
                <span className="text-2xl">📍</span>
              </div>
              <p className="text-3xl font-bold">
                #{typeof stats.searchConsole.avgPosition === 'number'
                  ? stats.searchConsole.avgPosition.toFixed(1)
                  : stats.searchConsole.avgPosition}
              </p>
              <p className="text-xs text-blue-100 mt-2">
                Position moyenne Google
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-100">AI vs Organic</span>
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-3xl font-bold">{stats.aiTraffic.aiVsOrganicRatio}%</p>
              <p className="text-xs text-blue-100 mt-2">
                Ratio trafic AI/Organic
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <button className="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600">
              Vue d'ensemble
            </button>
            <button className="px-6 py-3 font-medium text-gray-500 hover:text-gray-700">
              Détails (scroll ↓)
            </button>
          </div>
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-900">
              <strong>💡 Comment lire ce dashboard:</strong> La vue d'ensemble ci-dessus montre vos 4 métriques clés.
              Scrollez vers le bas pour voir les détails par section: AI Traffic, SEO, Content Performance.
            </p>
          </div>
        </div>

        {/* SEO Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900">📊 SEO Performance</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Via SEMrush</span>
          </div>
          <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Qu'est-ce que c'est?</strong> Données SEO traditionnelles (Google Search) depuis SEMrush.
              Montre combien de mots-clés vous rankez, votre position moyenne, et le trafic estimé.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Organic Keywords"
              value={stats.semrush.totalKeywords}
              change="N/A"
              icon="📊"
              subtitle="Mots-clés qui vous trouvent"
            />
            <StatCard
              title="Avg Position"
              value={stats.semrush.avgPosition}
              change="N/A"
              icon="📍"
              isGood={false}
              subtitle="Position moyenne Google"
            />
            <StatCard
              title="Est. Traffic/mo"
              value={typeof stats.semrush.estimatedTraffic === 'number' ? stats.semrush.estimatedTraffic.toLocaleString() : stats.semrush.estimatedTraffic}
              change="N/A"
              icon="👥"
              subtitle="Visites mensuelles estimées"
            />
            <StatCard
              title="Backlinks"
              value={stats.semrush.totalBacklinks}
              change="N/A"
              icon="🔗"
              subtitle="Liens entrants vers votre site"
            />
          </div>
        </div>

        {/* Top Keywords */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Keywords</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Traffic</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.semrush.topKeywords.map((kw, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{kw.keyword}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        kw.position <= 3 ? 'bg-green-100 text-green-800' :
                        kw.position <= 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        #{kw.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{kw.volume.toLocaleString()}/mo</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{kw.traffic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Engine Traffic */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900">🤖 Trafic des Moteurs AI</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              {stats.aiTraffic.byEngine.length} moteurs détectés
            </span>
          </div>
          <div className="mb-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-blue-900">
              <strong>💡 Qu'est-ce que c'est?</strong> Le trafic provenant des moteurs de recherche AI comme ChatGPT, Claude, Perplexity, Gemini.
              Ces utilisateurs trouvent votre site via des réponses générées par AI. C'est l'essence de l'AEO (AI Engine Optimization).
            </p>
          </div>

          {/* AI Engines Breakdown */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-md font-semibold text-gray-900">Traffic by AI Engine</h3>
            </div>
            {stats.aiTraffic.byEngine.length > 0 ? (
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
                  {stats.aiTraffic.byEngine.map((engine, idx) => (
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
          {stats.aiTraffic.timeSeriesData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">AI Traffic Evolution (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.aiTraffic.timeSeriesData}>
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
          {stats.aiTraffic.topLandingPages.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  {stats.aiTraffic.topLandingPages.map((page, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{page.page}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{page.aiSessions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{page.topEngine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Search Opportunities & Device Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Search Opportunities */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900">🎯 Opportunités SEO</h2>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Quick wins
              </span>
            </div>
            <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-900">
                <strong>💡 Astuce:</strong> Ces mots-clés ont beaucoup d'impressions mais rankent entre 10-30.
                Optimisez ces pages pour atteindre le top 5 et multiplier vos clics!
              </p>
            </div>
            {stats.searchConsole.opportunities.length > 0 ? (
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
                    {stats.searchConsole.opportunities.map((opp, idx) => (
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
                      {stats.searchConsole.deviceBreakdown.desktop.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (stats.searchConsole.deviceBreakdown.desktop.clicks /
                            (stats.searchConsole.deviceBreakdown.desktop.clicks +
                              stats.searchConsole.deviceBreakdown.mobile.clicks +
                              stats.searchConsole.deviceBreakdown.tablet.clicks || 1)) *
                            100,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{stats.searchConsole.deviceBreakdown.desktop.impressions.toLocaleString()} impr.</span>
                    <span>CTR: {stats.searchConsole.deviceBreakdown.desktop.ctr}%</span>
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">📱 Mobile</span>
                    <span className="text-sm text-gray-500">
                      {stats.searchConsole.deviceBreakdown.mobile.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (stats.searchConsole.deviceBreakdown.mobile.clicks /
                            (stats.searchConsole.deviceBreakdown.desktop.clicks +
                              stats.searchConsole.deviceBreakdown.mobile.clicks +
                              stats.searchConsole.deviceBreakdown.tablet.clicks || 1)) *
                            100,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{stats.searchConsole.deviceBreakdown.mobile.impressions.toLocaleString()} impr.</span>
                    <span>CTR: {stats.searchConsole.deviceBreakdown.mobile.ctr}%</span>
                  </div>
                </div>

                {/* Tablet */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">📲 Tablet</span>
                    <span className="text-sm text-gray-500">
                      {stats.searchConsole.deviceBreakdown.tablet.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (stats.searchConsole.deviceBreakdown.tablet.clicks /
                            (stats.searchConsole.deviceBreakdown.desktop.clicks +
                              stats.searchConsole.deviceBreakdown.mobile.clicks +
                              stats.searchConsole.deviceBreakdown.tablet.clicks || 1)) *
                            100,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{stats.searchConsole.deviceBreakdown.tablet.impressions.toLocaleString()} impr.</span>
                    <span>CTR: {stats.searchConsole.deviceBreakdown.tablet.ctr}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Clicks</span>
                    <span className="font-medium text-gray-900">
                      {(
                        stats.searchConsole.deviceBreakdown.desktop.clicks +
                        stats.searchConsole.deviceBreakdown.mobile.clicks +
                        stats.searchConsole.deviceBreakdown.tablet.clicks
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Performance: AI vs Organic */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900">📊 Performance de Contenu</h2>
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
              AI vs Organic
            </span>
          </div>
          <div className="mb-6 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-purple-900 mb-2">
              <strong>💡 Qu'est-ce que c'est?</strong> Compare comment vos pages performent selon la source de trafic (AI vs Google Organic).
            </p>
            <p className="text-sm text-purple-900">
              <strong>Score de performance (0-100):</strong> Calculé selon engagement (40%), durée de session (40%), et bounce rate (20%).
              Un score élevé = visiteurs engagés qui restent et explorent.
            </p>
          </div>

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
                    {stats.contentPerformance.overallMetrics.ai.avgSessionDuration}s
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 mb-1">Bounce Rate</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.contentPerformance.overallMetrics.ai.avgBounceRate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 mb-1">Pages/Session</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.contentPerformance.overallMetrics.ai.avgPagesPerSession}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 mb-1">Engagement Rate</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.contentPerformance.overallMetrics.ai.avgEngagementRate}%
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
                    {stats.contentPerformance.overallMetrics.organic.avgSessionDuration}s
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Bounce Rate</p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.contentPerformance.overallMetrics.organic.avgBounceRate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Pages/Session</p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.contentPerformance.overallMetrics.organic.avgPagesPerSession}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Engagement Rate</p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.contentPerformance.overallMetrics.organic.avgEngagementRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Page-by-Page Comparison */}
          {stats.contentPerformance.comparison.length > 0 && (
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
                  {stats.contentPerformance.comparison.map((item, idx) => (
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
              {stats.contentPerformance.topPagesAI.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Page</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sessions</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.contentPerformance.topPagesAI.slice(0, 5).map((page, idx) => (
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
              {stats.contentPerformance.topPagesOrganic.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Page</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sessions</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.contentPerformance.topPagesOrganic.slice(0, 5).map((page, idx) => (
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Traffic Stats */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Page Views</span>
                    {stats.vercel.pageViews.change !== 'N/A' && (
                      <span className="text-sm text-green-600">{stats.vercel.pageViews.change}</span>
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${
                    typeof stats.vercel.pageViews.total === 'string' ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {typeof stats.vercel.pageViews.total === 'number'
                      ? stats.vercel.pageViews.total.toLocaleString()
                      : stats.vercel.pageViews.total}
                  </p>
                  {typeof stats.vercel.pageViews.total === 'string' && (
                    <p className="text-xs text-gray-400 mt-1">Configure Vercel Analytics</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Unique Visitors</span>
                    {stats.vercel.uniqueVisitors.change !== 'N/A' && (
                      <span className="text-sm text-green-600">{stats.vercel.uniqueVisitors.change}</span>
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${
                    typeof stats.vercel.uniqueVisitors.total === 'string' ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {typeof stats.vercel.uniqueVisitors.total === 'number'
                      ? stats.vercel.uniqueVisitors.total.toLocaleString()
                      : stats.vercel.uniqueVisitors.total}
                  </p>
                  {typeof stats.vercel.uniqueVisitors.total === 'string' && (
                    <p className="text-xs text-gray-400 mt-1">Configure Vercel Analytics</p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Top Pages</h3>
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
              {stats.vercel.topPages.length > 0 ? (
                stats.vercel.topPages.map((page, idx) => (
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
                  <span className="font-medium">{stats.aeoTests.lastTest}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next test:</span>
                  <span className="font-medium">{stats.aeoTests.nextTest}</span>
                </div>
              </div>

              <div className="space-y-4">
                {stats.aeoTests.results.map((result, idx) => {
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
                        {isNA ? 'Manual testing required - see AEO-TEST-RESULTS.md' : `Updated: ${result.lastUpdate}`}
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/AEO-VERIFICATION.md"
              target="_blank"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <p className="font-medium text-gray-900">View AEO Report</p>
              <p className="text-sm text-gray-500 mt-1">Full verification document</p>
            </a>
            <a
              href="/AEO-TEST-RESULTS.md"
              target="_blank"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <p className="font-medium text-gray-900">Test Results</p>
              <p className="text-sm text-gray-500 mt-1">AI citation tracking</p>
            </a>
            <button
              onClick={fetchStats}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <p className="font-medium text-gray-900">Refresh Data</p>
              <p className="text-sm text-gray-500 mt-1">Update all metrics</p>
            </button>
          </div>
        </div>
      </main>
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
