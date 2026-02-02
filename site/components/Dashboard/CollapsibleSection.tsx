'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  icon: string
  badge?: string
  summary: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function CollapsibleSection({
  title,
  subtitle,
  icon,
  badge,
  summary,
  children,
  defaultOpen = false
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
      {/* Header - Always Visible */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 lg:px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div className="text-left">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                {badge && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Summary Stats (visible when collapsed) */}
            {!isOpen && (
              <div className="mr-4">
                {summary}
              </div>
            )}

            {/* Toggle Button */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {isOpen ? 'Réduire' : 'Voir détails'}
              </span>
              {isOpen ? (
                <ChevronUpIcon className="w-6 h-6 text-gray-600" />
              ) : (
                <ChevronDownIcon className="w-6 h-6 text-gray-600" />
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Expandable Content */}
      {isOpen && (
        <div className="p-6 lg:p-8 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  )
}
