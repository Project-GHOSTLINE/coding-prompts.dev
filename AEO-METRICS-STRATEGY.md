# 🤖 STRATÉGIE AEO - Answer Engine Optimization

**Projet** : coding-prompts.dev
**Objectif** : Tracker et optimiser le référencement dans les moteurs AI
**Date** : 2026-02-10

---

## 🎯 QU'EST-CE QUE L'AEO ?

**AEO (Answer Engine Optimization)** = Optimiser pour les moteurs de réponses AI :
- ChatGPT (GPT-4, GPT-4o, SearchGPT)
- Claude (Anthropic)
- Perplexity AI
- Google Gemini
- Microsoft Copilot
- You.com, Phind.com

**Différence vs SEO traditionnel** :
- SEO → Optimiser pour Google Search (liste de liens)
- AEO → Optimiser pour être **CITÉ** dans les réponses AI directes

---

## 📊 MÉTRIQUES AEO ESSENTIELLES À TRACKER

### 1. 🤖 **AI CRAWLER DETECTION**

**Crawlers à détecter** :
```javascript
{
  "GPTBot": /GPTBot|ChatGPT-User|OpenAI/i,
  "ClaudeBot": /Claude-Web|Anthropic-AI|ClaudeBot/i,
  "GoogleBot-Extended": /Google-Extended/i,  // Pour Gemini
  "PerplexityBot": /PerplexityBot/i,
  "BingBot-Preview": /BingPreview/i,         // Pour Copilot
  "YouBot": /YouBot/i,
  "PhindBot": /Phind/i
}
```

**Métriques** :
- ✅ Nombre de visites par crawler
- ✅ Pages crawlées par chaque bot
- ✅ Fréquence de crawl (daily, weekly)
- ✅ Temps moyen passé par le bot
- ✅ Profondeur de crawl (nombre de pages)

---

### 2. 👥 **AI REFERRAL TRAFFIC**

**Sources de trafic AI** :
```javascript
{
  "chat.openai.com": "ChatGPT",
  "chatgpt.com": "ChatGPT Web",
  "claude.ai": "Claude",
  "perplexity.ai": "Perplexity",
  "gemini.google.com": "Gemini",
  "copilot.microsoft.com": "Copilot",
  "you.com": "You.com",
  "phind.com": "Phind"
}
```

**Métriques** :
- ✅ Sessions depuis chaque AI engine
- ✅ Taux de rebond AI vs Organic
- ✅ Durée de session AI vs Organic
- ✅ Pages vues par session (AI vs Organic)
- ✅ Taux de conversion AI vs Organic
- ✅ Top landing pages depuis AI engines

---

### 3. 📈 **POSITION DANS LES RÉPONSES AI**

**Méthodes de tracking** :

#### A. Manual Testing (Actuel)
- Tester manuellement les queries importantes
- Noter si le site est cité
- Position dans la réponse (1er, 2ème, 3ème lien)
- Screenshot pour preuve

#### B. Automated Testing (À implémenter)
```javascript
// Test automatique des queries clés
const keyQueries = [
  "how to use claude code",
  "claude code vs cursor",
  "claude code installation",
  "claude code features",
  "what is claude code"
];

// Tester sur chaque AI engine
engines.forEach(async (engine) => {
  const response = await engine.query(query);
  const cited = response.includes("coding-prompts.dev");
  const position = response.findPosition("coding-prompts.dev");

  logMetric({
    date: today,
    engine: engine.name,
    query: query,
    cited: cited,
    position: position,
    score: calculateScore(cited, position)
  });
});
```

**Métriques** :
- ✅ % de queries où le site est cité
- ✅ Position moyenne dans les citations
- ✅ Évolution du taux de citation (semaine/mois)
- ✅ Queries qui génèrent des citations
- ✅ Pages les plus citées

---

### 4. 🔍 **QUERY ANALYSIS**

**Queries à tracker** :

#### Queries à fort potentiel AEO :
```
Questions directes :
- "What is [topic]?"
- "How to [action]?"
- "Why does [problem]?"
- "When should [action]?"

Comparaisons :
- "[Product A] vs [Product B]"
- "Difference between [A] and [B]"

Tutoriels :
- "How to install [product]"
- "Step by step [process]"
- "[Product] tutorial"

Troubleshooting :
- "[Product] error [code]"
- "Fix [problem]"
- "[Product] not working"
```

**Métriques** :
- ✅ Top queries générant du trafic AI
- ✅ Queries avec fort taux de citation
- ✅ Intent de recherche (question, comparaison, tutorial)
- ✅ Volume de recherche AI vs Google

---

### 5. 📄 **CONTENT PERFORMANCE AEO**

**Métriques par page** :

```javascript
{
  pagePath: "/troubleshooting/exit-code-1",
  metrics: {
    // Trafic
    aiTraffic: 45,           // Visites depuis AI engines
    organicTraffic: 120,     // Visites Google Search
    aiRatio: 0.375,          // 37.5% du trafic est AI

    // Engagement
    aiAvgDuration: 352,      // 5min 52sec (AI users)
    organicAvgDuration: 180, // 3min (Google users)
    aiBounceRate: 25,        // AI users restent plus
    organicBounceRate: 60,   // Google users rebondent plus

    // Citations
    citationCount: 8,        // Cité 8 fois dans les réponses AI
    citationEngines: ["ChatGPT", "Claude", "Perplexity"],

    // Score AEO
    aeoScore: 85             // Score sur 100
  }
}
```

**Score AEO calculé avec** :
- 30% - Taux de citation
- 25% - Volume de trafic AI
- 20% - Engagement (durée + bounce rate)
- 15% - Position moyenne dans les citations
- 10% - Diversité des engines (cité par combien d'engines)

---

### 6. 🏆 **COMPETITIVE ANALYSIS**

**Comparer avec les concurrents** :

```javascript
competitors = [
  "cursor.sh",
  "continue.dev",
  "aider.chat",
  "codeium.com"
];

metrics = {
  citationShare: {
    "coding-prompts.dev": 25,
    "cursor.sh": 45,
    "continue.dev": 20,
    "aider.chat": 10
  },

  topCitedFor: {
    "coding-prompts.dev": ["claude code tutorial"],
    "cursor.sh": ["ai code editor", "copilot alternative"]
  }
}
```

---

## 🛠️ IMPLÉMENTATION TECHNIQUE

### Phase 1 : Enhanced Tracking (MAINTENANT)

#### A. Améliorer la détection des AI crawlers

**Fichier** : `site/lib/ai-user-agent-detector.ts`

```typescript
// Patterns mis à jour pour 2026
const AI_CRAWLER_PATTERNS = {
  'GPTBot': /GPTBot|ChatGPT-User|ChatGPT|OpenAI/i,
  'ClaudeBot': /Claude-Web|Anthropic-AI|ClaudeBot|Claude/i,
  'GoogleExtended': /Google-Extended/i,
  'PerplexityBot': /PerplexityBot|Perplexity/i,
  'BingPreview': /BingPreview|EdgeGPT/i,
  'YouBot': /YouBot/i,
  'PhindBot': /Phind/i,
  'AI2Bot': /AI2Bot/i
}

// Détecter si c'est un crawler ou un user
export function detectAISource(userAgent: string, referrer: string) {
  // 1. Check crawler
  for (const [engine, pattern] of Object.entries(AI_CRAWLER_PATTERNS)) {
    if (pattern.test(userAgent)) {
      return {
        type: 'crawler',
        engine: engine,
        isAI: true
      }
    }
  }

  // 2. Check referrer (user traffic)
  const aiDomains = {
    'chat.openai.com': 'ChatGPT',
    'chatgpt.com': 'ChatGPT',
    'claude.ai': 'Claude',
    'perplexity.ai': 'Perplexity',
    'gemini.google.com': 'Gemini',
    'copilot.microsoft.com': 'Copilot'
  }

  for (const [domain, engine] of Object.entries(aiDomains)) {
    if (referrer.includes(domain)) {
      return {
        type: 'referral',
        engine: engine,
        isAI: true
      }
    }
  }

  return { type: 'organic', isAI: false }
}
```

#### B. Créer une table Supabase pour les logs AEO

**Table** : `aeo_tracking`

```sql
CREATE TABLE aeo_tracking (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Source
  source_type TEXT NOT NULL, -- 'crawler' | 'referral' | 'organic'
  engine_name TEXT,          -- 'ChatGPT' | 'Claude' | 'Perplexity' | etc.

  -- Request info
  user_agent TEXT,
  referrer TEXT,
  ip_address INET,

  -- Page info
  page_path TEXT NOT NULL,
  page_title TEXT,

  -- Session info
  session_duration INTEGER,  -- En secondes
  pages_viewed INTEGER DEFAULT 1,
  bounce BOOLEAN DEFAULT TRUE,

  -- Metadata
  metadata JSONB             -- Données supplémentaires
);

-- Index pour performance
CREATE INDEX idx_aeo_timestamp ON aeo_tracking(timestamp);
CREATE INDEX idx_aeo_engine ON aeo_tracking(engine_name);
CREATE INDEX idx_aeo_source_type ON aeo_tracking(source_type);
CREATE INDEX idx_aeo_page_path ON aeo_tracking(page_path);
```

#### C. Middleware pour tracker automatiquement

**Fichier** : `site/middleware-aeo-tracker.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { detectAISource } from '@/lib/ai-user-agent-detector'

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const referrer = request.headers.get('referer') || ''
  const path = request.nextUrl.pathname

  // Détecter AI source
  const source = detectAISource(userAgent, referrer)

  if (source.isAI) {
    // Log dans Supabase
    await fetch(process.env.SUPABASE_URL + '/rest/v1/aeo_tracking', {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_type: source.type,
        engine_name: source.engine,
        user_agent: userAgent,
        referrer: referrer,
        page_path: path,
        ip_address: request.ip
      })
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico).*)',
  ]
}
```

---

### Phase 2 : Dashboard AEO (APRÈS PHASE 1)

#### Nouvelles sections du dashboard :

```
📊 AEO OVERVIEW
├─ 🤖 AI Crawler Activity
│  ├─ Visites par bot (GPTBot, ClaudeBot, etc.)
│  ├─ Fréquence de crawl
│  └─ Pages crawlées
│
├─ 👥 AI Referral Traffic
│  ├─ Sessions par engine
│  ├─ AI vs Organic comparison
│  └─ Top landing pages
│
├─ 🔍 Query Performance
│  ├─ Top queries générant du trafic AI
│  ├─ Citation rate par query
│  └─ Intent analysis
│
├─ 📄 Content Performance AEO
│  ├─ Pages avec meilleur score AEO
│  ├─ AI engagement vs Organic
│  └─ Citation count par page
│
└─ 📈 Trends & Insights
   ├─ Évolution du trafic AI (7/30/90 jours)
   ├─ Nouveaux engines détectés
   └─ Recommandations d'optimisation
```

---

### Phase 3 : Automated Testing (FUTUR)

#### API pour tester les citations automatiquement

```typescript
// Tester si le site est cité pour une query donnée
async function testAEOCitation(query: string, engine: string) {
  // Utiliser l'API de chaque engine (si disponible)
  // Ou scraping éthique avec rate limiting

  const response = await queryAIEngine(engine, query)

  return {
    query: query,
    engine: engine,
    cited: response.includes('coding-prompts.dev'),
    position: findCitationPosition(response),
    snippet: extractSnippet(response),
    timestamp: new Date()
  }
}

// Planifier des tests réguliers
cron.schedule('0 0 * * *', async () => {
  // Tester chaque jour les queries importantes
  for (const query of importantQueries) {
    for (const engine of ['ChatGPT', 'Claude', 'Perplexity']) {
      await testAEOCitation(query, engine)
      await sleep(5000) // Rate limiting
    }
  }
})
```

---

## 🎯 QUERIES IMPORTANTES À TRACKER

Pour **coding-prompts.dev**, ces queries sont critiques :

### 1. Brand queries
```
- "claude code"
- "what is claude code"
- "claude code cli"
```

### 2. Feature queries
```
- "how to use claude code"
- "claude code features"
- "claude code tutorial"
- "claude code examples"
```

### 3. Comparison queries
```
- "claude code vs cursor"
- "claude code vs github copilot"
- "claude code vs continue.dev"
- "best ai coding assistant"
```

### 4. Problem-solving queries
```
- "claude code not working"
- "claude code error"
- "claude code installation"
- "fix claude code [issue]"
```

### 5. How-to queries
```
- "how to install claude code"
- "how to setup claude code"
- "how to use claude code with [editor]"
```

---

## 📊 KPIs AEO À SUIVRE

### Court terme (1-3 mois)
- ✅ **AI Traffic Growth** : +20% par mois
- ✅ **AI Crawler Visits** : 100+ visites/mois
- ✅ **Citation Rate** : 30% des queries testées

### Moyen terme (3-6 mois)
- ✅ **AI Traffic Share** : 40% du trafic total
- ✅ **Top 3 Position** : 60% des citations en top 3
- ✅ **Multi-engine Citations** : Cité par 5+ engines

### Long terme (6-12 mois)
- ✅ **AI-First Site** : 60%+ du trafic depuis AI
- ✅ **Authority Status** : Cité régulièrement comme source référence
- ✅ **Diversification** : Trafic équilibré sur tous les engines

---

## 🚀 PROCHAINES ÉTAPES IMMÉDIATES

1. **Activer Supabase** pour stocker les logs AEO
2. **Améliorer la détection** des AI crawlers et referrers
3. **Créer le middleware** pour tracking automatique
4. **Ajouter les sections AEO** au dashboard
5. **Tester manuellement** les queries importantes sur ChatGPT, Claude, Perplexity

---

## 📚 RESSOURCES AEO

- [AEO vs SEO Guide](https://www.searchenginejournal.com/answer-engine-optimization/)
- [How to optimize for ChatGPT](https://openai.com/blog/chatgpt-search)
- [Perplexity SEO Guide](https://www.perplexity.ai/hub/blog/how-to-optimize-for-perplexity)
- [AI Crawler Detection](https://platform.openai.com/docs/gptbot)

---

**Dernière mise à jour** : 2026-02-10
**Status** : 🚀 **PRÊT À IMPLÉMENTER**
