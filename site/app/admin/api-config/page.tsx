'use client'

import { useState, useEffect } from 'react'
import { KeyIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface APIStatus {
  name: string
  key: string
  status: 'connected' | 'disconnected' | 'testing'
  lastChecked?: string
}

export default function APIConfigPage() {
  const [apis, setApis] = useState<APIStatus[]>([
    {
      name: 'SEMrush API',
      key: process.env.NEXT_PUBLIC_SEMRUSH_API_KEY || '',
      status: 'disconnected'
    },
    {
      name: 'Google Analytics 4',
      key: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '',
      status: 'disconnected'
    }
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    // Check API status on mount
    const updatedApis = apis.map(api => ({
      ...api,
      status: api.key ? 'connected' : 'disconnected',
      lastChecked: api.key ? new Date().toLocaleString('fr-FR') : undefined
    })) as APIStatus[]

    setApis(updatedApis)
  }, [])

  const handleTestAPI = async (index: number) => {
    const updatedApis = [...apis]
    updatedApis[index].status = 'testing'
    setApis(updatedApis)

    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500))

    updatedApis[index].status = updatedApis[index].key ? 'connected' : 'disconnected'
    updatedApis[index].lastChecked = new Date().toLocaleString('fr-FR')
    setApis(updatedApis)
  }

  const handleUpdateKey = (index: number, newKey: string) => {
    const updatedApis = [...apis]
    updatedApis[index].key = newKey
    updatedApis[index].status = 'disconnected'
    setApis(updatedApis)
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    setSaveMessage('')

    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSaveMessage('Configuration API enregistrée avec succès')
    setIsSaving(false)

    setTimeout(() => setSaveMessage(''), 3000)
  }

  const getStatusColor = (status: APIStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-600'
      case 'disconnected':
        return 'text-red-600'
      case 'testing':
        return 'text-yellow-600'
    }
  }

  const getStatusIcon = (status: APIStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5" />
      case 'disconnected':
        return <XCircleIcon className="w-5 h-5" />
      case 'testing':
        return <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <KeyIcon className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Configuration API</h1>
          </div>
          <p className="text-gray-600">Gérer les clés API et vérifier les connexions</p>
        </div>

        {/* API Keys */}
        <div className="space-y-6">
          {apis.map((api, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 lg:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{api.name}</h2>
                  <div className={`flex items-center gap-2 mt-2 ${getStatusColor(api.status)}`}>
                    {getStatusIcon(api.status)}
                    <span className="text-sm font-medium">
                      {api.status === 'connected' && 'Connecté'}
                      {api.status === 'disconnected' && 'Non connecté'}
                      {api.status === 'testing' && 'Test en cours...'}
                    </span>
                  </div>
                  {api.lastChecked && (
                    <p className="text-xs text-gray-500 mt-1">
                      Dernière vérification: {api.lastChecked}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleTestAPI(index)}
                  disabled={api.status === 'testing' || !api.key}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Tester
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé API
                </label>
                <input
                  type="password"
                  value={api.key}
                  onChange={(e) => handleUpdateKey(index, e.target.value)}
                  placeholder="Entrez votre clé API"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              {/* Configuration hints */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-900 font-medium mb-2">Configuration requise:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  {api.name === 'SEMrush API' && (
                    <>
                      <li>Variable d'environnement: NEXT_PUBLIC_SEMRUSH_API_KEY</li>
                      <li>Obtenir une clé: <a href="https://www.semrush.com/api-analytics/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">semrush.com/api</a></li>
                    </>
                  )}
                  {api.name === 'Google Analytics 4' && (
                    <>
                      <li>Variable d'environnement: NEXT_PUBLIC_GA4_MEASUREMENT_ID</li>
                      <li>Format: G-XXXXXXXXXX</li>
                      <li>Configuration: <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google Analytics</a></li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center justify-between">
          <div>
            {saveMessage && (
              <p className="text-sm text-green-600 font-medium">{saveMessage}</p>
            )}
          </div>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}
          </button>
        </div>

        {/* Documentation */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="font-semibold text-yellow-900 mb-2">Note importante</h3>
          <p className="text-sm text-yellow-800">
            Les modifications des clés API nécessitent un redémarrage du serveur pour prendre effet.
            Ajoutez les clés dans votre fichier <code className="px-2 py-1 bg-yellow-100 rounded font-mono text-xs">.env.local</code> pour une configuration permanente.
          </p>
        </div>
      </div>
    </div>
  )
}
