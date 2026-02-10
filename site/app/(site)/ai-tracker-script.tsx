'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Client-side script pour détecter et logger les visites AI
 * Envoie des événements custom à Google Analytics
 */
export function AITrackerScript() {
  const pathname = usePathname()

  useEffect(() => {
    // Détecter si le user-agent contient des patterns AI
    const ua = navigator.userAgent
    const isAI = /ChatGPT|Claude|Gemini|Perplexity|GPTBot|Anthropic/i.test(ua)

    if (isAI) {
      // Envoyer événement custom à GA4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'ai_visit', {
          page_path: pathname,
          user_agent: ua.substring(0, 100),
          event_category: 'AI Traffic',
          event_label: 'AI Engine Visit'
        })
      }

      // Logger côté serveur
      fetch('/api/track-ai-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAgent: ua,
          path: pathname,
          referrer: document.referrer
        })
      }).catch(err => console.error('AI tracking failed:', err))
    }
  }, [pathname])

  return null
}
