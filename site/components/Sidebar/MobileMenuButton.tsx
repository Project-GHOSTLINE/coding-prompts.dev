'use client'

import { Bars3Icon } from '@heroicons/react/24/outline'

interface MobileMenuButtonProps {
  onToggle: () => void
}

export default function MobileMenuButton({ onToggle }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
      aria-label="Toggle menu"
    >
      <Bars3Icon className="w-6 h-6" />
    </button>
  )
}
