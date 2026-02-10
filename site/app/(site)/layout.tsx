import Script from 'next/script'
import { AITrackerScript } from './ai-tracker-script'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AITrackerScript />
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
          gtag('config', 'G-24Q7ZZ71LB', {
            send_page_view: true,
            custom_map: {
              'dimension1': 'ai_engine',
              'dimension2': 'ai_traffic_type',
              'dimension3': 'content_type',
              'dimension4': 'page_category'
            }
          });
        `}
      </Script>
      <Script id="ga4-enhanced-init" strategy="afterInteractive">
        {`
          // Initialize enhanced tracking
          (function() {
            const ua = navigator.userAgent;
            const isAI = /ChatGPT|Claude|Gemini|Perplexity|GPTBot|Anthropic/i.test(ua);

            if (isAI) {
              let engine = 'unknown';
              if (/ChatGPT|GPTBot/i.test(ua)) engine = 'ChatGPT';
              else if (/Claude|Anthropic/i.test(ua)) engine = 'Claude';
              else if (/Gemini|Bard/i.test(ua)) engine = 'Gemini';
              else if (/Perplexity/i.test(ua)) engine = 'Perplexity';

              gtag('set', 'user_properties', {
                traffic_type: 'ai',
                ai_engine: engine
              });

              gtag('event', 'ai_crawler_visit', {
                ai_engine: engine,
                event_category: 'AI Traffic'
              });
            }
          })();
        `}
      </Script>
      <header className="border-b bg-white">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">Coding Prompts</a>
          <div className="flex gap-6 text-sm items-center">
            <a href="/troubleshooting" className="hover:text-blue-600">Troubleshooting</a>
            <a href="/setup" className="hover:text-blue-600">Setup</a>
            <a href="/features" className="hover:text-blue-600">Features</a>
            <a href="/vs" className="hover:text-blue-600">Comparisons</a>
            <a href="/admin/dashboard" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-sm">
              Dashboard
            </a>
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
    </>
  )
}
