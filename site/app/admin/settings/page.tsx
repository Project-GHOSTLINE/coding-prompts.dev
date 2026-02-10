'use client'

import { useState } from 'react'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Coding Prompts',
    siteUrl: 'https://coding-prompts.dev',
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || '',
    enableAEOTracking: true,
    enableGATracking: true,
    enableSEMrush: true
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSaveMessage('Paramètres enregistrés avec succès')
    setIsSaving(false)

    setTimeout(() => setSaveMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Cog6ToothIcon className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          </div>
          <p className="text-gray-600">Configuration générale du site et des services</p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 lg:p-8 space-y-6">

            {/* Site Configuration */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration du site</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du site
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL du site
                  </label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email administrateur
                  </label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Analytics & Tracking */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Tracking</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Tracking AEO</p>
                    <p className="text-sm text-gray-500">Suivi des citations par les moteurs AI</p>
                  </div>
                  <button
                    onClick={() => setSettings({...settings, enableAEOTracking: !settings.enableAEOTracking})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableAEOTracking ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableAEOTracking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Google Analytics</p>
                    <p className="text-sm text-gray-500">Tracking GA4 des visites</p>
                  </div>
                  <button
                    onClick={() => setSettings({...settings, enableGATracking: !settings.enableGATracking})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableGATracking ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableGATracking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">SEMrush API</p>
                    <p className="text-sm text-gray-500">Récupération données SEO</p>
                  </div>
                  <button
                    onClick={() => setSettings({...settings, enableSEMrush: !settings.enableSEMrush})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableSEMrush ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableSEMrush ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
              <div>
                {saveMessage && (
                  <p className="text-sm text-green-600 font-medium">{saveMessage}</p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
