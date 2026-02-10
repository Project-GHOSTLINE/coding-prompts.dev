#!/usr/bin/env node

/**
 * 🧪 ADMIN ROUTES COMPREHENSIVE TESTING SCRIPT
 *
 * Tests ALL admin menu routes with authentication, screenshots, and detailed reporting
 * - Full login flow with credentials
 * - All menu sections and subsections
 * - 404 detection and error handling
 * - Screenshot capture for each route
 * - Comprehensive JSON report generation
 *
 * Usage: node test-admin-routes-complete.mjs
 */

import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  credentials: {
    email: 'admin@coding-prompts.dev',
    password: 'FredRosa%1978'
  },
  screenshotDir: './qa-screenshots/admin-routes',
  timeout: 30000,
  waitBetweenTests: 1000
}

// All admin routes from navigation config
const ADMIN_ROUTES = [
  // Vue d'ensemble
  { section: 'Vue d\'ensemble', name: 'Dashboard Principal', url: '/admin/dashboard' },
  { section: 'Vue d\'ensemble', name: 'Statistiques Rapides', url: '/admin/dashboard#quick-stats' },

  // SEO Performance
  { section: 'SEO Performance', name: 'Vue d\'ensemble SEO', url: '/admin/dashboard#seo' },
  { section: 'SEO Performance', name: 'Top Keywords', url: '/admin/dashboard#keywords' },
  { section: 'SEO Performance', name: 'Opportunités', url: '/admin/dashboard#opportunities' },
  { section: 'SEO Performance', name: 'Par Appareil', url: '/admin/dashboard#devices' },

  // Trafic AI
  { section: 'Trafic AI', name: 'Moteurs AI', url: '/admin/dashboard#ai-engines' },
  { section: 'Trafic AI', name: 'Tendances', url: '/admin/dashboard#ai-trends' },
  { section: 'Trafic AI', name: 'Pages Référées', url: '/admin/dashboard#ai-landing' },
  { section: 'Trafic AI', name: 'Ratio AI/Organic', url: '/admin/dashboard#ai-ratio' },

  // Performance Contenu
  { section: 'Performance Contenu', name: 'AI vs Organic', url: '/admin/dashboard#content-comparison' },
  { section: 'Performance Contenu', name: 'Top Pages AI', url: '/admin/dashboard#top-pages-ai' },
  { section: 'Performance Contenu', name: 'Top Pages Organic', url: '/admin/dashboard#top-pages-organic' },
  { section: 'Performance Contenu', name: 'Métriques Engagement', url: '/admin/dashboard#engagement' },

  // Tests AEO
  { section: 'Tests AEO', name: 'Citations AI', url: '/admin/dashboard#aeo-tests' },

  // Configuration
  { section: 'Configuration', name: 'Paramètres', url: '/admin/settings' },
  { section: 'Configuration', name: 'Configuration API', url: '/admin/api-config' }
]

// Test results container
const testResults = {
  summary: {
    totalRoutes: ADMIN_ROUTES.length,
    passed: 0,
    failed: 0,
    warnings: 0,
    testDuration: 0,
    timestamp: new Date().toISOString()
  },
  routes: [],
  authentication: {
    success: false,
    duration: 0,
    errors: []
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('\n🧪 STARTING COMPREHENSIVE ADMIN ROUTES TESTING\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const startTime = Date.now()

  // Create screenshot directory
  mkdirSync(CONFIG.screenshotDir, { recursive: true })

  // Launch browser
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  })

  const page = await context.newPage()

  // Set default timeout
  page.setDefaultTimeout(CONFIG.timeout)

  try {
    // Step 1: Authenticate
    console.log('🔐 STEP 1: AUTHENTICATION')
    console.log('─────────────────────────────────────────────────')
    const authSuccess = await authenticate(page)

    if (!authSuccess) {
      console.error('❌ Authentication failed. Aborting tests.')
      testResults.authentication.success = false
      await browser.close()
      generateReport()
      process.exit(1)
    }

    console.log('✅ Authentication successful\n')
    testResults.authentication.success = true

    // Step 2: Test all routes
    console.log('🧭 STEP 2: TESTING ALL ROUTES')
    console.log('─────────────────────────────────────────────────')

    for (let i = 0; i < ADMIN_ROUTES.length; i++) {
      const route = ADMIN_ROUTES[i]
      console.log(`\n[${i + 1}/${ADMIN_ROUTES.length}] Testing: ${route.section} → ${route.name}`)

      await testRoute(page, route)

      // Wait between tests
      await page.waitForTimeout(CONFIG.waitBetweenTests)
    }

    // Step 3: Generate report
    const endTime = Date.now()
    testResults.summary.testDuration = (endTime - startTime) / 1000

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 TEST SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Total Routes: ${testResults.summary.totalRoutes}`)
    console.log(`✅ Passed: ${testResults.summary.passed}`)
    console.log(`❌ Failed: ${testResults.summary.failed}`)
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`)
    console.log(`Duration: ${testResults.summary.testDuration.toFixed(2)}s`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    generateReport()

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message)
    testResults.summary.failed++
  } finally {
    await browser.close()
  }
}

/**
 * Authenticate user
 */
async function authenticate(page) {
  const authStart = Date.now()

  try {
    console.log(`Navigating to: ${CONFIG.baseUrl}/admin/login`)
    await page.goto(`${CONFIG.baseUrl}/admin/login`, { waitUntil: 'networkidle' })

    // Take login page screenshot
    await page.screenshot({
      path: join(CONFIG.screenshotDir, '00-login-page.png'),
      fullPage: true
    })

    // Fill login form
    console.log('Filling login credentials...')
    await page.fill('input[type="email"]', CONFIG.credentials.email)
    await page.fill('input[type="password"]', CONFIG.credentials.password)

    // Take screenshot before submit
    await page.screenshot({
      path: join(CONFIG.screenshotDir, '01-login-filled.png'),
      fullPage: true
    })

    // Submit form
    console.log('Submitting login form...')
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 15000 })

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Verify dashboard loaded - check for any of these indicators
    try {
      await page.waitForSelector('h1:has-text("Dashboard AEO"), h1:has-text("Dashboard"), text=Dashboard AEO', { timeout: 10000 })
      console.log('Dashboard page detected')
    } catch (error) {
      // If title not found, check if we're at least on the dashboard URL
      const currentUrl = page.url()
      if (!currentUrl.includes('/admin/dashboard')) {
        throw new Error('Dashboard not loaded after login - URL check failed')
      }
      console.log('Dashboard URL reached (title check skipped)')
    }

    // Take authenticated dashboard screenshot
    await page.screenshot({
      path: join(CONFIG.screenshotDir, '02-authenticated-dashboard.png'),
      fullPage: true
    })

    const authEnd = Date.now()
    testResults.authentication.duration = (authEnd - authStart) / 1000

    return true

  } catch (error) {
    console.error('Authentication error:', error.message)
    testResults.authentication.errors.push(error.message)

    await page.screenshot({
      path: join(CONFIG.screenshotDir, '00-auth-error.png'),
      fullPage: true
    })

    return false
  }
}

/**
 * Test individual route
 */
async function testRoute(page, route) {
  const routeTest = {
    section: route.section,
    name: route.name,
    url: route.url,
    status: 'unknown',
    statusCode: null,
    loadTime: 0,
    errors: [],
    warnings: [],
    screenshot: null,
    timestamp: new Date().toISOString()
  }

  const startTime = Date.now()

  try {
    const fullUrl = route.url.startsWith('http') ? route.url : `${CONFIG.baseUrl}${route.url}`

    console.log(`  URL: ${fullUrl}`)

    // Navigate to route
    const response = await page.goto(fullUrl, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout
    })

    routeTest.statusCode = response?.status() || null

    // Check for 404
    if (routeTest.statusCode === 404) {
      routeTest.status = 'failed'
      routeTest.errors.push('404 Not Found')
      console.log('  ❌ Status: 404 NOT FOUND')
      testResults.summary.failed++

    } else if (routeTest.statusCode >= 500) {
      routeTest.status = 'failed'
      routeTest.errors.push(`Server error: ${routeTest.statusCode}`)
      console.log(`  ❌ Status: ${routeTest.statusCode} SERVER ERROR`)
      testResults.summary.failed++

    } else if (routeTest.statusCode >= 400) {
      routeTest.status = 'warning'
      routeTest.warnings.push(`Client error: ${routeTest.statusCode}`)
      console.log(`  ⚠️  Status: ${routeTest.statusCode} CLIENT ERROR`)
      testResults.summary.warnings++

    } else {
      routeTest.status = 'passed'
      console.log(`  ✅ Status: ${routeTest.statusCode} OK`)
      testResults.summary.passed++
    }

    // Wait for page to stabilize
    await page.waitForTimeout(500)

    // Check for console errors
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Check for authentication redirect
    const currentUrl = page.url()
    if (currentUrl.includes('/admin/login') && !route.url.includes('/admin/login')) {
      routeTest.status = 'failed'
      routeTest.errors.push('Authentication required - redirected to login')
      console.log('  ❌ Redirected to login (auth failure)')
      testResults.summary.failed++
    }

    // Check for specific content based on route
    await performContentValidation(page, route, routeTest)

    // Take screenshot
    const screenshotName = `route-${String(testResults.routes.length + 1).padStart(2, '0')}-${sanitizeFilename(route.name)}.png`
    const screenshotPath = join(CONFIG.screenshotDir, screenshotName)

    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    })

    routeTest.screenshot = screenshotName
    console.log(`  📸 Screenshot: ${screenshotName}`)

    // Add console errors if any
    if (consoleErrors.length > 0) {
      routeTest.warnings.push(`${consoleErrors.length} console errors detected`)
      console.log(`  ⚠️  Console errors: ${consoleErrors.length}`)
    }

  } catch (error) {
    routeTest.status = 'failed'
    routeTest.errors.push(error.message)
    console.log(`  ❌ Error: ${error.message}`)
    testResults.summary.failed++

    // Take error screenshot
    try {
      const errorScreenshot = `error-${String(testResults.routes.length + 1).padStart(2, '0')}-${sanitizeFilename(route.name)}.png`
      await page.screenshot({
        path: join(CONFIG.screenshotDir, errorScreenshot),
        fullPage: true
      })
      routeTest.screenshot = errorScreenshot
    } catch (screenshotError) {
      console.error('  Failed to capture error screenshot:', screenshotError.message)
    }
  }

  const endTime = Date.now()
  routeTest.loadTime = (endTime - startTime) / 1000
  console.log(`  ⏱️  Load time: ${routeTest.loadTime.toFixed(2)}s`)

  testResults.routes.push(routeTest)
}

/**
 * Perform content validation based on route
 */
async function performContentValidation(page, route, routeTest) {
  try {
    // Dashboard-specific validations
    if (route.url.includes('/admin/dashboard')) {
      const dashboardTitle = await page.locator('h1').filter({ hasText: 'Dashboard AEO' }).isVisible()
      if (!dashboardTitle) {
        routeTest.warnings.push('Dashboard title not found')
        console.log('  ⚠️  Dashboard title missing')
      }

      // Check for sidebar
      const sidebar = await page.locator('aside').isVisible()
      if (!sidebar) {
        routeTest.warnings.push('Sidebar not visible')
        console.log('  ⚠️  Sidebar not visible')
      }
    }

    // Settings page validation
    if (route.url.includes('/admin/settings')) {
      const hasSettings = await page.locator('text=Paramètres').isVisible({ timeout: 5000 }).catch(() => false)
      if (!hasSettings) {
        routeTest.warnings.push('Settings content not found')
        console.log('  ⚠️  Settings content missing')
      }
    }

    // API config validation
    if (route.url.includes('/admin/api-config')) {
      const hasApiConfig = await page.locator('text=Configuration API').isVisible({ timeout: 5000 }).catch(() => false)
      if (!hasApiConfig) {
        routeTest.warnings.push('API config content not found')
        console.log('  ⚠️  API config content missing')
      }
    }

    // Markdown file validation
    if (route.url.endsWith('.md')) {
      const hasContent = await page.locator('body').textContent()
      if (!hasContent || hasContent.length < 100) {
        routeTest.warnings.push('Markdown content appears empty or too short')
        console.log('  ⚠️  Markdown content might be missing')
      }
    }

  } catch (error) {
    routeTest.warnings.push(`Content validation error: ${error.message}`)
    console.log(`  ⚠️  Content validation failed: ${error.message}`)
  }
}

/**
 * Generate JSON and HTML reports
 */
function generateReport() {
  // JSON Report
  const jsonReport = JSON.stringify(testResults, null, 2)
  const jsonPath = './ADMIN-ROUTES-TEST-REPORT.json'
  writeFileSync(jsonPath, jsonReport)
  console.log(`\n📄 JSON Report: ${jsonPath}`)

  // Markdown Report
  const mdReport = generateMarkdownReport()
  const mdPath = './ADMIN-ROUTES-TEST-REPORT.md'
  writeFileSync(mdPath, mdReport)
  console.log(`📄 Markdown Report: ${mdPath}`)
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport() {
  const passRate = ((testResults.summary.passed / testResults.summary.totalRoutes) * 100).toFixed(1)
  const status = passRate >= 90 ? '🟢 EXCELLENT' : passRate >= 70 ? '🟡 GOOD' : '🔴 NEEDS ATTENTION'

  let md = `# 🧪 Admin Routes Comprehensive Test Report

**Test Date**: ${new Date(testResults.summary.timestamp).toLocaleString('fr-FR')}
**Duration**: ${testResults.summary.testDuration.toFixed(2)}s
**Overall Status**: ${status} (${passRate}% pass rate)

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Routes | ${testResults.summary.totalRoutes} |
| ✅ Passed | ${testResults.summary.passed} |
| ❌ Failed | ${testResults.summary.failed} |
| ⚠️ Warnings | ${testResults.summary.warnings} |
| Pass Rate | ${passRate}% |

## 🔐 Authentication

- **Status**: ${testResults.authentication.success ? '✅ Success' : '❌ Failed'}
- **Duration**: ${testResults.authentication.duration.toFixed(2)}s
${testResults.authentication.errors.length > 0 ? `- **Errors**: ${testResults.authentication.errors.join(', ')}` : ''}

## 🧭 Route Test Results

### By Section

`

  // Group routes by section
  const routesBySection = {}
  testResults.routes.forEach(route => {
    if (!routesBySection[route.section]) {
      routesBySection[route.section] = []
    }
    routesBySection[route.section].push(route)
  })

  // Generate section reports
  Object.entries(routesBySection).forEach(([section, routes]) => {
    const sectionPassed = routes.filter(r => r.status === 'passed').length
    const sectionTotal = routes.length
    const sectionStatus = sectionPassed === sectionTotal ? '✅' : sectionPassed > 0 ? '⚠️' : '❌'

    md += `\n#### ${sectionStatus} ${section} (${sectionPassed}/${sectionTotal})\n\n`

    routes.forEach(route => {
      const statusIcon = route.status === 'passed' ? '✅' : route.status === 'warning' ? '⚠️' : '❌'
      md += `- ${statusIcon} **${route.name}**\n`
      md += `  - URL: \`${route.url}\`\n`
      md += `  - Status Code: ${route.statusCode || 'N/A'}\n`
      md += `  - Load Time: ${route.loadTime.toFixed(2)}s\n`

      if (route.screenshot) {
        md += `  - Screenshot: \`${route.screenshot}\`\n`
      }

      if (route.errors.length > 0) {
        md += `  - ❌ Errors:\n`
        route.errors.forEach(err => {
          md += `    - ${err}\n`
        })
      }

      if (route.warnings.length > 0) {
        md += `  - ⚠️ Warnings:\n`
        route.warnings.forEach(warn => {
          md += `    - ${warn}\n`
        })
      }

      md += '\n'
    })
  })

  // Failed routes summary
  const failedRoutes = testResults.routes.filter(r => r.status === 'failed')
  if (failedRoutes.length > 0) {
    md += `\n## ❌ Failed Routes (${failedRoutes.length})\n\n`
    failedRoutes.forEach(route => {
      md += `### ${route.name}\n`
      md += `- **Section**: ${route.section}\n`
      md += `- **URL**: \`${route.url}\`\n`
      md += `- **Status Code**: ${route.statusCode || 'N/A'}\n`
      md += `- **Errors**:\n`
      route.errors.forEach(err => {
        md += `  - ${err}\n`
      })
      md += '\n'
    })
  }

  // Recommendations
  md += `\n## 🎯 Recommendations\n\n`

  if (failedRoutes.length > 0) {
    md += `### Critical Issues\n`
    md += `- ${failedRoutes.length} route(s) failed and require immediate attention\n`
    md += `- Review 404 errors and ensure routes are properly configured\n`
    md += `- Check authentication flow for redirected routes\n\n`
  }

  const warningRoutes = testResults.routes.filter(r => r.warnings.length > 0)
  if (warningRoutes.length > 0) {
    md += `### Warnings\n`
    md += `- ${warningRoutes.length} route(s) have warnings\n`
    md += `- Review console errors and content validation issues\n`
    md += `- Ensure all expected content is visible on pages\n\n`
  }

  if (passRate === 100) {
    md += `### ✅ Perfect Score!\n`
    md += `All routes are working perfectly. Great job!\n\n`
  }

  md += `\n## 📸 Screenshots\n\n`
  md += `All screenshots are saved in: \`${CONFIG.screenshotDir}/\`\n\n`

  md += `---\n`
  md += `*Generated by Playwright Admin Routes Tester*\n`
  md += `*Test execution completed at ${new Date().toLocaleString('fr-FR')}*\n`

  return md
}

/**
 * Sanitize filename
 */
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Execute tests
 */
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
