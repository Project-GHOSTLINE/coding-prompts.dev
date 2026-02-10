'use client'

import TrendIndicator from './TrendIndicator'
import ProgressBar from './ProgressBar'

interface StatComparisonProps {
  title: string
  current: number
  previous: number
  format?: 'number' | 'percentage' | 'duration'
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

export default function StatComparison({
  title,
  current,
  previous,
  format = 'number',
  color = 'blue'
}: StatComparisonProps) {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'

  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'duration':
        return `${val}s`
      default:
        return val.toLocaleString()
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <TrendIndicator value={`${change > 0 ? '+' : ''}${change.toFixed(1)}%`} trend={trend} size="sm" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Actuel</span>
          <span className="text-lg font-bold text-gray-900">{formatValue(current)}</span>
        </div>

        <ProgressBar
          value={current}
          max={Math.max(current, previous) * 1.2}
          color={color}
          height="sm"
        />

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Précédent</span>
          <span>{formatValue(previous)}</span>
        </div>
      </div>
    </div>
  )
}
