'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ApiEndpoint {
  name: string
  status: 'loading' | 'success' | 'failed'
  error?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { name: 'SEMrush', status: 'loading' },
    { name: 'Google Search Console', status: 'loading' },
    { name: 'Google Analytics', status: 'loading' },
    { name: 'AI Traffic', status: 'loading' },
    { name: 'Content Performance', status: 'loading' }
  ])

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => {
        if (res.status === 401) {
          router.push('/admin/login')
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data) {
          setEndpoints([
            {
              name: 'SEMrush',
              status: data.semrush && data.semrush.totalKeywords !== 'N/A' ? 'success' : 'failed',
              error: data.semrush?.totalKeywords === 'N/A' ? 'No data available' : undefined
            },
            {
              name: 'Google Search Console',
              status: data.searchConsole && data.searchConsole.totalClicks !== 'N/A' ? 'success' : 'failed',
              error: data.searchConsole?.totalClicks === 'N/A' ? 'No data available' : undefined
            },
            {
              name: 'Google Analytics',
              status: data.analytics && data.analytics.pageViews?.total !== 'N/A' ? 'success' : 'failed',
              error: data.analytics?.pageViews?.total === 'N/A' ? 'No data available' : undefined
            },
            {
              name: 'AI Traffic',
              status: data.aiTraffic && data.aiTraffic.totalAISessions > 0 ? 'success' : 'failed',
              error: !data.aiTraffic || data.aiTraffic.totalAISessions === 0 ? 'No AI sessions detected' : undefined
            },
            {
              name: 'Content Performance',
              status: data.contentPerformance && data.contentPerformance.topPagesAI?.length > 0 ? 'success' : 'failed',
              error: !data.contentPerformance || data.contentPerformance.topPagesAI?.length === 0 ? 'No data available' : undefined
            }
          ])
        }
      })
      .catch(error => {
        setEndpoints(prev => prev.map(ep => ({
          ...ep,
          status: 'failed',
          error: 'API call failed'
        })))
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const successCount = endpoints.filter(ep => ep.status === 'success').length
  const failedCount = endpoints.filter(ep => ep.status === 'failed').length
  const loadingCount = endpoints.filter(ep => ep.status === 'loading').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">API Status Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Summary */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Success</div>
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
          </div>
          <div className="flex-1 bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
          </div>
          <div className="flex-1 bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Loading</div>
            <div className="text-2xl font-bold text-gray-400">{loadingCount}</div>
          </div>
        </div>

        {/* Endpoints List */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="font-semibold">API Endpoints</h2>
          </div>
          <div className="divide-y">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  {endpoint.status === 'loading' && (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  )}
                  {endpoint.status === 'success' && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                  {endpoint.status === 'failed' && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                      ✗
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{endpoint.name}</div>
                    {endpoint.error && (
                      <div className="text-sm text-red-500 mt-1">{endpoint.error}</div>
                    )}
                  </div>
                </div>
                <div>
                  {endpoint.status === 'success' && (
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Success
                    </span>
                  )}
                  {endpoint.status === 'failed' && (
                    <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                      Failed
                    </span>
                  )}
                  {endpoint.status === 'loading' && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      Loading...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
