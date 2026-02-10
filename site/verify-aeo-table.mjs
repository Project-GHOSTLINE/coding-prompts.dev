#!/usr/bin/env node
/**
 * Vérifier si la table AEO existe dans Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Vérification de la table aeo_tracking...\n')

async function verify() {
  try {
    // Essayer de compter les enregistrements
    const { data, error, count } = await supabase
      .from('aeo_tracking')
      .select('*', { count: 'exact', head: true })

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('❌ La table aeo_tracking n\'existe pas encore\n')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('📋 INSTRUCTIONS POUR CRÉER LA TABLE:')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        console.log('1. Ouvre le Supabase Dashboard:')
        console.log('   https://supabase.com/dashboard/project/dllyzfuqjzuhvshrlmuq\n')
        console.log('2. Va dans "SQL Editor" (sidebar gauche)\n')
        console.log('3. Clique sur "New Query"\n')
        console.log('4. Copie-colle TOUT le contenu de:')
        console.log('   📁 site/supabase-aeo-schema.sql\n')
        console.log('5. Clique sur "Run" (Cmd/Ctrl + Enter)\n')
        console.log('6. Vérifie qu\'il n\'y a pas d\'erreurs\n')
        console.log('7. Relance ce script: node verify-aeo-table.mjs\n')
        return false
      }

      throw error
    }

    console.log('✅ La table aeo_tracking existe!')
    console.log(`   📊 ${count || 0} enregistrements\n`)

    // Tester les vues
    const { data: viewData, error: viewError } = await supabase
      .from('aeo_by_engine')
      .select('*')
      .limit(5)

    if (viewError) {
      console.log('⚠️  La vue aeo_by_engine n\'existe pas')
    } else {
      console.log(`✅ Vue aeo_by_engine: ${viewData.length} engines détectés`)
      if (viewData.length > 0) {
        viewData.forEach(row => {
          console.log(`   ${row.engine_name}: ${row.total_visits} visites`)
        })
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ SETUP AEO TABLE: COMPLET')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('Prochaine étape: Créer le middleware de tracking\n')

    return true

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    return false
  }
}

verify()
