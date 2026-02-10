'use client'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  label?: string
  showPercentage?: boolean
  height?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({
  value,
  max = 100,
  color = 'blue',
  label,
  showPercentage = false,
  height = 'md'
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-xs font-semibold text-gray-600">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${heightClasses[height]} bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
