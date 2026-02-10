#!/usr/bin/env node
/**
 * Setup AEO Tracking Table in Supabase (Version Simple)
 *
 * Exécute le SQL via l'interface web de Supabase
 * Ce script génère les commandes à copier-coller dans le SQL Editor
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 SETUP AEO TRACKING TABLE')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Lire le fichier SQL
const sqlPath = join(__dirname, 'supabase-aeo-schema.sql')
const sqlContent = readFileSync(sqlPath, 'utf-8')

console.log('📄 Contenu SQL chargé depuis:', sqlPath)
console.log('📊 Taille:', (sqlContent.length / 1024).toFixed(2), 'KB\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔧 INSTRUCTIONS:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('1. Ouvre le Supabase Dashboard:')
console.log('   https://supabase.com/dashboard/project/dllyzfuqjzuhvshrlmuq\n')

console.log('2. Va dans "SQL Editor" (dans la sidebar gauche)\n')

console.log('3. Clique sur "New Query"\n')

console.log('4. Copie-colle le contenu du fichier:\n')
console.log('   📁 site/supabase-aeo-schema.sql\n')

console.log('5. Clique sur "Run" (ou Cmd/Ctrl + Enter)\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✨ CE QUI SERA CRÉÉ:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('📊 Table: aeo_tracking')
console.log('   - Stocke toutes les visites AI (crawlers + referrals)')
console.log('   - 8 données de test incluses\n')

console.log('🔍 Index:')
console.log('   - idx_aeo_timestamp')
console.log('   - idx_aeo_engine')
console.log('   - idx_aeo_source_type')
console.log('   - idx_aeo_page_path')
console.log('   - idx_aeo_engine_timestamp')
console.log('   - idx_aeo_session_id\n')

console.log('📈 Vues:')
console.log('   - aeo_by_engine (stats par moteur)')
console.log('   - aeo_top_pages (top pages AI)')
console.log('   - aeo_daily_timeline (timeline quotidienne)\n')

console.log('⚙️  Fonction:')
console.log('   - calculate_aeo_score(page_path, days)')
console.log('     Calcule le score AEO d\'une page\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🧪 VÉRIFICATION:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('Après l\'exécution, teste ces queries:\n')

console.log('-- Voir toutes les visites')
console.log('SELECT * FROM aeo_tracking ORDER BY timestamp DESC;\n')

console.log('-- Stats par moteur')
console.log('SELECT * FROM aeo_by_engine;\n')

console.log('-- Top pages')
console.log('SELECT * FROM aeo_top_pages LIMIT 10;\n')

console.log('-- Score AEO de la homepage')
console.log('SELECT * FROM calculate_aeo_score(\'/\', 30);\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('✅ Prêt pour l\'exécution manuelle dans Supabase!\n')
