'use client'

import Link from 'next/link'
import { navigationSections } from '@/lib/navigation'
import NavSection from './NavSection'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen w-64 bg-gray-950 text-white',
        'border-r border-white/10 overflow-y-auto z-40',
        'transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'sidebar-scroll'
      )}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/admin/dashboard" onClick={onClose}>
          <h1 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
            Dashboard AEO
          </h1>
          <p className="text-xs text-gray-400 mt-1">Analytics & Optimization</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="py-4">
        {navigationSections.map((section) => (
          <NavSection
            key={section.id}
            section={section}
            onLinkClick={onClose}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-gray-950 space-y-3">
        <Link
          href="/admin/dashboard"
          onClick={onClose}
          className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-sm shadow-md"
        >
          📊 Dashboard Admin
        </Link>
        <p className="text-xs text-gray-500 text-center">
          © 2026 Coding Prompts
        </p>
      </div>
    </aside>
  )
}
