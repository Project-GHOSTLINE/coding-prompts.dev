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
        {children}
      </body>
    </html>
  )
}
