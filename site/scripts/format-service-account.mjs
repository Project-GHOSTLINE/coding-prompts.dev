#!/usr/bin/env node

/**
 * Script pour formatter le fichier JSON du Service Account
 * pour l'utiliser comme variable d'environnement
 *
 * Usage:
 *   node scripts/format-service-account.mjs /path/to/service-account.json
 *
 * Output:
 *   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
 */

import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function formatServiceAccount(filePath) {
  try {
    // Lire le fichier JSON
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    // Parser pour valider le JSON
    const json = JSON.parse(fileContent)

    // Vérifier que c'est bien un Service Account
    if (json.type !== 'service_account') {
      console.error('❌ Erreur: Ce fichier ne semble pas être un Service Account Google')
      console.error('   Le champ "type" devrait être "service_account"')
      process.exit(1)
    }

    // Vérifier les champs requis
    const requiredFields = [
      'project_id',
      'private_key_id',
      'private_key',
      'client_email',
      'client_id'
    ]

    const missingFields = requiredFields.filter(field => !json[field])
    if (missingFields.length > 0) {
      console.error('❌ Erreur: Champs manquants dans le JSON:')
      missingFields.forEach(field => console.error(`   - ${field}`))
      process.exit(1)
    }

    // Convertir en une seule ligne (supprimer les sauts de ligne et espaces inutiles)
    const compactJson = JSON.stringify(json)

    console.log('✅ Service Account validé avec succès!\n')
    console.log('📋 Informations:')
    console.log(`   Project ID: ${json.project_id}`)
    console.log(`   Client Email: ${json.client_email}\n`)

    console.log('📝 Ajouter cette ligne dans votre .env.local:\n')
    console.log(`GOOGLE_SERVICE_ACCOUNT_JSON=${compactJson}\n`)

    console.log('📝 Pour Vercel, copier uniquement la valeur:\n')
    console.log(compactJson)
    console.log()

    // Sauvegarder dans un fichier temporaire pour faciliter le copier-coller
    const outputPath = path.join(__dirname, '..', '.service-account-formatted.txt')
    fs.writeFileSync(outputPath, `GOOGLE_SERVICE_ACCOUNT_JSON=${compactJson}`, 'utf-8')
    console.log(`💾 Sauvegardé dans: ${outputPath}`)
    console.log(`⚠️  ATTENTION: Supprimer ce fichier après utilisation!\n`)

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Erreur: Fichier introuvable: ${filePath}`)
    } else if (error instanceof SyntaxError) {
      console.error('❌ Erreur: Le fichier n\'est pas un JSON valide')
      console.error(`   ${error.message}`)
    } else {
      console.error('❌ Erreur:', error.message)
    }
    process.exit(1)
  }
}

// Vérifier les arguments
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('Usage: node scripts/format-service-account.mjs /path/to/service-account.json')
  console.log()
  console.log('Ce script formate le fichier JSON du Service Account Google')
  console.log('pour l\'utiliser comme variable d\'environnement.')
  console.log()
  console.log('Exemple:')
  console.log('  node scripts/format-service-account.mjs ~/Downloads/my-project-123456.json')
  process.exit(0)
}

const filePath = args[0]
formatServiceAccount(filePath)
