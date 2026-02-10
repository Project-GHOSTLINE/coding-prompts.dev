/**
 * Test Dashboard Data Rendering
 * Vérifie que les données API sont correctement affichées
 */

import { chromium } from 'playwright'

console.log('\n=== DASHBOARD RENDERING TEST ===\n')

async function test() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Listen for console logs
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    if (type === 'error' || text.includes('Error') || text.includes('stats')) {
      console.log(`   [Browser ${type}]:`, text)
    }
  })

  // Listen for API responses
  let apiData = null
  page.on('response', async response => {
    const url = response.url()
    if (url.includes('/api/admin/stats')) {
      console.log('\n📡 API Response:', response.status())
      if (response.ok()) {
        try {
          apiData = await response.json()
          console.log('   AEO in response:', {
            totalAIVisits: apiData?.aeo?.overview?.totalAIVisits,
            totalCrawlers: apiData?.aeo?.overview?.totalCrawlers,
            uniqueEngines: apiData?.aeo?.overview?.uniqueEngines
          })
        } catch (e) {
          console.log('   Could not parse response')
        }
      }
    }
  })

  try {
    console.log('1. Login...')
    await page.goto('http://localhost:3000/admin/login')
    await page.fill('input[type="email"]', 'admin@coding-prompts.dev')
    await page.fill('input[type="password"]', 'FredRosa%1978')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin/dashboard', { timeout: 5000 })
    console.log('   ✓ Logged in successfully')

    console.log('\n2. Waiting for data load...')
    await page.waitForTimeout(3000)

    console.log('\n3. Checking displayed values...')

    // Check if AEO section exists
    const aeoSectionExists = await page.locator('text=AEO Tracking').count() > 0
    console.log('   AEO Section exists:', aeoSectionExists)

    // Get the badge text
    const badgeText = await page.locator('text=/visites AI/').first().textContent()
    console.log('   Badge text:', badgeText)

    // Get the first metric value (Total Visites AI)
    const metricValue = await page.locator('.text-blue-600.text-lg').first().textContent()
    console.log('   Metric value displayed:', metricValue)

    // Check state in React DevTools (via evaluate)
    const reactState = await page.evaluate(() => {
      // Try to access React state if available
      try {
        const element = document.querySelector('[class*="CollapsibleSection"]')
        if (element) {
          return 'CollapsibleSection found'
        }
        return 'Not found'
      } catch (e) {
        return 'Error: ' + e.message
      }
    })
    console.log('   React state check:', reactState)

    console.log('\n4. Analysis:')
    console.log('   API returned:', apiData?.aeo?.overview?.totalAIVisits)
    console.log('   Page displays:', metricValue)

    if (metricValue === '0' && apiData?.aeo?.overview?.totalAIVisits > 0) {
      console.log('\n❌ PROBLEM CONFIRMED:')
      console.log('   - API returns correct data:', apiData.aeo.overview.totalAIVisits)
      console.log('   - Dashboard displays 0')
      console.log('   - Issue is in frontend state management or rendering')
    } else if (metricValue !== '0') {
      console.log('\n✅ Dashboard displays correct data!')
    } else {
      console.log('\n⚠️  Both API and dashboard show 0')
    }

    // Take screenshot
    await page.screenshot({
      path: 'dashboard-aeo-debug.png',
      fullPage: true
    })
    console.log('\n📸 Screenshot: dashboard-aeo-debug.png')

  } catch (error) {
    console.error('\n❌ Error:', error.message)

    await page.screenshot({ path: 'dashboard-error.png' })
    console.log('Error screenshot saved')
  } finally {
    await browser.close()
  }
}

test().catch(console.error)
