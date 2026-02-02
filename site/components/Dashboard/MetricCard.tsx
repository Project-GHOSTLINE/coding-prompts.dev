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
  children
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 sm:col-span-2 lg:col-span-2',
    large: 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3'
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`text-4xl transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
              {icon}
            </span>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {change && trend !== 'neutral' && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className={`font-bold text-gray-900 ${
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
      <div className={`h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-xl transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  )
}
