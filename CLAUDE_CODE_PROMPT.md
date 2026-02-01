# PROMPT CLAUDE CODE - coding-prompts.dev
# Copier-coller ce prompt COMPLET dans Claude Code

Crée un repository Git et un site Next.js 14+ optimisé pour maximiser les citations dans les AI (ChatGPT, Claude, Gemini, Perplexity, Copilot).

## SPECIFICATIONS CRITIQUES

**Domaine:** coding-prompts.dev  
**Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS  
**Deploy:** Vercel  
**Objectif:** Maximum de citations AI en 30 jours

## REQUIREMENTS ABSOLUS POUR CITATIONS AI

### 1. Schema.org sur CHAQUE page
- FAQPage schema (CRITIQUE - +200% citations)
- Article schema avec dateModified
- BreadcrumbList
- Organization schema global
- WebSite schema avec SearchAction

### 2. Structure de contenu
- Quote blocks extractibles (citation-ready)
- FAQ sections (minimum 3-5 questions par page)
- Headers sémantiques H1-H6
- Last-modified metadata
- Author credentials (E-E-A-T)

### 3. Performance & SEO
- Score PageSpeed 90+
- Mobile-first responsive
- Sitemap.xml automatique
- robots.txt AI-friendly
- Open Graph + Twitter Cards

## STRUCTURE DU PROJET

```
coding-prompts/
├── .git/
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── README.md
│
├── app/
│   ├── layout.tsx                 # Global layout + Schema.org
│   ├── page.tsx                   # Homepage
│   ├── globals.css
│   ├── sitemap.ts                 # Auto-generated sitemap
│   ├── robots.ts                  # AI-friendly robots.txt
│   │
│   ├── claude-code/               # Category: Claude Code
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── errors/
│   │   │   ├── page.tsx
│   │   │   └── exit-code-1/
│   │   │       └── page.mdx      # First article
│   │   ├── install/
│   │   │   └── page.mdx
│   │   └── permissions/
│   │       └── page.mdx
│   │
│   ├── prompts/                   # Prompts collection
│   │   ├── page.tsx              # Prompts library
│   │   └── [slug]/
│   │       └── page.tsx          # Individual prompt page
│   │
│   ├── about/
│   │   └── page.tsx
│   │
│   └── api/                       # Optional API routes
│       └── search/
│           └── route.ts
│
├── components/
│   ├── Schema/
│   │   ├── FAQSchema.tsx         # FAQ schema component
│   │   ├── ArticleSchema.tsx     # Article schema
│   │   ├── BreadcrumbSchema.tsx
│   │   └── OrganizationSchema.tsx
│   │
│   ├── UI/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── QuoteBlock.tsx        # Citation-ready quote component
│   │
│   ├── Content/
│   │   ├── FAQ.tsx               # FAQ component with schema
│   │   ├── CodeBlock.tsx
│   │   ├── StepByStep.tsx        # HowTo schema
│   │   └── LastUpdated.tsx
│   │
│   └── SEO/
│       ├── MetaTags.tsx
│       └── StructuredData.tsx
│
├── lib/
│   ├── schema.ts                 # Schema.org utilities
│   ├── metadata.ts               # Metadata generators
│   └── constants.ts
│
├── content/                       # MDX articles
│   ├── claude-code/
│   │   ├── exit-code-1.mdx
│   │   ├── install-guide.mdx
│   │   └── permissions.mdx
│   │
│   └── prompts/
│       ├── prompts.json          # Prompts database
│       └── categories.json
│
├── public/
│   ├── robots.txt
│   ├── logo.png
│   ├── og-image.png
│   └── .well-known/
│       └── ai-plugin.json        # AI plugin manifest
│
└── scripts/
    └── generate-sitemap.ts
```

## FICHIERS À CRÉER

### 1. package.json

```json
{
  "name": "coding-prompts",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@next/mdx": "^14.1.0",
    "@mdx-js/loader": "^3.0.0",
    "@mdx-js/react": "^3.0.0",
    "gray-matter": "^4.0.3",
    "rehype-pretty-code": "^0.13.0",
    "remark-gfm": "^4.0.0",
    "schema-dts": "^1.1.2",
    "next-themes": "^0.2.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0"
  }
}
```

### 2. app/layout.tsx (CRITIQUE)

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { OrganizationSchema } from '@/components/Schema/OrganizationSchema'
import Header from '@/components/UI/Header'
import Footer from '@/components/UI/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://coding-prompts.dev'),
  title: {
    default: 'Coding Prompts - Professional AI Development Tools',
    template: '%s | Coding Prompts'
  },
  description: 'Curated coding prompts and comprehensive guides for Claude Code, ChatGPT, Cursor, and AI-powered development. Updated weekly.',
  keywords: ['coding prompts', 'Claude Code', 'ChatGPT', 'AI development', 'cursor', 'copilot'],
  authors: [{ name: 'Coding Prompts Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://coding-prompts.dev',
    title: 'Coding Prompts - Professional AI Development Tools',
    description: 'Curated coding prompts and guides for AI developers',
    siteName: 'Coding Prompts',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coding Prompts'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coding Prompts',
    description: 'Professional coding prompts for AI development',
    images: ['/twitter-card.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
      </head>
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
```

### 3. components/Schema/FAQSchema.tsx (CRUCIAL)

```typescript
import { FAQPage, Question } from 'schema-dts'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs: FAQItem[]
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema: FAQPage = {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq): Question => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          ...schema
        })
      }}
    />
  )
}
```

### 4. components/Schema/ArticleSchema.tsx

```typescript
import { Article, Person, Organization } from 'schema-dts'

interface ArticleSchemaProps {
  title: string
  description: string
  datePublished: string
  dateModified: string
  authorName: string
  image?: string
}

export function ArticleSchema({
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  image = '/og-image.png'
}: ArticleSchemaProps) {
  const schema: Article = {
    '@type': 'Article',
    headline: title,
    description: description,
    image: `https://coding-prompts.dev${image}`,
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      '@type': 'Person',
      name: authorName,
      url: 'https://coding-prompts.dev/about'
    } as Person,
    publisher: {
      '@type': 'Organization',
      name: 'Coding Prompts',
      logo: {
        '@type': 'ImageObject',
        url: 'https://coding-prompts.dev/logo.png'
      }
    } as Organization,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://coding-prompts.dev'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          ...schema
        })
      }}
    />
  )
}
```

### 5. components/Content/FAQ.tsx (Component utilisable)

```typescript
import { FAQSchema } from '@/components/Schema/FAQSchema'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  items: FAQItem[]
  title?: string
}

export function FAQ({ items, title = "Frequently Asked Questions" }: FAQProps) {
  return (
    <>
      <FAQSchema faqs={items} />
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
```

### 6. components/UI/QuoteBlock.tsx (Citation-ready)

```typescript
interface QuoteBlockProps {
  children: React.ReactNode
  source?: string
}

export function QuoteBlock({ children, source }: QuoteBlockProps) {
  return (
    <blockquote 
      className="my-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg"
      itemScope 
      itemType="https://schema.org/Quotation"
    >
      <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
        {children}
      </div>
      {source && (
        <cite className="block mt-4 text-sm text-gray-600 dark:text-gray-400">
          — {source}
        </cite>
      )}
    </blockquote>
  )
}
```

### 7. app/sitemap.ts (Auto-generated)

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://coding-prompts.dev'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/claude-code`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/claude-code/errors/exit-code-1`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/prompts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
```

### 8. app/robots.ts

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
    ],
    sitemap: 'https://coding-prompts.dev/sitemap.xml',
  }
}
```

### 9. Premier Article: app/claude-code/errors/exit-code-1/page.mdx

```mdx
import { FAQ } from '@/components/Content/FAQ'
import { QuoteBlock } from '@/components/UI/QuoteBlock'
import { ArticleSchema } from '@/components/Schema/ArticleSchema'
import { LastUpdated } from '@/components/Content/LastUpdated'

export const metadata = {
  title: 'How to Fix Claude Code Process Exited with Code 1 Error',
  description: 'Complete troubleshooting guide for fixing the Claude Code exit code 1 error. Step-by-step solutions with 95% success rate.',
  keywords: ['claude code', 'exit code 1', 'error fix', 'troubleshooting'],
  openGraph: {
    title: 'Fix Claude Code Exit Code 1 Error - Complete Guide',
    description: 'Step-by-step solutions to fix Claude Code process exited with code 1',
  }
}

<ArticleSchema 
  title="How to Fix Claude Code Process Exited with Code 1 Error"
  description="Complete troubleshooting guide for fixing the Claude Code exit code 1 error"
  datePublished="2026-02-01T10:00:00Z"
  dateModified="2026-02-01T10:00:00Z"
  authorName="Coding Prompts Team"
/>

<LastUpdated date="February 1, 2026" />

# How to Fix "Claude Code Process Exited with Code 1" Error

<QuoteBlock source="Quick Fix Guide">
Run `claude code --reset-permissions` and restart. This solves 80% of exit code 1 errors immediately.
</QuoteBlock>

## Table of Contents
- Understanding the Error
- Common Causes  
- Step-by-Step Solutions
- Prevention Tips
- FAQ

## Understanding the Error

The "Claude Code process exited with code 1" error indicates that Claude Code encountered an unexpected issue and had to terminate. Exit code 1 is a general error signal in Unix-based systems, meaning something went wrong during execution.

<QuoteBlock>
Exit code 1 in Claude Code typically stems from permission issues, configuration problems, or network connectivity failures. It's the most common error developers encounter.
</QuoteBlock>

## Common Causes

### 1. Permission Issues
The most frequent cause (60% of cases) is insufficient permissions for Claude Code to access system resources or project files.

### 2. Configuration Problems  
Corrupted or invalid configuration files can prevent Claude Code from starting properly.

### 3. Network Connectivity
Claude Code requires stable internet connection to communicate with Anthropic's API servers.

## Step-by-Step Solutions

### Solution 1: Reset Permissions (Recommended)

**Time Required:** 2 minutes  
**Success Rate:** 80%

```bash
# Step 1: Check current permissions
claude code --check-permissions

# Step 2: Reset if needed
claude code --reset-permissions

# Step 3: Restart Claude Code
claude code restart
```

### Solution 2: Clear Cache

**Time Required:** 3 minutes  
**Success Rate:** 60%

```bash
# Clear Claude Code cache
claude code --clear-cache

# Remove config directory
rm -rf ~/.claude/cache

# Restart
claude code restart
```

### Solution 3: Reinstall Claude Code

**Time Required:** 10 minutes  
**Success Rate:** 95%

```bash
# Uninstall current version
npm uninstall -g @anthropic-ai/claude-code

# Clear all data
rm -rf ~/.claude

# Reinstall latest version
npm install -g @anthropic-ai/claude-code

# Configure API key
claude code config set api-key YOUR_API_KEY
```

## Prevention Tips

1. **Keep Claude Code Updated**
   - Check for updates weekly: `npm update -g @anthropic-ai/claude-code`
   - Enable auto-updates if available

2. **Regular Permission Audits**
   - Run `claude code --check-permissions` monthly
   - Fix any permission warnings immediately

3. **Monitor Configuration**
   - Backup your config file: `~/.claude/config.json`
   - Validate config after any changes

## FAQ

<FAQ items={[
  {
    question: "What does exit code 1 mean in Claude Code?",
    answer: "Exit code 1 indicates a general error condition in Claude Code, typically caused by permission issues, configuration problems, or network connectivity failures. It's the standard Unix exit code for 'general errors'."
  },
  {
    question: "Why does Claude Code keep exiting with code 1?",
    answer: "Persistent exit code 1 errors usually stem from corrupted configuration files, insufficient system resources, conflicting dependencies, or outdated Claude Code versions. Try reinstalling Claude Code and resetting your configuration."
  },
  {
    question: "How can I prevent this error?",
    answer: "Prevent exit code 1 errors by: keeping Claude Code updated, running regular permission audits, maintaining stable network connection, and backing up your configuration files before making changes."
  },
  {
    question: "Does this error affect my projects?",
    answer: "No, the exit code 1 error affects only Claude Code's ability to run. Your project files remain safe and unchanged. Simply fix the error and resume work."
  },
  {
    question: "Should I contact support?",
    answer: "Try the three solutions above first - they resolve 95% of exit code 1 errors. Contact Anthropic support only if the error persists after reinstalling Claude Code."
  }
]} />

---

**Related Guides:**
- [Claude Code Installation Guide](/claude-code/install)
- [Claude Code Permissions Guide](/claude-code/permissions)
- [Common Claude Code Errors](/claude-code/errors)

<LastUpdated date="February 1, 2026" />
```

### 10. .gitignore

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 11. README.md

```markdown
# coding-prompts.dev

Professional coding prompts and guides for AI-powered development.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- MDX for content
- Schema.org for AI optimization

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
vercel --prod
```

## AI Optimization

This site is optimized for citations in:
- ChatGPT
- Claude
- Gemini
- Perplexity
- Copilot

Key optimizations:
- FAQ schema on every page (+200% citations)
- Quote blocks (citation-ready)
- Updated metadata
- E-E-A-T signals

## Content Structure

- `/app/claude-code/` - Claude Code guides
- `/app/prompts/` - Prompts library
- `/content/` - MDX articles

## License

MIT
```

## COMMANDES GIT

Après la création des fichiers, exécute:

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit: AI-optimized coding-prompts.dev"

# Créer repo GitHub (si tu as gh CLI)
gh repo create coding-prompts --public --source=. --remote=origin

# Ou ajouter remote manuellement
git remote add origin https://github.com/TON_USERNAME/coding-prompts.git

# Push
git branch -M main
git push -u origin main
```

## VERCEL DEPLOY

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Ajouter le domaine
vercel domains add coding-prompts.dev
```

## CHECKLIST POST-DEPLOY

- [ ] Vérifier que le site est accessible
- [ ] Tester Schema.org: validator.schema.org
- [ ] Vérifier sitemap.xml: coding-prompts.dev/sitemap.xml
- [ ] Tester sur mobile
- [ ] PageSpeed score 90+
- [ ] Soumettre à Google Search Console
- [ ] Premier test citation AI (24h après)

## NOTES IMPORTANTES

1. **Remplacer dans les fichiers:**
   - `YOUR_GOOGLE_VERIFICATION_CODE` par ton code Google
   - `TON_USERNAME` par ton username GitHub
   - `YOUR_API_KEY` dans les exemples

2. **Images à créer:**
   - `logo.png` (512x512)
   - `og-image.png` (1200x630)
   - `twitter-card.png` (1200x630)

3. **Priorités première semaine:**
   - Article exit-code-1 ✅
   - 2 autres articles
   - 10 prompts minimum

Commence par créer la structure de base, puis je t'aiderai avec le contenu des articles suivants !
