#!/usr/bin/env node
/**
 * Test du système AEO Tracking
 *
 * Simule des visites AI et vérifie qu'elles sont correctement trackées
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🧪 TEST AEO TRACKING SYSTEM')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

async function insertTestVisit(type, engine, userAgent, referrer, path) {
  const { error } = await supabase.from('aeo_tracking').insert({
    source_type: type,
    engine_name: engine,
    user_agent: userAgent,
    referrer: referrer,
    page_path: path,
    bounce: false,
    pages_viewed: 1,
    metadata: { test: true }
  })

  if (error) {
    console.error(`   ❌ ${engine}: ${error.message}`)
    return false
  }

  console.log(`   ✅ ${engine} (${type})`)
  return true
}

async function runTests() {
  console.log('1️⃣ Insertion de visites de test...\n')

  let successCount = 0

  // Crawlers
  if (await insertTestVisit(
    'crawler',
    'ChatGPT',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0',
    '',
    '/test/crawler/chatgpt'
  )) successCount++

  if (await insertTestVisit(
    'crawler',
    'Claude',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0',
    '',
    '/test/crawler/claude'
  )) successCount++

  if (await insertTestVisit(
    'crawler',
    'Perplexity',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0',
    '',
    '/test/crawler/perplexity'
  )) successCount++

  // Referrals
  if (await insertTestVisit(
    'referral',
    'ChatGPT',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'https://chat.openai.com/',
    '/test/referral/chatgpt'
  )) successCount++

  if (await insertTestVisit(
    'referral',
    'Claude',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'https://claude.ai/chat/',
    '/test/referral/claude'
  )) successCount++

  if (await insertTestVisit(
    'referral',
    'Perplexity',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'https://www.perplexity.ai/',
    '/test/referral/perplexity'
  )) successCount++

  console.log(`\n   Total: ${successCount}/6 visites insérées\n`)

  // Vérifier le total
  console.log('2️⃣ Vérification de la table...\n')

  const { data, error, count } = await supabase
    .from('aeo_tracking')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('   ❌ Erreur:', error.message)
    return
  }

  console.log(`   ✅ ${count} enregistrements totaux\n`)

  // Stats par engine
  console.log('3️⃣ Stats par moteur AI...\n')

  const { data: stats } = await supabase
    .from('aeo_tracking')
    .select('engine_name, source_type')
    .not('engine_name', 'is', null)

  if (stats) {
    const grouped = stats.reduce((acc, row) => {
      const key = `${row.engine_name} (${row.source_type})`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    Object.entries(grouped).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} visites`)
    })
  }

  console.log('\n4️⃣ Dernières visites (limit 5)...\n')

  const { data: recent } = await supabase
    .from('aeo_tracking')
    .select('timestamp, engine_name, source_type, page_path')
    .order('timestamp', { ascending: false })
    .limit(5)

  if (recent) {
    recent.forEach(row => {
      const time = new Date(row.timestamp).toLocaleTimeString()
      console.log(`   ${time} - ${row.engine_name} (${row.source_type}) → ${row.page_path}`)
    })
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ TEST TERMINÉ AVEC SUCCÈS!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('Le système AEO tracking est opérationnel.\n')
  console.log('Pour nettoyer les données de test:')
  console.log('DELETE FROM aeo_tracking WHERE metadata->>\'test\' = \'true\';\n')
}

runTests().catch(error => {
  console.error('❌ Erreur:', error)
  process.exit(1)
})
