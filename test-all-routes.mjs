#!/usr/bin/env node
/**
 * Test complet de toutes les routes et APIs
 * Vérifie qu'il n'y a aucune erreur 401, 403, 404, 405, etc.
 */

const BASE_URL = 'http://localhost:3000'

// Codes HTTP à vérifier
const ERROR_CODES = [400, 401, 403, 404, 405, 500, 502, 503]

// Toutes les routes pages (publiques)
const PUBLIC_ROUTES = [
  '/',
  '/features',
  '/features/sequential-thinking',
  '/setup',
  '/setup/installation',
  '/setup/router',
  '/setup/statusline',
  '/troubleshooting',
  '/troubleshooting/5-hour-limit',
  '/troubleshooting/dangerously-skip-permissions',
  '/troubleshooting/exit-code-1',
  '/vs',
  '/vs/cursor',
]

// Routes admin (nécessitent auth)
const ADMIN_ROUTES = [
  '/admin/login',
  '/admin/dashboard',
]

// API routes (publiques)
const PUBLIC_API_ROUTES = [
  '/api/track-ai-visit',
]

// API routes admin (nécessitent auth)
const ADMIN_API_ROUTES = [
  '/api/admin/login',
  '/api/admin/logout',
  '/api/admin/stats',
  '/api/admin/aeo-test',
]

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
}

async function testRoute(path, expectedStatus = 200, method = 'GET', auth = false) {
  results.total++

  try {
    const options = {
      method,
      headers: {
        'User-Agent': 'Test-Script/1.0',
      },
    }

    if (auth && global.authCookie) {
      options.headers['Cookie'] = global.authCookie
    }

    const response = await fetch(`${BASE_URL}${path}`, options)
    const status = response.status

    // Vérifier si c'est une erreur
    const isError = ERROR_CODES.includes(status)

    // Pour les routes admin sans auth, 401 ou redirect est OK
    if (!auth && path.includes('/admin') && (status === 401 || status === 302 || status === 307)) {
      console.log(`✅ ${method} ${path} → ${status} (Auth required - OK)`)
      results.passed++
      return { path, status, ok: true, message: 'Auth required' }
    }

    // Pour les autres, vérifier le status
    if (status === expectedStatus || (status >= 200 && status < 300)) {
      console.log(`✅ ${method} ${path} → ${status}`)
      results.passed++
      return { path, status, ok: true }
    } else if (isError) {
      console.log(`❌ ${method} ${path} → ${status} ERROR`)
      results.failed++
      results.errors.push({ path, method, status, message: `HTTP ${status}` })
      return { path, status, ok: false, error: `HTTP ${status}` }
    } else {
      console.log(`⚠️  ${method} ${path} → ${status} (unexpected)`)
      results.warnings.push({ path, method, status })
      results.passed++ // Count as pass but warn
      return { path, status, ok: true, warning: true }
    }
  } catch (error) {
    console.log(`❌ ${method} ${path} → FETCH ERROR: ${error.message}`)
    results.failed++
    results.errors.push({ path, method, error: error.message })
    return { path, ok: false, error: error.message }
  }
}

async function login() {
  console.log('\n🔐 Tentative de connexion admin...')

  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@coding-prompts.dev',
        password: 'FredRosa%1978',
      }),
    })

    if (response.ok) {
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        global.authCookie = setCookie.split(';')[0]
        console.log('✅ Connexion admin réussie\n')
        return true
      }
    }

    console.log('⚠️  Connexion admin échouée - Tests admin seront limités\n')
    return false
  } catch (error) {
    console.log(`❌ Erreur connexion: ${error.message}\n`)
    return false
  }
}

async function runTests() {
  console.log('🚀 TEST DE TOUTES LES ROUTES - coding-prompts.dev')
  console.log('=' .repeat(70))
  console.log(`Base URL: ${BASE_URL}`)
  console.log('=' .repeat(70))
  console.log('')

  // Vérifier que le serveur est démarré
  try {
    await fetch(BASE_URL)
  } catch (error) {
    console.log('❌ ERREUR: Le serveur n\'est pas démarré!')
    console.log('   Lancer avec: cd site && npm run dev')
    process.exit(1)
  }

  console.log('📄 TEST DES ROUTES PUBLIQUES')
  console.log('-'.repeat(70))
  for (const route of PUBLIC_ROUTES) {
    await testRoute(route)
  }

  console.log('\n🔒 TEST DES ROUTES ADMIN (sans auth)')
  console.log('-'.repeat(70))
  for (const route of ADMIN_ROUTES) {
    await testRoute(route)
  }

  console.log('\n🔌 TEST DES API PUBLIQUES')
  console.log('-'.repeat(70))
  for (const route of PUBLIC_API_ROUTES) {
    await testRoute(route, 200, 'POST') // Track AI visit expects POST
  }

  console.log('\n🔐 TEST DES API ADMIN (sans auth)')
  console.log('-'.repeat(70))
  for (const route of ADMIN_API_ROUTES) {
    if (route === '/api/admin/login') continue // Déjà testé
    await testRoute(route, 401, 'GET') // Should return 401 without auth
  }

  // Tenter de se connecter
  const authenticated = await login()

  if (authenticated) {
    console.log('🔒 TEST DES ROUTES ADMIN (avec auth)')
    console.log('-'.repeat(70))
    for (const route of ADMIN_ROUTES) {
      await testRoute(route, 200, 'GET', true)
    }

    console.log('\n🔌 TEST DES API ADMIN (avec auth)')
    console.log('-'.repeat(70))
    for (const route of ADMIN_API_ROUTES) {
      if (route === '/api/admin/login') continue
      await testRoute(route, 200, 'GET', true)
    }
  }

  // Rapport final
  console.log('\n' + '='.repeat(70))
  console.log('📊 RAPPORT FINAL')
  console.log('='.repeat(70))
  console.log(`Total tests: ${results.total}`)
  console.log(`✅ Réussis: ${results.passed}`)
  console.log(`❌ Échecs: ${results.failed}`)
  console.log(`⚠️  Avertissements: ${results.warnings.length}`)
  console.log('')

  if (results.errors.length > 0) {
    console.log('❌ ERREURS TROUVÉES:')
    results.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.method} ${err.path}`)
      console.log(`      → ${err.error || `HTTP ${err.status}`}`)
    })
    console.log('')
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  AVERTISSEMENTS:')
    results.warnings.forEach((warn, i) => {
      console.log(`   ${i + 1}. ${warn.method} ${warn.path} → HTTP ${warn.status}`)
    })
    console.log('')
  }

  if (results.failed === 0 && results.errors.length === 0) {
    console.log('✅ TOUS LES TESTS SONT PASSÉS!')
    console.log('   Aucune erreur 401, 403, 404, 405, etc. détectée.')
    process.exit(0)
  } else {
    console.log('❌ DES ERREURS ONT ÉTÉ DÉTECTÉES!')
    console.log('   Vérifier les routes ci-dessus.')
    process.exit(1)
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
