'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import TrendIndicator from './TrendIndicator'

interface AEOChartProps {
  data: Array<{
    engine: string
    crawlerVisits: number
    referralVisits: number
    totalVisits: number
    trend: 'up' | 'down' | 'stable'
  }>
}

export default function AEOChart({ data }: AEOChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Engine Activity</h3>
        <div className="text-center text-gray-500 py-12">
          Aucune activité AEO détectée pour le moment
        </div>
      </div>
    )
  }

  const chartData = data.map(engine => ({
    name: engine.engine,
    Crawlers: engine.crawlerVisits,
    Referrals: engine.referralVisits
  }))

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Engine Activity</h3>
          <p className="text-sm text-gray-600 mt-1">Crawlers vs Referral Traffic</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, d) => sum + d.totalVisits, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Total Visits</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar
            dataKey="Crawlers"
            fill="#8b5cf6"
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          />
          <Bar
            dataKey="Referrals"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        {data.slice(0, 4).map((engine, idx) => (
          <div key={idx} className="text-center">
            <p className="text-xs text-gray-500 mb-1">{engine.engine}</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-bold text-gray-900">{engine.totalVisits}</p>
              <TrendIndicator
                value=""
                trend={engine.trend === 'up' ? 'up' : engine.trend === 'down' ? 'down' : 'neutral'}
                showIcon={true}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
