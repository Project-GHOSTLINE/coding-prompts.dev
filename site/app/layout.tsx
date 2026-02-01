import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://coding-prompts.dev'),
  title: {
    default: 'Coding Prompts - Claude Code Guides & Troubleshooting',
    template: '%s | Coding Prompts'
  },
  description: 'Guides for Claude Code troubleshooting, setup, and features.',
  keywords: ['Claude Code', 'troubleshooting', 'exit code 1', 'setup guide'],
  robots: { index: true, follow: true }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Coding Prompts',
              url: 'https://coding-prompts.dev',
              description: 'Expert Claude Code guides and troubleshooting'
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <header className="border-b bg-white">
          <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">Coding Prompts</a>
            <div className="flex gap-6 text-sm">
              <a href="/troubleshooting" className="hover:text-blue-600">Troubleshooting</a>
              <a href="/setup" className="hover:text-blue-600">Setup</a>
              <a href="/features" className="hover:text-blue-600">Features</a>
              <a href="/vs" className="hover:text-blue-600">Comparisons</a>
            </div>
          </nav>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {children}
        </main>
        <footer className="border-t mt-16 py-8 text-center text-sm text-gray-600">
          <p>© 2026 Coding Prompts - Expert Claude Code Guides</p>
          <p className="mt-2">AI-optimized guides</p>
        </footer>
      </body>
    </html>
  )
}
