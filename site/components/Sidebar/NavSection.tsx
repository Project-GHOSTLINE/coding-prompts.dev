'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { NavigationSection } from '@/lib/navigation'
import NavLink from './NavLink'
import clsx from 'clsx'

interface NavSectionProps {
  section: NavigationSection
  onLinkClick?: () => void
}

export default function NavSection({ section, onLinkClick }: NavSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const Icon = section.icon

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors rounded-lg mx-2"
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left font-medium">{section.label}</span>
        <ChevronDownIcon
          className={clsx(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="space-y-1 py-2">
          {section.items.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
