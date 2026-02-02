'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar/Sidebar'
import MobileMenuButton from '@/components/Sidebar/MobileMenuButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile menu button */}
      <MobileMenuButton onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content with margin for sidebar */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {children}
      </div>
    </div>
  )
}
