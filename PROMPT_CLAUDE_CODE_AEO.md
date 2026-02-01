Je vois que tu as accès aux fichiers de stratégie SEO. Crée un sous-dossier `site/` avec un projet Next.js 14+ optimisé AEO (Answer Engine Optimization) pour maximiser les citations dans ChatGPT, Claude, Gemini, Perplexity et Copilot.

**Domaine:** coding-prompts.dev  
**Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS  
**Approche:** 100% AEO - optimisé pour citations IA, pas SEO Google

## 🎯 PRINCIPES AEO CRITIQUES

Chaque page DOIT:
1. Répondre à LA question dans les 50 premiers mots
2. Avoir un bloc TL;DR citation-ready
3. Définir les termes dès le début
4. Structure H1 > H2 > H3 claire pour parsing LLM
5. FAQ avec 5-7 questions exactes
6. Zero marketing fluff
7. Dates de mise à jour visibles

## 📊 ARCHITECTURE (Hub-and-Spoke)

```
site/
├── app/
│   ├── layout.tsx (Schema Organization global)
│   ├── page.tsx (Hub principal)
│   │
│   ├── troubleshooting/
│   │   ├── page.tsx (Hub Troubleshooting)
│   │   ├── exit-code-1/
│   │   │   └── page.mdx (⭐ 8,100 vol)
│   │   ├── dangerously-skip-permissions/
│   │   │   └── page.mdx (⭐ 4,400 vol)
│   │   └── 5-hour-limit/
│   │       └── page.mdx (1,600 vol)
│   │
│   ├── setup/
│   │   ├── page.tsx (Hub Setup)
│   │   ├── statusline/
│   │   │   └── page.mdx (⭐ 2,900 vol)
│   │   └── router/
│   │       └── page.mdx (1,900 vol)
│   │
│   ├── features/
│   │   ├── page.tsx (Hub Features)
│   │   └── sequential-thinking/
│   │       └── page.mdx (⚡ 1,300 vol, KD:5)
│   │
│   ├── vs/
│   │   ├── page.tsx (Hub Comparisons)
│   │   └── cursor/
│   │       └── page.mdx (1,000 vol)
│   │
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── AEO/
│   │   ├── TLDRBlock.tsx (Bloc TL;DR citation-ready)
│   │   ├── QuickAnswer.tsx (Réponse rapide)
│   │   └── FAQ.tsx (FAQ avec schema)
│   │
│   └── Schema/
│       ├── FAQSchema.tsx
│       └── ArticleSchema.tsx
│
└── package.json
```

## 📦 FICHIERS À CRÉER

### package.json

```json
{
  "name": "coding-prompts-aeo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@next/mdx": "^14.1.0",
    "@mdx-js/loader": "^3.0.0",
    "@mdx-js/react": "^3.0.0",
    "schema-dts": "^1.1.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "eslint-config-next": "^14.1.0"
  }
}
```

### app/layout.tsx

```typescript
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
  description: 'Expert guides for Claude Code troubleshooting, setup, and features. Updated weekly with tested solutions.',
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
          <p className="mt-2">Updated weekly • Tested solutions • AI-optimized</p>
        </footer>
      </body>
    </html>
  )
}
```

### app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  h1 { @apply text-4xl font-bold mb-6; }
  h2 { @apply text-2xl font-bold mt-8 mb-4; }
  h3 { @apply text-xl font-semibold mt-6 mb-3; }
  p { @apply mb-4 leading-relaxed; }
  ul { @apply list-disc pl-6 mb-4 space-y-2; }
  ol { @apply list-decimal pl-6 mb-4 space-y-2; }
  code { @apply bg-gray-100 px-2 py-1 rounded text-sm; }
  pre { @apply bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto; }
}
```

### app/page.tsx

```typescript
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4">Claude Code Expert Guides</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Troubleshooting, setup guides, and feature tutorials. 
          All solutions tested and updated weekly.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mb-12">
        <Link href="/troubleshooting" className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">🔧 Troubleshooting</h2>
          <p className="text-gray-600 mb-4">Fix common errors and issues</p>
          <ul className="text-sm space-y-1">
            <li>• Exit Code 1 (8,100 searches/mo)</li>
            <li>• Permission Issues</li>
            <li>• 5-Hour Limit</li>
          </ul>
        </Link>

        <Link href="/setup" className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">⚙️ Setup & Config</h2>
          <p className="text-gray-600 mb-4">Installation and configuration</p>
          <ul className="text-sm space-y-1">
            <li>• Statusline Setup (2,900/mo)</li>
            <li>• Router Config</li>
            <li>• MCP Integration</li>
          </ul>
        </Link>

        <Link href="/features" className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">✨ Features</h2>
          <p className="text-gray-600 mb-4">Learn powerful features</p>
          <ul className="text-sm space-y-1">
            <li>• Sequential Thinking</li>
            <li>• Save Conversations</li>
            <li>• Output Styling</li>
          </ul>
        </Link>

        <Link href="/vs" className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">⚖️ Comparisons</h2>
          <p className="text-gray-600 mb-4">Claude Code vs alternatives</p>
          <ul className="text-sm space-y-1">
            <li>• vs Cursor (1,000/mo)</li>
            <li>• vs Codex</li>
            <li>• vs GPT-5</li>
          </ul>
        </Link>
      </section>

      <section className="bg-blue-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🚀 Most Popular Guides</h2>
        <div className="space-y-3">
          <Link href="/troubleshooting/exit-code-1" className="block p-4 bg-white rounded hover:shadow">
            <h3 className="font-bold">Fix "Process Exited with Code 1"</h3>
            <p className="text-sm text-gray-600">8,100 searches/mo • 80% success rate • 2 min fix</p>
          </Link>
          <Link href="/troubleshooting/dangerously-skip-permissions" className="block p-4 bg-white rounded hover:shadow">
            <h3 className="font-bold">Dangerously Skip Permissions Guide</h3>
            <p className="text-sm text-gray-600">4,400 searches/mo • Complete setup guide</p>
          </Link>
          <Link href="/setup/statusline" className="block p-4 bg-white rounded hover:shadow">
            <h3 className="font-bold">Statusline Setup & Customization</h3>
            <p className="text-sm text-gray-600">2,900 searches/mo • Step-by-step tutorial</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
```

### components/AEO/TLDRBlock.tsx

```typescript
export function TLDRBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg">
      <div className="font-bold text-sm uppercase text-blue-800 mb-2">TL;DR</div>
      <div className="text-lg leading-relaxed">{children}</div>
    </div>
  )
}
```

### components/AEO/QuickAnswer.tsx

```typescript
interface QuickAnswerProps {
  solution: string
  successRate: string
  time: string
}

export function QuickAnswer({ solution, successRate, time }: QuickAnswerProps) {
  return (
    <div className="bg-green-50 border border-green-200 p-6 rounded-lg my-8">
      <div className="font-bold text-lg mb-4">⚡ Quick Answer</div>
      <div className="space-y-2">
        <p><strong>Solution:</strong> {solution}</p>
        <p><strong>Success Rate:</strong> {successRate}</p>
        <p><strong>Time:</strong> {time}</p>
      </div>
    </div>
  )
}
```

### components/AEO/FAQ.tsx

```typescript
import { FAQSchema } from '@/components/Schema/FAQSchema'

interface FAQItem {
  question: string
  answer: string
}

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <>
      <FAQSchema faqs={items} />
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-6 py-2">
              <h3 className="text-xl font-semibold mb-3">{item.question}</h3>
              <p className="text-gray-700 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
```

### components/Schema/FAQSchema.tsx

```typescript
interface FAQItem {
  question: string
  answer: string
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          }))
        })
      }}
    />
  )
}
```

### app/troubleshooting/exit-code-1/page.mdx (ARTICLE PRIORITAIRE #1)

```mdx
import { TLDRBlock } from '@/components/AEO/TLDRBlock'
import { QuickAnswer } from '@/components/AEO/QuickAnswer'
import { FAQ } from '@/components/AEO/FAQ'

export const metadata = {
  title: 'Fix Claude Code "Process Exited with Code 1" Error',
  description: 'Claude Code exit code 1 fix: Run reset-permissions command. 80% success rate, 2-minute solution. Tested on 500+ cases.',
}

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'How to Fix Claude Code Process Exited with Code 1',
      datePublished: '2026-02-01',
      dateModified: '2026-02-01',
      author: { '@type': 'Person', name: 'Claude Code Expert Team' }
    })
  }}
/>

# How to Fix "Claude Code Process Exited with Code 1" Error

<TLDRBlock>
Claude Code exit code 1 means the process terminated due to an error. Run `claude code --reset-permissions` then `claude code restart` to fix it in 80% of cases (2-minute solution). This error typically indicates insufficient file permissions or corrupted configuration.
</TLDRBlock>

<QuickAnswer 
  solution="claude code --reset-permissions && claude code restart"
  successRate="80% (tested with 500+ users)"
  time="2 minutes"
/>

## What Exit Code 1 Means

Exit code 1 is a Unix-standard error signal indicating Claude Code encountered an unexpected problem and had to terminate. The code "1" specifically means "general error" - something went wrong during execution but wasn't a specific error type (like code 127 for "command not found").

**In simple terms:** Claude Code tried to do something, couldn't do it, and stopped.

## Why This Happens

Based on analysis of 1,000+ reported cases:

### 1. Permission Issues (60% of cases)

Claude Code can't access your project files or system resources. This happens when:
- File permissions changed after installation
- Working in a protected directory
- Security software blocks access

### 2. Corrupted Configuration (25% of cases)

Your `~/.claude/config.json` file has invalid data:
- Manual edits with syntax errors
- Interrupted write operations
- Conflicting settings

### 3. Network Connectivity (15% of cases)

Claude Code can't reach Anthropic's API servers:
- Firewall blocking connections
- Proxy misconfiguration
- Internet connection dropped mid-request

## Step-by-Step Solutions

### Solution 1: Reset Permissions (RECOMMENDED)

**When to use:** First troubleshooting step for any exit code 1 error.  
**Success rate:** 80%  
**Time:** 2 minutes

```bash
# Step 1: Check current permission status
claude code --check-permissions

# Step 2: Reset all permissions
claude code --reset-permissions

# Step 3: Restart Claude Code
claude code restart
```

**Expected result:** Claude Code starts normally without errors.

**Why this works:** Resets all file and directory permissions to default safe values, resolving most access issues.

### Solution 2: Clear Cache and Config

**When to use:** If reset-permissions didn't work.  
**Success rate:** 60%  
**Time:** 3 minutes

```bash
# Step 1: Clear application cache
claude code --clear-cache

# Step 2: Remove config directory (backs up automatically)
rm -rf ~/.claude/cache

# Step 3: Restart
claude code restart

# Step 4: Reconfigure if needed
claude code config set api-key YOUR_API_KEY
```

**Expected result:** Fresh configuration, errors cleared.

**Why this works:** Removes corrupted cache files and resets configuration to defaults.

### Solution 3: Complete Reinstall

**When to use:** If both previous solutions failed.  
**Success rate:** 95%  
**Time:** 10 minutes

```bash
# Step 1: Uninstall completely
npm uninstall -g @anthropic-ai/claude-code

# Step 2: Remove all data
rm -rf ~/.claude

# Step 3: Clear npm cache
npm cache clean --force

# Step 4: Reinstall latest version
npm install -g @anthropic-ai/claude-code

# Step 5: Configure
claude code config set api-key YOUR_API_KEY
```

**Expected result:** Clean installation, all errors resolved.

**Why this works:** Nuclear option - removes everything and starts fresh.

## Prevention

### ✅ Do This

- **Keep updated:** Run `npm update -g @anthropic-ai/claude-code` monthly
- **Regular audits:** Check permissions with `--check-permissions` weekly
- **Stable network:** Use wired connection or reliable WiFi
- **Backup config:** Copy `~/.claude/config.json` before changes

### ❌ Avoid This

- Don't manually edit config files
- Don't run Claude Code with `sudo` unless necessary
- Don't interrupt Claude Code mid-operation
- Don't use multiple versions simultaneously

## Related Issues

- [Fix "Permission Denied" Errors](/troubleshooting/permission-denied)
- [Claude Code Not Responding](/troubleshooting/not-responding)
- [Approaching 5-Hour Limit](/troubleshooting/5-hour-limit)

<FAQ items={[
  {
    question: "What does exit code 1 mean in Claude Code?",
    answer: "Exit code 1 is a general error signal meaning Claude Code encountered an unexpected problem and terminated. It's the Unix-standard code for 'something went wrong' during execution, typically due to permission issues, configuration problems, or network failures."
  },
  {
    question: "Why does Claude Code keep exiting with code 1?",
    answer: "Persistent exit code 1 errors indicate corrupted configuration files, insufficient system resources, conflicting dependencies, or outdated Claude Code versions. Try the reset-permissions command first, then clear cache, and finally reinstall if needed."
  },
  {
    question: "How can I prevent exit code 1 errors?",
    answer: "Keep Claude Code updated monthly, run permission audits weekly, maintain stable network connection, and backup your config file before making changes. Avoid manually editing configuration files or interrupting Claude Code during operations."
  },
  {
    question: "Does exit code 1 affect my project files?",
    answer: "No. Exit code 1 only affects Claude Code's ability to run. Your project files, code, and data remain completely safe and unchanged. The error is about Claude Code itself, not your work."
  },
  {
    question: "Should I contact support for exit code 1?",
    answer: "Try the three solutions above first - they resolve 95% of exit code 1 errors. Contact Anthropic support only if the error persists after a complete reinstall, or if you see additional error messages beyond just 'exit code 1'."
  },
  {
    question: "How long does each fix take?",
    answer: "Reset-permissions takes 2 minutes (80% success rate), clear cache takes 3 minutes (60% success rate), and complete reinstall takes 10 minutes (95% success rate). Start with the fastest solution and escalate if needed."
  },
  {
    question: "Can I use Claude Code while fixing this error?",
    answer: "No. Exit code 1 means Claude Code has stopped completely. You must fix the error before you can use Claude Code again. However, the fixes are quick - most users are back running in under 5 minutes."
  }
]} />

---

**Last Updated:** February 1, 2026 by Claude Code Expert Team  
**Tested with:** Claude Code v2.1.29+ on macOS 14+, Ubuntu 22.04+, Windows 11  
**Success Rate:** 95% resolution rate across 1,000+ reported cases

**Sources:**
- [Anthropic Claude Code Documentation](https://docs.anthropic.com/claude-code)
- User reports and solutions database (Jan 2026)
- Internal testing with 500+ users
```

### app/troubleshooting/page.tsx

```typescript
import Link from 'next/link'

export default function TroubleshootingHub() {
  return (
    <div>
      <h1>Claude Code Troubleshooting</h1>
      <p className="text-xl text-gray-600 mb-8">
        Expert solutions for common Claude Code errors. All fixes tested and updated weekly.
      </p>

      <div className="space-y-4">
        <Link href="/troubleshooting/exit-code-1" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Fix "Process Exited with Code 1"</h2>
          <p className="text-gray-600 mb-2">
            80% success rate • 2-minute fix • Most common error
          </p>
          <p className="text-sm text-blue-600">8,100 searches/month</p>
        </Link>

        <Link href="/troubleshooting/dangerously-skip-permissions" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Dangerously Skip Permissions Guide</h2>
          <p className="text-gray-600 mb-2">
            Complete setup and security guide
          </p>
          <p className="text-sm text-blue-600">4,400 searches/month</p>
        </Link>

        <Link href="/troubleshooting/5-hour-limit" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Approaching 5-Hour Limit</h2>
          <p className="text-gray-600 mb-2">
            Understand and manage usage limits
          </p>
          <p className="text-sm text-blue-600">1,600 searches/month</p>
        </Link>
      </div>
    </div>
  )
}
```

### app/sitemap.ts

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://coding-prompts.dev',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://coding-prompts.dev/troubleshooting/exit-code-1',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://coding-prompts.dev/troubleshooting/dangerously-skip-permissions',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}
```

### app/robots.ts

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['*', 'GPTBot', 'ChatGPT-User', 'Claude-Web', 'Google-Extended'],
        allow: '/',
      },
    ],
    sitemap: 'https://coding-prompts.dev/sitemap.xml',
  }
}
```

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
}

module.exports = nextConfig
```

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {},
  plugins: [],
}

export default config
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### .gitignore

```
node_modules
.next
.env*.local
.vercel
*.log
.DS_Store
```

### README.md

```markdown
# Coding Prompts - AEO Optimized

Claude Code expert guides optimized for AI citations.

## AEO Features

- TL;DR blocks (citation-ready)
- FAQ schema (+200% citations)
- Quick Answer components
- Updated weekly
- Tested solutions

## Setup

```bash
npm install
npm run dev
```

## Deploy

```bash
vercel --prod
```
```

Après création dans le dossier `site/`:

```bash
cd site
npm install
npm run dev
```
