'use client'

interface TrendIndicatorProps {
  value: number | string
  trend?: 'up' | 'down' | 'neutral'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function TrendIndicator({
  value,
  trend = 'neutral',
  showIcon = true,
  size = 'md'
}: TrendIndicatorProps) {
  const isPositive = trend === 'up'
  const isNegative = trend === 'down'

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (trend === 'neutral') {
    return (
      <span className={`${sizeClasses[size]} font-medium text-gray-500`}>
        {value}
      </span>
    )
  }

  return (
    <div className={`inline-flex items-center gap-1 ${sizeClasses[size]} font-semibold ${
      isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
    }`}>
      {showIcon && (
        <span className={iconSizes[size]}>
          {isPositive ? '↗' : isNegative ? '↘' : '→'}
        </span>
      )}
      <span>{value}</span>
    </div>
  )
}
