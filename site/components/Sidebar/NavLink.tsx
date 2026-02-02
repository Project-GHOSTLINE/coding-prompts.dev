'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  onClick?: () => void
}

export default function NavLink({ href, children, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        'block px-12 py-2 text-sm transition-colors rounded-lg mx-2',
        isActive
          ? 'bg-blue-600 text-white font-medium'
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      )}
    >
      {children}
    </Link>
  )
}
