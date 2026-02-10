'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AnalyticsChartProps {
  topPages: Array<{ page: string; views: number }>
  topSources: Array<{ source: string; visits: number }>
}

export function AnalyticsChart({ topPages, topSources }: AnalyticsChartProps) {
  if (!topPages || topPages.length === 0) {
    return null
  }

  // Format page names (shorten URLs) - filter out invalid entries
  const formattedPages = topPages
    .filter(p => p && p.page && typeof p.page === 'string')
    .slice(0, 5)
    .map(p => ({
      page: formatPageName(p.page),
      views: p.views || 0
    }))

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-4">📊 Top Pages Performance</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={formattedPages}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="page"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="views" fill="#3b82f6" name="Page Views" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatPageName(page: string | undefined | null): string {
  // Safety check
  if (!page || typeof page !== 'string') {
    return 'Unknown'
  }

  // Remove leading slash and shorten
  const cleaned = page.replace(/^\//, '')
  if (cleaned === '') return 'Home'
  if (cleaned.length > 25) {
    return cleaned.substring(0, 22) + '...'
  }
  return cleaned
}
