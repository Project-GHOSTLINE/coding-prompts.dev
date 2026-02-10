# 🏗️ Structure Complète - Coding Prompts & Dashboard AEO

**Projet**: coding-prompts.dev
**Type**: Next.js 14 + TypeScript + Tailwind CSS
**Architecture**: App Router + API Routes + MDX Content

---

## 📂 Vue d'Ensemble de l'Architecture

```
coding-prompts.dev/
├── site/                           # Application Next.js principale
│   ├── app/                        # App Router (Next.js 14)
│   │   ├── (public-pages)/         # Pages publiques du site
│   │   ├── admin/                  # Zone admin sécurisée
│   │   └── api/                    # API Routes backend
│   ├── lib/                        # Bibliothèques & utilitaires
│   ├── public/                     # Assets statiques
│   └── package.json                # Dépendances
└── docs/                           # Documentation projet
```

---

## 🌐 Structure Complète du Site

### 1️⃣ **Pages Publiques** (`site/app/`)

#### Page d'Accueil - `/`
**Fichier**: `site/app/page.tsx`

```typescript
Structure:
├── Hero Section
│   ├── Titre: "Claude Code Guides"
│   └── Sous-titre + Description
├── Grid de 4 Cards
│   ├── 🔧 Troubleshooting → /troubleshooting
│   ├── ⚙️ Setup & Config → /setup
│   ├── ✨ Features → /features
│   └── ⚖️ Comparisons → /vs
└── Section "Most Popular Guides"
    ├── Exit Code 1 Guide
    ├── Skip Permissions Guide
    └── Statusline Setup Guide
```

**Objectif**: Landing page SEO-optimisée pour Claude Code

---

#### Section Troubleshooting - `/troubleshooting`
**Fichier**: `site/app/troubleshooting/page.tsx`

```
/troubleshooting/
├── exit-code-1/page.mdx           # Fix "Process Exited Code 1"
├── dangerously-skip-permissions/  # Guide Skip Permissions
└── 5-hour-limit/page.mdx          # Contourner limite 5h
```

**Contenu**: Guides de résolution de problèmes courants

---

#### Section Setup - `/setup`
**Fichier**: `site/app/setup/page.tsx`

```
/setup/
├── installation/page.mdx          # Installation Claude Code
├── statusline/page.mdx            # Config statusline terminal
└── router/page.mdx                # Configuration router
```

**Contenu**: Guides d'installation et configuration

---

#### Section Features - `/features`
**Fichier**: `site/app/features/page.tsx`

```
/features/
└── sequential-thinking/page.mdx   # Feature Sequential Thinking
```

**Contenu**: Tutoriels sur les fonctionnalités avancées

---

#### Section Comparisons - `/vs`
**Fichier**: `site/app/vs/page.tsx`

```
/vs/
└── cursor/page.mdx                # Claude Code vs Cursor
```

**Contenu**: Comparatifs avec alternatives

---

### 2️⃣ **Zone Admin Sécurisée** (`site/app/admin/`)

#### Login Page - `/admin/login`
**Fichier**: `site/app/admin/login/page.tsx`

```typescript
Composant Client ('use client')

Structure:
├── Formulaire Login
│   ├── Input Email
│   ├── Input Password
│   └── Button Submit
├── State Management
│   ├── email, password (useState)
│   ├── error (useState)
│   └── loading (useState)
└── Auth Flow
    ├── POST /api/admin/login
    ├── Si success → redirect /admin/dashboard
    └── Si erreur → affiche message

Sécurité:
✅ httpOnly cookie
✅ Validation côté serveur
✅ Error messages génériques (pas d'info leak)
```

---

#### Dashboard AEO - `/admin/dashboard`
**Fichier**: `site/app/admin/dashboard/page.tsx` (111 lignes)

```typescript
Composant Client ('use client')

Structure UI:
├── Header (sticky)
│   ├── Titre: "Dashboard AEO"
│   └── Button Logout → POST /api/admin/logout
│
├── Stats Grid (4 colonnes responsive)
│   ├── Card 1: 👥 Visitors
│   │   └── Valeur: {data.visitors}
│   ├── Card 2: 👁️ Page Views
│   │   └── Valeur: {data.pageViews}
│   ├── Card 3: 🤖 AI Sessions
│   │   └── Valeur: {data.aiSessions}
│   └── Card 4: 🔍 Organic
│       └── Valeur: {data.organic}
│
└── Quick Actions
    ├── 🔄 Refresh → window.location.reload()
    ├── 📄 Report → /AEO-VERIFICATION.md
    └── 📊 Tests → /AEO-TEST-RESULTS.md

Data Flow:
1. useEffect au mount
2. fetch('/api/admin/stats')
3. Si 401 → redirect /admin/login
4. Si 200 → setData(json)
5. Si error → setData('Error')

States:
- data: { visitors, pageViews, aiSessions, organic }
- Loading: "Loading..."
- Error: "Error"

Responsive:
- Mobile: 1 colonne
- Tablet: 2 colonnes
- Desktop: 4 colonnes
```

**Version**: Ultra Simple - ZÉRO sidebar, ZÉRO complexité

---

### 3️⃣ **API Routes Backend** (`site/app/api/`)

#### Login API - `POST /api/admin/login`
**Fichier**: `site/app/api/admin/login/route.ts`

```typescript
Flow:
1. Reçoit: { email, password }
2. Vérifie email === ADMIN_CREDENTIALS.email
3. verifyPassword(password, passwordHash) avec bcrypt
4. Si valid:
   - createSession('admin') → JWT token
   - Set httpOnly cookie 'admin_session'
   - Return { success: true }
5. Si invalid:
   - Return { error: 'Invalid credentials' } (401)

Sécurité:
✅ bcrypt password hashing
✅ httpOnly cookies (pas de XSS)
✅ sameSite: 'lax'
✅ secure en production
✅ Max age: 7 jours
```

---

#### Logout API - `POST /api/admin/logout`
**Fichier**: `site/app/api/admin/logout/route.ts`

```typescript
Flow:
1. Clear cookie 'admin_session'
2. Return { success: true }
```

---

#### Stats API - `GET /api/admin/stats`
**Fichier**: `site/app/api/admin/stats/route.ts` (142 lignes)

```typescript
Auth Check:
const authenticated = await isAuthenticated()
if (!authenticated) return 401

Data Sources:
├── SEMrush
│   ├── getSEMrushData('coding-prompts.dev')
│   ├── totalKeywords
│   ├── avgPosition
│   ├── estimatedTraffic
│   ├── totalBacklinks
│   └── topKeywords[]
│
├── Google Search Console
│   ├── getSearchConsoleData()
│   ├── totalClicks
│   ├── totalImpressions
│   ├── avgCTR
│   ├── avgPosition
│   ├── topQueries[]
│   └── topPages[]
│
├── Google Analytics 4
│   ├── getAnalyticsData(30)
│   ├── pageViews { total, change }
│   ├── uniqueVisitors { total, change }
│   ├── avgSessionDuration
│   ├── bounceRate
│   ├── topPages[]
│   ├── topSources[]
│   └── deviceBreakdown { desktop, mobile, tablet }
│
├── AI Traffic Analytics
│   ├── getAITrafficData(30)
│   ├── totalAISessions
│   ├── totalAIPageViews
│   ├── aiVsOrganicRatio
│   ├── byEngine[] (ChatGPT, Claude, etc.)
│   ├── timeSeriesData[]
│   └── topLandingPages[]
│
└── Content Performance
    ├── getContentPerformanceData(30)
    ├── topPagesAI[]
    ├── topPagesOrganic[]
    ├── comparison[]
    └── overallMetrics { ai, organic }

Error Handling:
Chaque source est dans try-catch
Si erreur → fallback 'N/A' values

Response JSON:
{
  semrush: {...},
  searchConsole: {...},
  analytics: {...},
  aiTraffic: {...},
  contentPerformance: {...},
  vercel: {...},       // Alias pour analytics
  aeoTests: {...}      // Manual testing only
}
```

---

### 4️⃣ **Bibliothèques Backend** (`site/lib/`)

#### Auth Library - `lib/auth.ts`
```typescript
Fonctions:
├── isAuthenticated()           # Vérifie JWT token du cookie
├── verifyPassword()            # bcrypt.compare()
├── createSession()             # Crée JWT token avec jose
└── ADMIN_CREDENTIALS           # Email + passwordHash

Sécurité:
✅ JWT avec jose (crypto moderne)
✅ bcrypt pour passwords
✅ Pas de plain text passwords
```

---

#### SEMrush Library - `lib/semrush.ts`
```typescript
API: SEMrush API
Fonction: getSEMrushData(domain)
Return:
  - totalKeywords
  - avgPosition
  - estimatedTraffic
  - totalBacklinks
  - topKeywords[]
```

---

#### Google Analytics - `lib/google-analytics.ts`
```typescript
API: Google Analytics Data API v1
Fonction: getAnalyticsData(days)
Auth: Service Account JSON
Metrics:
  - screenPageViews
  - totalUsers
  - averageSessionDuration
  - bounceRate
Dimensions:
  - pagePath
  - sessionDefaultChannelGroup
  - deviceCategory
```

---

#### Google Search Console - `lib/google-search-console.ts`
```typescript
API: Google Search Console API
Fonction: getSearchConsoleData()
Auth: Service Account JSON
Metrics:
  - clicks
  - impressions
  - ctr
  - position
Dimensions:
  - query
  - page
```

---

#### AI Traffic Analytics - `lib/ai-traffic-analytics.ts`
```typescript
Fonction: getAITrafficData(days)
Détection AI:
  - User-Agent patterns
  - Claude-Web, ChatGPT-User, etc.
  - Google-Extended
Metrics:
  - Sessions par moteur AI
  - Pages vues AI
  - Ratio AI vs Organic
  - Timeline data
```

---

#### Content Performance - `lib/content-performance.ts`
```typescript
Fonction: getContentPerformanceData(days)
Compare:
  - Pages top AI
  - Pages top Organic
  - Engagement metrics
  - Session duration
  - Bounce rate
  - Pages per session
```

---

### 5️⃣ **Layout & Navigation** (`site/app/layout.tsx`)

```typescript
Root Layout pour tout le site

Structure:
├── <html>
│   ├── <head>
│   │   ├── JSON-LD Schema (Organization)
│   │   └── Google Analytics Scripts
│   │       ├── gtag.js
│   │       └── GA4: G-24Q7ZZ71LB
│   │
│   └── <body>
│       ├── <header>
│       │   └── <nav>
│       │       ├── Logo: "Coding Prompts"
│       │       ├── Link: Troubleshooting
│       │       ├── Link: Setup
│       │       ├── Link: Features
│       │       ├── Link: Comparisons
│       │       └── Button: Dashboard (gradient)
│       │
│       ├── <main>
│       │   └── {children} ← Pages content ici
│       │
│       └── <footer>
│           ├── © 2026 Coding Prompts
│           └── "AI-optimized guides"

Metadata:
✅ title template
✅ description
✅ keywords
✅ robots: index, follow
✅ metadataBase: https://coding-prompts.dev

Styling:
- Font: Inter (Google Fonts)
- Framework: Tailwind CSS
- Container: max-w-4xl
```

---

## 🎨 Stack Technique

### Frontend
```json
{
  "framework": "Next.js 14.1.0",
  "react": "18.2.0",
  "styling": "Tailwind CSS 3.4.1",
  "typography": "Inter (Google Fonts)",
  "icons": "@heroicons/react 2.2.0",
  "content": "MDX (@next/mdx 3.0.0)",
  "charts": "recharts 3.7.0"
}
```

### Backend
```json
{
  "runtime": "Node.js",
  "language": "TypeScript 5.3.3",
  "auth": "jose (JWT) + bcryptjs",
  "apis": [
    "@google-analytics/data 5.2.1",
    "googleapis 171.1.0 (Search Console)",
    "SEMrush API",
    "Custom AI Detection"
  ],
  "testing": "playwright 1.58.1"
}
```

### Infrastructure
```
Hosting: Vercel (probable)
Database: Aucune (stateless APIs)
Storage: Aucun (real-time API calls)
Cache: Aucun actuellement
```

---

## 🔐 Sécurité

### Authentification
```
✅ bcrypt password hashing (cost: 10)
✅ JWT tokens avec jose (modern crypto)
✅ httpOnly cookies (anti-XSS)
✅ sameSite: lax (anti-CSRF partiel)
✅ secure: true en production
✅ Session expire: 7 jours
```

### Authorization
```
✅ Auth check sur toutes les routes /admin/*
✅ Auth check sur API /api/admin/*
✅ 401 auto-redirect sur frontend
```

### Data Protection
```
✅ Pas de plain text passwords
✅ Credentials dans env vars (.env.local)
✅ Service Account JSON pour Google APIs
✅ API keys sécurisées
```

### À Améliorer
```
⚠️ CSRF protection (ajouter CSRF token)
⚠️ Rate limiting (API spam protection)
⚠️ Input validation (zod ou joi)
⚠️ Security headers (helmet)
```

---

## 📊 Data Flow - Dashboard Complet

```
User Browser
    │
    ├─→ GET /admin/dashboard
    │       │
    │       ├─→ Check cookie 'admin_session'
    │       │       │
    │       │       ├─→ Si absent/invalid → 401
    │       │       │       └─→ Redirect /admin/login
    │       │       │
    │       │       └─→ Si valid → Render page
    │
    └─→ useEffect mount
            │
            └─→ fetch('/api/admin/stats')
                    │
                    ├─→ Auth Check (isAuthenticated)
                    │       │
                    │       ├─→ Si fail → 401
                    │       │       └─→ Frontend redirect login
                    │       │
                    │       └─→ Si success → Continue
                    │
                    ├─→ Parallel API Calls:
                    │   ├─→ getSEMrushData()
                    │   ├─→ getSearchConsoleData()
                    │   ├─→ getAnalyticsData()
                    │   ├─→ getAITrafficData()
                    │   └─→ getContentPerformanceData()
                    │
                    ├─→ Aggregate Data
                    │
                    └─→ Return JSON
                            │
                            └─→ Frontend: setData(json)
                                    │
                                    └─→ UI Update (display stats)
```

---

## 🗂️ Files & Routes Map

### Public Routes (SEO)
```
/                                  → Homepage
/troubleshooting                   → Troubleshooting hub
/troubleshooting/exit-code-1       → Guide Exit Code 1
/troubleshooting/dangerously-skip-permissions → Guide Skip Perms
/troubleshooting/5-hour-limit      → Guide 5h limit
/setup                             → Setup hub
/setup/installation                → Installation guide
/setup/statusline                  → Statusline guide
/setup/router                      → Router config
/features                          → Features hub
/features/sequential-thinking      → Sequential thinking guide
/vs                                → Comparisons hub
/vs/cursor                         → Claude Code vs Cursor
```

### Admin Routes (Protected)
```
/admin/login                       → Login page
/admin/dashboard                   → Dashboard AEO (111 lignes)
```

### API Routes (Backend)
```
POST /api/admin/login              → Authentification
POST /api/admin/logout             → Déconnexion
GET  /api/admin/stats              → Stats Dashboard (protected)
```

---

## 🎯 Objectifs du Site

### 1. SEO & AEO
- **Target**: Claude Code users + AI engines
- **Content**: Guides optimisés pour LLMs
- **Keywords**: "Claude Code", "troubleshooting", "exit code 1"
- **Schema**: Organization markup
- **Analytics**: GA4 tracking

### 2. Dashboard AEO
- **Monitoring**: AI traffic vs Organic
- **Metrics**: SEMrush, GSC, GA4
- **Purpose**: Mesurer efficacité AEO
- **UI**: Simple, rapide, fonctionnel

### 3. User Experience
- **Navigation**: Claire, 4 sections principales
- **Content**: MDX (Markdown + React components)
- **Performance**: Static pages (fast)
- **Mobile**: Fully responsive

---

## 📈 Métriques Clés Trackées

### Traffic
```
- Unique Visitors (GA4)
- Page Views (GA4)
- AI Sessions (détection user-agent)
- Organic Clicks (Search Console)
```

### SEO
```
- Total Keywords (SEMrush)
- Average Position (SEMrush + GSC)
- Impressions (GSC)
- CTR (GSC)
- Backlinks (SEMrush)
```

### Performance Contenu
```
- Top Pages AI
- Top Pages Organic
- Session Duration (AI vs Organic)
- Bounce Rate (AI vs Organic)
- Pages per Session
- Engagement Rate
```

### AI Engines
```
- ChatGPT traffic
- Claude traffic
- Gemini traffic
- Perplexity traffic
- Autres (Google-Extended, etc.)
```

---

## 🚀 Prochaines Améliorations Possibles

### Dashboard
```
1. Auto-refresh toutes les 30s
2. Date range picker (7d, 30d, 90d)
3. Charts avec recharts
4. Export PDF des stats
5. Real-time monitoring
6. Alerts sur seuils
7. Dark mode
```

### Sécurité
```
1. CSRF protection
2. Rate limiting
3. Input validation (zod)
4. Security headers
5. 2FA authentication
6. Audit logs
```

### Performance
```
1. Redis cache pour APIs
2. Incremental Static Regeneration
3. Image optimization
4. Code splitting
5. Service Worker (offline)
```

### Features
```
1. Multi-user dashboard
2. Role-based access
3. API pour external access
4. Webhooks pour alerts
5. Slack/Discord integration
```

---

## 📝 Environment Variables Required

```bash
# Auth
ADMIN_EMAIL=admin@coding-prompts.dev
ADMIN_PASSWORD_HASH=bcrypt_hash_here
JWT_SECRET=your-secret-key

# Google APIs
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GA4_PROPERTY_ID=...
SEARCH_CONSOLE_SITE_URL=https://coding-prompts.dev

# SEMrush
SEMRUSH_API_KEY=...

# Next.js
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://coding-prompts.dev
```

---

## 🎓 Résumé Exécutif

**Site**: coding-prompts.dev
**Type**: Site de guides + Dashboard analytics AEO

### Architecture
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: API Routes + External APIs (Google, SEMrush)
- **Content**: MDX pages (guides SEO-optimisés)
- **Auth**: JWT + bcrypt + httpOnly cookies

### Pages Publiques (5 sections)
1. Homepage - Landing page
2. Troubleshooting - Guides de résolution
3. Setup - Installation & config
4. Features - Tutoriels avancés
5. Comparisons - vs Cursor, etc.

### Dashboard Admin (Protected)
- **Login**: Email + Password → JWT cookie
- **Stats**: 4 metrics cards (Visitors, Views, AI, Organic)
- **Actions**: Refresh, Report, Tests
- **Code**: 111 lignes, ultra-simple
- **Data Sources**: SEMrush, GSC, GA4, AI detection

### Stack
- Next.js 14.1
- TypeScript 5.3
- Tailwind CSS 3.4
- Google APIs (Analytics + Search Console)
- SEMrush API
- bcryptjs + jose (auth)

**Status**: ✅ Production Ready
