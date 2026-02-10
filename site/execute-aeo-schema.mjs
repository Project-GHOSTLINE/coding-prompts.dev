#!/usr/bin/env node
/**
 * Exécute le schéma AEO directement dans Supabase via RPC
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🚀 EXÉCUTION DU SCHÉMA AEO VIA RPC')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

async function executeSchema() {
  // Lire le fichier SQL
  const sqlPath = join(__dirname, 'supabase-aeo-schema.sql')
  const sqlContent = readFileSync(sqlPath, 'utf-8')

  console.log('📄 Schéma SQL chargé:', (sqlContent.length / 1024).toFixed(2), 'KB\n')

  // Diviser en statements individuels
  const statements = sqlContent
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
    .map(s => s + ';')

  console.log(`📊 ${statements.length} statements SQL à exécuter\n`)

  // La fonction RPC s'appelle exec_sql avec paramètre 'query'
  const rpcName = 'exec_sql'

  console.log(`🔍 Test de la fonction RPC: ${rpcName}...\n`)

  try {
    const { data, error } = await supabase.rpc(rpcName, {
      query: 'SELECT 1 as test'
    })

    if (error) {
      console.error(`❌ Erreur lors du test de ${rpcName}:`, error.message)
      console.error('\nVérifie que la fonction exec_sql(query TEXT) existe dans Supabase.\n')
      process.exit(1)
    }

    console.log(`✅ Fonction ${rpcName} opérationnelle!\n`)
  } catch (e) {
    console.error('❌ Exception:', e.message)
    process.exit(1)
  }

  // Exécuter chaque statement
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    const type = stmt.match(/^(CREATE TABLE|CREATE INDEX|CREATE VIEW|CREATE FUNCTION|INSERT INTO|DROP TABLE|ALTER TABLE|CREATE POLICY|CREATE OR REPLACE)/i)?.[1] || 'SQL'

    try {
      console.log(`${i + 1}/${statements.length} - ${type}...`)

      const { data, error } = await supabase.rpc(rpcName, {
        query: stmt
      })

      if (error) {
        // Ignorer certaines erreurs attendues
        if (error.message.includes('already exists') ||
            error.message.includes('does not exist')) {
          console.log(`   ⚠️  Warning: ${error.message}`)
          successCount++
        } else {
          console.error(`   ❌ Erreur: ${error.message}`)
          errorCount++
        }
      } else {
        console.log(`   ✅ Succès`)
        successCount++
      }
    } catch (error) {
      console.error(`   ❌ Exception: ${error.message}`)
      errorCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ ${successCount} statements réussis`)
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} erreurs`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Vérifier que la table existe
  console.log('🔍 Vérification de la table aeo_tracking...\n')

  const { data, error, count } = await supabase
    .from('aeo_tracking')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('❌ La table n\'a pas pu être créée:', error.message)
    process.exit(1)
  }

  console.log(`✅ Table aeo_tracking créée avec succès!`)
  console.log(`   📊 ${count || 0} enregistrements\n`)

  // Afficher les stats si des données existent
  if (count && count > 0) {
    const { data: stats } = await supabase
      .from('aeo_tracking')
      .select('engine_name, source_type')
      .not('engine_name', 'is', null)

    if (stats && stats.length > 0) {
      console.log('📈 Données de test insérées:')
      const grouped = stats.reduce((acc, row) => {
        const key = `${row.engine_name} (${row.source_type})`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      Object.entries(grouped).forEach(([key, count]) => {
        console.log(`   ${key}: ${count} visites`)
      })
    }
  }

  console.log('\n✅ SCHÉMA AEO CRÉÉ AVEC SUCCÈS!\n')
  console.log('🚀 Le middleware va maintenant tracker automatiquement les visites AI!\n')
}

executeSchema().catch(error => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})
