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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AEO Dashboard</h1>
            <p className="text-sm text-gray-500">coding-prompts.dev</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SEO Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Performance (SEMrush)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Organic Keywords"
              value={stats.semrush.totalKeywords}
              change="+12"
              icon="📊"
            />
            <StatCard
              title="Avg Position"
              value={stats.semrush.avgPosition}
              change="-0.3"
              icon="📍"
              isGood={(stats.semrush.avgPosition < 10)}
            />
            <StatCard
              title="Est. Traffic/mo"
              value={`${stats.semrush.estimatedTraffic.toLocaleString()}`}
              change="+18%"
              icon="👥"
            />
            <StatCard
              title="Backlinks"
              value={stats.semrush.totalBacklinks}
              change="+2"
              icon="🔗"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Traffic Stats */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Page Views</span>
                    <span className="text-sm text-green-600">{stats.vercel.pageViews.change}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.vercel.pageViews.total.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Unique Visitors</span>
                    <span className="text-sm text-green-600">{stats.vercel.uniqueVisitors.change}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.vercel.uniqueVisitors.total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Top Pages</h3>
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
              {stats.vercel.topPages.map((page, idx) => (
                <div key={idx} className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{page.path}</span>
                    <span className="text-sm text-green-600">{page.change}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{page.views.toLocaleString()} views</p>
                </div>
              ))}
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
                {stats.aeoTests.results.map((result, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{result.model}</span>
                      <span className="text-2xl font-bold text-blue-600">{result.matchScore}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(result.matchScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Updated: {result.lastUpdate}</p>
                  </div>
                ))}
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
  isGood = true
}: {
  title: string
  value: string | number
  change: string
  icon: string
  isGood?: boolean
}) {
  const isPositive = change.startsWith('+')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className={`text-sm mt-2 ${
        isPositive === isGood ? 'text-green-600' : 'text-red-600'
      }`}>
        {change} this week
      </p>
    </div>
  )
}
