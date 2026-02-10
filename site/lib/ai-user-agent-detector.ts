/**
 * AI User-Agent Detector - Enhanced AEO Version
 * Détecte les crawlers AI et le trafic référé par les AI engines
 *
 * AEO (Answer Engine Optimization) - Détection complète:
 * - Crawlers: GPTBot, ClaudeBot, Google-Extended, PerplexityBot, etc.
 * - Referrals: chat.openai.com, claude.ai, perplexity.ai, etc.
 *
 * Date: 2026-02-10
 */

export interface AIEngine {
  name: string
  crawlerPattern?: RegExp
  referrerDomains?: string[]
  type: 'crawler' | 'referral' | 'both'
}

export interface AIDetectionResult {
  isAI: boolean
  engine?: string
  sourceType?: 'crawler' | 'referral' | 'organic'
  userAgent?: string
  referrer?: string
}

// ============================================================================
// AI ENGINES CONFIGURATION (Patterns 2026)
// ============================================================================

export const AI_ENGINES: AIEngine[] = [
  // OpenAI / ChatGPT
  {
    name: 'ChatGPT',
    crawlerPattern: /GPTBot|ChatGPT-User|ChatGPT|OpenAI/i,
    referrerDomains: ['chat.openai.com', 'chatgpt.com'],
    type: 'both'
  },

  // Anthropic / Claude
  {
    name: 'Claude',
    crawlerPattern: /Claude-Web|Anthropic-AI|ClaudeBot|Claude/i,
    referrerDomains: ['claude.ai'],
    type: 'both'
  },

  // Google / Gemini
  {
    name: 'Gemini',
    crawlerPattern: /Google-Extended|Gemini-Bot/i,
    referrerDomains: ['gemini.google.com', 'bard.google.com'],
    type: 'both'
  },

  // Perplexity
  {
    name: 'Perplexity',
    crawlerPattern: /PerplexityBot|Perplexity/i,
    referrerDomains: ['perplexity.ai', 'www.perplexity.ai'],
    type: 'both'
  },

  // Microsoft Copilot
  {
    name: 'Copilot',
    crawlerPattern: /BingPreview|EdgeGPT|BingBot.*AI/i,
    referrerDomains: ['copilot.microsoft.com', 'bing.com/chat'],
    type: 'both'
  },

  // You.com
  {
    name: 'You.com',
    crawlerPattern: /YouBot/i,
    referrerDomains: ['you.com'],
    type: 'both'
  },

  // Phind
  {
    name: 'Phind',
    crawlerPattern: /Phind/i,
    referrerDomains: ['phind.com', 'www.phind.com'],
    type: 'both'
  },

  // Meta AI
  {
    name: 'Meta AI',
    crawlerPattern: /Meta-ExternalAgent|FacebookBot.*AI/i,
    referrerDomains: ['meta.ai'],
    type: 'both'
  },

  // AI2Bot (Allen Institute)
  {
    name: 'AI2Bot',
    crawlerPattern: /AI2Bot/i,
    type: 'crawler'
  },

  // Autres crawlers AI génériques
  {
    name: 'AI Crawler',
    crawlerPattern: /anthropic-ai|cohere-ai|ai-bot/i,
    type: 'crawler'
  }
]

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Détecte si un user-agent est un crawler AI
 */
function detectAICrawler(userAgent: string): { engine?: string } {
  if (!userAgent) return {}

  for (const engine of AI_ENGINES) {
    if (engine.crawlerPattern && engine.crawlerPattern.test(userAgent)) {
      return { engine: engine.name }
    }
  }

  return {}
}

/**
 * Détecte si un referrer provient d'un AI engine
 */
function detectAIReferrer(referrer: string): { engine?: string } {
  if (!referrer) return {}

  const referrerLower = referrer.toLowerCase()

  for (const engine of AI_ENGINES) {
    if (engine.referrerDomains) {
      for (const domain of engine.referrerDomains) {
        if (referrerLower.includes(domain)) {
          return { engine: engine.name }
        }
      }
    }
  }

  return {}
}

/**
 * Détection complète: crawler + referrer
 * C'est la fonction principale à utiliser pour l'AEO tracking
 */
export function detectAISource(
  userAgent: string,
  referrer: string
): AIDetectionResult {
  // 1. Vérifier d'abord si c'est un crawler
  const crawlerResult = detectAICrawler(userAgent)
  if (crawlerResult.engine) {
    return {
      isAI: true,
      engine: crawlerResult.engine,
      sourceType: 'crawler',
      userAgent
    }
  }

  // 2. Vérifier si c'est un referral depuis un AI engine
  const referrerResult = detectAIReferrer(referrer)
  if (referrerResult.engine) {
    return {
      isAI: true,
      engine: referrerResult.engine,
      sourceType: 'referral',
      referrer
    }
  }

  // 3. Trafic organique
  return {
    isAI: false,
    sourceType: 'organic'
  }
}

/**
 * Détecte si un user-agent provient d'une IA (legacy - gardé pour compatibilité)
 * @deprecated Utilise detectAISource() à la place
 */
export function detectAIEngine(userAgent: string): {
  isAI: boolean
  engine?: string
  type?: 'crawler' | 'browser'
} {
  const result = detectAICrawler(userAgent)
  if (result.engine) {
    return {
      isAI: true,
      engine: result.engine,
      type: 'crawler'
    }
  }
  return { isAI: false }
}

/**
 * Extrait le nom de l'engine depuis le user-agent
 * @deprecated Utilise detectAISource() à la place
 */
export function getAIEngineName(userAgent: string): string | null {
  const detection = detectAIEngine(userAgent)
  return detection.isAI ? detection.engine! : null
}

/**
 * Vérifie si une requête provient d'un bot AI (pour logging)
 */
export function isAIRequest(headers: Headers): boolean {
  const userAgent = headers.get('user-agent') || ''
  const referrer = headers.get('referer') || headers.get('referrer') || ''
  const result = detectAISource(userAgent, referrer)
  return result.isAI
}

/**
 * Extrait les informations complètes sur le visiteur AI
 * Version complète avec crawler + referrer detection
 */
export function getAIVisitorInfo(headers: Headers): {
  isAI: boolean
  engine?: string
  sourceType?: 'crawler' | 'referral' | 'organic'
  userAgent?: string
  referrer?: string
  timestamp: Date
} {
  const userAgent = headers.get('user-agent') || ''
  const referrer = headers.get('referer') || headers.get('referrer') || ''

  const detection = detectAISource(userAgent, referrer)

  return {
    ...detection,
    timestamp: new Date()
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Liste tous les AI engines supportés
 */
export function getAllAIEngines(): string[] {
  return AI_ENGINES.map(e => e.name)
}

/**
 * Vérifie si un engine spécifique est supporté
 */
export function isEngineSupported(engineName: string): boolean {
  return AI_ENGINES.some(e => e.name.toLowerCase() === engineName.toLowerCase())
}

/**
 * Retourne les stats de détection pour debugging
 */
export function getDetectionStats() {
  return {
    totalEngines: AI_ENGINES.length,
    crawlerOnly: AI_ENGINES.filter(e => e.type === 'crawler').length,
    referralOnly: AI_ENGINES.filter(e => e.type === 'referral').length,
    both: AI_ENGINES.filter(e => e.type === 'both').length,
    engines: AI_ENGINES.map(e => ({
      name: e.name,
      hasCrawler: !!e.crawlerPattern,
      hasReferrer: !!e.referrerDomains,
      referrerDomains: e.referrerDomains || []
    }))
  }
}
