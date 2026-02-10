/**
 * Google Analytics 4 Enhanced Tracking
 * Configuration pour tracking avancé des événements AEO
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

/**
 * Envoie un événement custom à GA4
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams)
  }
}

/**
 * Track AI citation event
 */
export function trackAICitation(engine: string, citedContent: string, page: string) {
  trackEvent('ai_citation', {
    ai_engine: engine,
    cited_content: citedContent.substring(0, 100), // Limit length
    page_path: page,
    event_category: 'AEO',
    event_label: `${engine} Citation`
  })
}

/**
 * Track AI crawler visit
 */
export function trackAICrawler(engine: string, userAgent: string) {
  trackEvent('ai_crawler_visit', {
    ai_engine: engine,
    user_agent: userAgent.substring(0, 100),
    event_category: 'AI Traffic',
    event_label: `${engine} Crawler`
  })
}

/**
 * Track content engagement
 */
export function trackContentEngagement(contentType: string, action: string, value?: number) {
  trackEvent('content_engagement', {
    content_type: contentType,
    engagement_action: action,
    engagement_value: value,
    event_category: 'Content',
    event_label: `${contentType} - ${action}`
  })
}

/**
 * Track search query (organic or AI)
 */
export function trackSearchQuery(query: string, source: 'organic' | 'ai', engine?: string) {
  trackEvent('search_query', {
    search_query: query,
    search_source: source,
    ai_engine: engine,
    event_category: 'Search',
    event_label: `${source} Search`
  })
}

/**
 * Configure GA4 custom dimensions
 * Ces dimensions doivent être configurées dans GA4 Admin
 */
export const GA4_CUSTOM_DIMENSIONS = {
  ai_engine: 'dimension1',
  ai_traffic_type: 'dimension2', // crawler | referral
  content_type: 'dimension3', // troubleshooting | setup | features
  page_category: 'dimension4'
}

/**
 * Configure GA4 custom metrics
 */
export const GA4_CUSTOM_METRICS = {
  ai_session_score: 'metric1', // Quality score for AI sessions
  citation_likelihood: 'metric2' // Estimated citation probability
}

/**
 * Set user properties for AI traffic segmentation
 */
export function setUserProperty(propertyName: string, value: any) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', {
      [propertyName]: value
    })
  }
}

/**
 * Initialize enhanced tracking on page load
 */
export function initializeEnhancedTracking() {
  // Détecter si c'est un bot AI
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isAI = /ChatGPT|Claude|Gemini|Perplexity|GPTBot|Anthropic/i.test(ua)

  if (isAI) {
    // Marquer comme trafic AI
    setUserProperty('traffic_type', 'ai')

    // Identifier l'engine
    let engine = 'unknown'
    if (/ChatGPT|GPTBot/i.test(ua)) engine = 'ChatGPT'
    else if (/Claude|Anthropic/i.test(ua)) engine = 'Claude'
    else if (/Gemini|Bard/i.test(ua)) engine = 'Gemini'
    else if (/Perplexity/i.test(ua)) engine = 'Perplexity'

    setUserProperty('ai_engine', engine)
    trackAICrawler(engine, ua)
  }

  // Track content category based on URL
  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    let category = 'other'

    if (path.includes('/troubleshooting')) category = 'troubleshooting'
    else if (path.includes('/setup')) category = 'setup'
    else if (path.includes('/features')) category = 'features'
    else if (path.includes('/vs')) category = 'comparisons'

    setUserProperty('content_category', category)
  }
}

/**
 * Track scroll depth (for engagement measurement)
 */
export function trackScrollDepth(depth: number) {
  trackEvent('scroll_depth', {
    scroll_percentage: depth,
    event_category: 'Engagement',
    event_label: `${depth}% Scrolled`
  })
}

/**
 * Track code copy events (important for technical content)
 */
export function trackCodeCopy(codeSnippet: string, language?: string) {
  trackEvent('code_copy', {
    code_language: language || 'unknown',
    code_length: codeSnippet.length,
    event_category: 'Content Interaction',
    event_label: 'Code Copied'
  })
}
