#!/usr/bin/env node
/**
 * Créer la table AEO de manière simple et directe
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🚀 Création de la table aeo_tracking...\n')

async function createTable() {
  // 1. Supprimer la table si elle existe
  console.log('1️⃣ Suppression de la table existante (si elle existe)...')
  const { error: dropError } = await supabase.rpc('exec_sql', {
    query: 'DROP TABLE IF EXISTS aeo_tracking CASCADE;'
  })

  if (dropError) {
    console.log(`   ⚠️  ${dropError.message}`)
  } else {
    console.log('   ✅ OK\n')
  }

  // 2. Créer la table
  console.log('2️⃣ Création de la table aeo_tracking...')
  const { error: createError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE aeo_tracking (
        id BIGSERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        source_type TEXT NOT NULL CHECK (source_type IN ('crawler', 'referral', 'organic')),
        engine_name TEXT,
        user_agent TEXT,
        referrer TEXT,
        ip_address INET,
        page_path TEXT NOT NULL,
        page_title TEXT,
        session_id TEXT,
        session_duration INTEGER,
        pages_viewed INTEGER DEFAULT 1,
        bounce BOOLEAN DEFAULT TRUE,
        metadata JSONB
      );
    `
  })

  if (createError) {
    console.error('   ❌ Erreur:', createError.message)
    return false
  }
  console.log('   ✅ Table créée!\n')

  // 3. Créer les index
  console.log('3️⃣ Création des index...')

  const indexes = [
    'CREATE INDEX idx_aeo_timestamp ON aeo_tracking(timestamp DESC);',
    'CREATE INDEX idx_aeo_engine ON aeo_tracking(engine_name) WHERE engine_name IS NOT NULL;',
    'CREATE INDEX idx_aeo_source_type ON aeo_tracking(source_type);',
    'CREATE INDEX idx_aeo_page_path ON aeo_tracking(page_path);'
  ]

  for (const index of indexes) {
    const { error } = await supabase.rpc('exec_sql', { query: index })
    if (error && !error.message.includes('already exists')) {
      console.log(`   ⚠️  ${error.message}`)
    }
  }
  console.log('   ✅ Index créés!\n')

  // 4. Activer RLS mais autoriser tout pour le service role
  console.log('4️⃣ Configuration des permissions...')
  const { error: rlsError } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE aeo_tracking ENABLE ROW LEVEL SECURITY;'
  })

  if (rlsError) {
    console.log(`   ⚠️  ${rlsError.message}`)
  }

  // Politique: service_role peut tout faire
  const { error: policyError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE POLICY "Service role full access" ON aeo_tracking
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    `
  })

  if (policyError && !policyError.message.includes('already exists')) {
    console.log(`   ⚠️  ${policyError.message}`)
  }

  // Politique: anon peut insérer
  const { error: anonPolicy } = await supabase.rpc('exec_sql', {
    query: `
      CREATE POLICY "Anon can insert" ON aeo_tracking
        FOR INSERT
        TO anon
        WITH CHECK (true);
    `
  })

  if (anonPolicy && !anonPolicy.message.includes('already exists')) {
    console.log(`   ⚠️  ${anonPolicy.message}`)
  }

  console.log('   ✅ Permissions configurées!\n')

  // 5. Insérer des données de test
  console.log('5️⃣ Insertion de données de test...')

  const testData = [
    {
      source_type: 'crawler',
      engine_name: 'ChatGPT',
      user_agent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0',
      referrer: '',
      page_path: '/test/crawler/chatgpt',
      metadata: { test: true }
    },
    {
      source_type: 'crawler',
      engine_name: 'Claude',
      user_agent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0',
      referrer: '',
      page_path: '/test/crawler/claude',
      metadata: { test: true }
    },
    {
      source_type: 'referral',
      engine_name: 'ChatGPT',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      referrer: 'https://chat.openai.com/',
      page_path: '/test/referral/chatgpt',
      bounce: false,
      pages_viewed: 3,
      session_duration: 245,
      metadata: { test: true }
    },
    {
      source_type: 'referral',
      engine_name: 'Claude',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      referrer: 'https://claude.ai/chat/',
      page_path: '/test/referral/claude',
      bounce: false,
      pages_viewed: 5,
      session_duration: 420,
      metadata: { test: true }
    }
  ]

  const { error: insertError } = await supabase
    .from('aeo_tracking')
    .insert(testData)

  if (insertError) {
    console.error('   ❌ Erreur insertion:', insertError.message)
  } else {
    console.log(`   ✅ ${testData.length} données de test insérées!\n`)
  }

  // 6. Vérification finale
  console.log('6️⃣ Vérification finale...')

  const { data, error, count } = await supabase
    .from('aeo_tracking')
    .select('*', { count: 'exact' })

  if (error) {
    console.error('   ❌ Erreur:', error.message)
    return false
  }

  console.log(`   ✅ Table opérationnelle avec ${count} enregistrements!\n`)

  if (data && data.length > 0) {
    console.log('📊 Données de test:')
    data.forEach(row => {
      console.log(`   ${row.engine_name} (${row.source_type}) → ${row.page_path}`)
    })
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ TABLE AEO_TRACKING CRÉÉE AVEC SUCCÈS!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('🚀 Le middleware va maintenant tracker automatiquement!\n')

  return true
}

createTable().catch(error => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})
