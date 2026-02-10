'use client'

import { useState } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  icon: string
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
  children?: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
  highlight?: boolean
}

export default function MetricCard({
  title,
  value,
  change,
  icon,
  subtitle,
  trend = 'neutral',
  size = 'medium',
  onClick,
  children,
  color = 'blue',
  highlight = false
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 sm:col-span-2',
    large: 'col-span-1 sm:col-span-2 lg:col-span-3'
  }

  const colorClasses = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
    orange: 'from-orange-600 to-orange-700',
    red: 'from-red-600 to-red-700',
    indigo: 'from-indigo-600 to-indigo-700'
  }

  const highlightClass = highlight
    ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl'
    : ''

  return (
    <div
      className={`${sizeClasses[size]} bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 ${onClick ? 'cursor-pointer' : ''} ${highlightClass}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} shadow-md transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
              <span className="text-2xl filter drop-shadow-sm">
                {icon}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {change && trend !== 'neutral' && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
              trend === 'up'
                ? 'bg-green-100 text-green-700'
                : trend === 'down'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-3 h-3" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className={`font-extrabold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent ${
            size === 'small' ? 'text-2xl' : size === 'medium' ? 'text-3xl' : 'text-4xl'
          }`}>
            {value}
          </div>
        </div>

        {/* Children content */}
        {children && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {children}
          </div>
        )}
      </div>

      {/* Animated border effect */}
      <div className={`h-1.5 bg-gradient-to-r ${colorClasses[color]} rounded-b-xl transition-all duration-300 ${
        isHovered ? 'opacity-100 h-2' : 'opacity-70'
      }`} />
    </div>
  )
}
