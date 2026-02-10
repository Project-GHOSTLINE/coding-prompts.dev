#!/usr/bin/env node
/**
 * Setup AEO Tracking Table in Supabase
 *
 * Ce script crée la table aeo_tracking, les index, les vues et les fonctions
 * pour le tracking des visites AI (crawlers et referrals).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Vérifier les credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables d\'environnement Supabase manquantes')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

console.log('🔧 Configuration du schéma AEO dans Supabase...\n')

// Créer le client Supabase avec le service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Lire le fichier SQL
const sqlPath = join(__dirname, 'supabase-aeo-schema.sql')
const sqlContent = readFileSync(sqlPath, 'utf-8')

// Diviser le SQL en statements (séparés par des lignes vides et commentaires)
const statements = sqlContent
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))
  .map(s => s + ';')

console.log(`📄 Fichier SQL chargé: ${statements.length} statements trouvés\n`)

// Exécuter chaque statement via RPC
async function executeSql(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      // Si la fonction exec_sql n'existe pas, utiliser une autre méthode
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.warn('⚠️  La fonction exec_sql n\'existe pas, utilisation de la méthode alternative...')

        // Pour les CREATE TABLE, utiliser l'API REST directement
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ query: sql })
        })

        if (!response.ok) {
          const text = await response.text()
          throw new Error(`HTTP ${response.status}: ${text}`)
        }

        return await response.json()
      }

      throw error
    }

    return data
  } catch (err) {
    throw err
  }
}

// Fonction principale
async function setup() {
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]

    // Extraire le type de statement pour l'affichage
    const type = stmt.match(/^(CREATE TABLE|CREATE INDEX|CREATE VIEW|CREATE FUNCTION|INSERT INTO|DROP TABLE|ALTER TABLE|CREATE POLICY)/i)?.[1] || 'SQL'

    try {
      console.log(`${i + 1}/${statements.length} - Exécution: ${type}...`)
      await executeSql(stmt)
      console.log(`   ✅ Succès\n`)
      successCount++
    } catch (error) {
      // Ignorer certaines erreurs attendues
      const errorMsg = error.message || String(error)

      if (errorMsg.includes('already exists') || errorMsg.includes('does not exist')) {
        console.log(`   ⚠️  Warning: ${errorMsg}\n`)
        successCount++
      } else {
        console.error(`   ❌ Erreur: ${errorMsg}\n`)
        errorCount++
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ ${successCount} statements réussis`)
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} erreurs`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Vérifier que la table existe
  console.log('🔍 Vérification de la table aeo_tracking...')

  const { data, error } = await supabase
    .from('aeo_tracking')
    .select('count')
    .limit(1)

  if (error) {
    console.error('❌ La table aeo_tracking n\'a pas pu être créée:', error.message)
    process.exit(1)
  }

  // Compter les enregistrements de test
  const { count } = await supabase
    .from('aeo_tracking')
    .select('*', { count: 'exact', head: true })

  console.log(`✅ Table aeo_tracking créée avec succès!`)
  console.log(`   Enregistrements: ${count || 0}`)

  // Afficher quelques stats si des données existent
  if (count && count > 0) {
    const { data: stats } = await supabase
      .from('aeo_by_engine')
      .select('*')

    if (stats && stats.length > 0) {
      console.log('\n📊 Statistiques par moteur AI:')
      stats.forEach(s => {
        console.log(`   ${s.engine_name} (${s.source_type}): ${s.total_visits} visites`)
      })
    }
  }

  console.log('\n✅ Configuration AEO terminée!\n')
}

// Exécuter
setup().catch(error => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})
