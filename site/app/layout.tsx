'use client'

import { useState } from 'react'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Sidebar from '@/components/Sidebar/Sidebar'
import MobileMenuButton from '@/components/Sidebar/MobileMenuButton'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="en">
      <head>
        <title>Coding Prompts - Claude Code Guides & Troubleshooting</title>
        <meta name="description" content="Guides for Claude Code troubleshooting, setup, and features." />
        <meta name="keywords" content="Claude Code, troubleshooting, exit code 1, setup guide" />
        <meta name="robots" content="index, follow" />
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
      <body className={`${inter.className} flex min-h-screen bg-gray-50`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-24Q7ZZ71LB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-24Q7ZZ71LB');
          `}
        </Script>

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
          <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
            {children}
          </main>
          <footer className="border-t py-8 text-center text-sm text-gray-600 bg-white">
            <p>© 2026 Coding Prompts - Expert Claude Code Guides</p>
            <p className="mt-2">AI-optimized guides for Claude Code</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
