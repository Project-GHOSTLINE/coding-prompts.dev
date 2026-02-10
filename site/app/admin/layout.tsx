import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Coding Prompts',
  description: 'Administration dashboard for Coding Prompts',
  robots: { index: false, follow: false }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
