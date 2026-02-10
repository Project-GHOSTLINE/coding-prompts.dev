'use client'

import { useState } from 'react'

interface AEOTestResult {
  model: string
  query: string
  citesOurSite: boolean
  matchScore: number
  responseSnippet: string
  citationFound?: string
  error?: string
}

export function AEOTester() {
  const [query, setQuery] = useState('Claude Code process exited with code 1')
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<AEOTestResult[]>([])

  const runTests = async () => {
    setTesting(true)
    setResults([])

    try {
      const response = await fetch('/api/admin/aeo-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error('Test failed')
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('AEO test error:', error)
      alert('Erreur lors du test AEO. Vérifiez les API keys.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-4">🧪 AEO Citation Tester</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Query
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez une requête de test..."
          />
        </div>

        <button
          onClick={runTests}
          disabled={testing || !query}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {testing ? 'Test en cours...' : 'Lancer le test AEO'}
        </button>

        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 rounded border ${
                  result.citesOurSite
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{result.model}</span>
                    {result.citesOurSite && <span className="text-green-600">✓ Cité</span>}
                  </div>
                  <span className="text-sm font-semibold">
                    Score: {result.matchScore}/100
                  </span>
                </div>

                {result.error ? (
                  <p className="text-sm text-red-600">Erreur: {result.error}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 mb-2">
                      {result.responseSnippet}
                    </p>

                    {result.citationFound && (
                      <div className="mt-2 p-2 bg-white rounded border border-green-200">
                        <p className="text-xs font-semibold text-green-700 mb-1">
                          Citation trouvée:
                        </p>
                        <p className="text-xs text-gray-600">{result.citationFound}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Ce test utilise les APIs officielles (OpenAI, Anthropic, Google AI).
            Configurez les API keys dans .env.local pour activer les tests.
          </p>
        </div>
      </div>
    </div>
  )
}
