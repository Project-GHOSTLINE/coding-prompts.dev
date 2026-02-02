'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import MobileMenuButton from '@/components/Sidebar/MobileMenuButton'

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData] = useState({
    visitors: 'N/A',
    pageViews: 'N/A',
    aiSessions: 'N/A',
    organic: 'N/A'
  })

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => {
        if (res.status === 401) {
          router.push('/admin/login')
          return null
        }
        return res.json()
      })
      .then(json => {
        if (json) {
          setData({
            visitors: json.vercel?.uniqueVisitors?.total || 'N/A',
            pageViews: json.vercel?.pageViews?.total || 'N/A',
            aiSessions: json.aiTraffic?.totalAISessions || 'N/A',
            organic: json.searchConsole?.totalClicks || 'N/A'
          })
        }
      })
      .catch(() => {
        // Silently fail, keep N/A values
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileMenuButton onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 lg:ml-64">
        <header className="bg-white shadow-sm border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard AEO</h1>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-sm text-gray-600">Visitors</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{data.visitors}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl mb-2">👁️</div>
              <div className="text-sm text-gray-600">Page Views</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{data.pageViews}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl mb-2">🤖</div>
              <div className="text-sm text-gray-600">AI Sessions</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{data.aiSessions}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-sm text-gray-600">Organic Traffic</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{data.organic}</div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => window.location.reload()}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                🔄 Refresh Data
              </button>
              <a
                href="/AEO-VERIFICATION.md"
                target="_blank"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                📄 AEO Report
              </a>
              <a
                href="/AEO-TEST-RESULTS.md"
                target="_blank"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                📊 Test Results
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
