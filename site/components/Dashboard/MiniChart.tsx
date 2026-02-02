'use client'

interface MiniChartProps {
  data: number[]
  color?: 'blue' | 'green' | 'purple' | 'red'
  height?: number
}

export default function MiniChart({ data, color = 'blue', height = 40 }: MiniChartProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  }

  return (
    <div className="flex items-end gap-1" style={{ height: `${height}px` }}>
      {data.map((value, index) => {
        const percentage = range === 0 ? 50 : ((value - min) / range) * 100
        return (
          <div
            key={index}
            className={`flex-1 bg-gradient-to-t ${colorClasses[color]} rounded-t transition-all duration-300 hover:opacity-80`}
            style={{ height: `${percentage}%`, minHeight: '4px' }}
          />
        )
      })}
    </div>
  )
}
