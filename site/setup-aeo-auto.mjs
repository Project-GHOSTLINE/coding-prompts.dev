#!/usr/bin/env node
/**
 * Setup AEO Tracking Table in Supabase (Automatique)
 *
 * Utilise pg pour se connecter directement à PostgreSQL
 */

import pkg from 'pg'
const { Client } = pkg
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔧 SETUP AUTOMATIQUE AEO TRACKING TABLE')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Connection string PostgreSQL
// Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ Erreur: Variable DATABASE_URL manquante')
  console.error('\nPour obtenir la connection string:')
  console.error('1. Va sur https://supabase.com/dashboard/project/dllyzfuqjzuhvshrlmuq')
  console.error('2. Settings → Database → Connection String → URI')
  console.error('3. Copie la connection string')
  console.error('4. Ajoute-la dans .env.local:')
  console.error('   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.dllyzfuqjzuhvshrlmuq.supabase.co:5432/postgres\n')
  console.error('Alternative: Utilise le script manuel:')
  console.error('   node setup-aeo-table-simple.mjs\n')
  process.exit(1)
}

// Lire le fichier SQL
const sqlPath = join(__dirname, 'supabase-aeo-schema.sql')
const sqlContent = readFileSync(sqlPath, 'utf-8')

console.log('📄 Contenu SQL chargé:', (sqlContent.length / 1024).toFixed(2), 'KB\n')

async function setup() {
  const client = new Client({ connectionString })

  try {
    console.log('🔌 Connexion à PostgreSQL...')
    await client.connect()
    console.log('✅ Connecté!\n')

    console.log('⚙️  Exécution du schéma SQL...\n')

    // Exécuter le SQL complet
    await client.query(sqlContent)

    console.log('✅ Schéma créé avec succès!\n')

    // Vérifier les données
    console.log('🔍 Vérification...')
    const result = await client.query('SELECT COUNT(*) as count FROM aeo_tracking')
    const count = parseInt(result.rows[0].count)

    console.log(`   📊 ${count} enregistrements dans aeo_tracking`)

    if (count > 0) {
      const stats = await client.query('SELECT * FROM aeo_by_engine')
      console.log('\n📈 Stats par moteur:')
      stats.rows.forEach(row => {
        console.log(`   ${row.engine_name} (${row.source_type}): ${row.total_visits} visites`)
      })
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ SETUP TERMINÉ AVEC SUCCÈS!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error('\nStack:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

setup()
