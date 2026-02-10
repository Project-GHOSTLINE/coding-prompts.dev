'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrafficChartProps {
  data: Array<{
    date: string
    totalAI: number
    chatgpt: number
    claude: number
    perplexity: number
    gemini: number
    other: number
  }>
}

export function TrafficChart({ data }: TrafficChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-4">📈 AI Traffic Trends (30 Days)</h3>
        <div className="text-center text-gray-500 py-12">
          Aucune donnée de trafic AI disponible
        </div>
      </div>
    )
  }

  // Format dates for display - with safety checks
  const formattedData = data
    .filter(d => d && typeof d === 'object')
    .map(d => ({
      date: formatDate(d.date || ''),
      totalAI: d.totalAI || 0,
      chatgpt: d.chatgpt || 0,
      claude: d.claude || 0,
      perplexity: d.perplexity || 0,
      gemini: d.gemini || 0,
      other: d.other || 0
    }))

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-4">📈 AI Traffic Trends (30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalAI"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Total AI"
          />
          <Line
            type="monotone"
            dataKey="chatgpt"
            stroke="#10b981"
            strokeWidth={1.5}
            name="ChatGPT"
          />
          <Line
            type="monotone"
            dataKey="claude"
            stroke="#6366f1"
            strokeWidth={1.5}
            name="Claude"
          />
          <Line
            type="monotone"
            dataKey="gemini"
            stroke="#f59e0b"
            strokeWidth={1.5}
            name="Gemini"
          />
          <Line
            type="monotone"
            dataKey="perplexity"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            name="Perplexity"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatDate(dateString: string | undefined): string {
  // Safety check
  if (!dateString || typeof dateString !== 'string') {
    return 'N/A'
  }

  // Format: YYYYMMDD -> MM/DD
  if (dateString.length === 8) {
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    return `${month}/${day}`
  }
  return dateString
}
