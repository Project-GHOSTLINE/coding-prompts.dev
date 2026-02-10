#!/usr/bin/env node

/**
 * Test Live API with Authentication
 */

import { chromium } from 'playwright'

const baseUrl = 'http://localhost:3003'

console.log('\n🧪 TESTING LIVE API /api/admin/stats\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const browser = await chromium.launch({ headless: false })
const context = await browser.newContext()
const page = await context.newPage()

try {
  // Step 1: Login
  console.log('🔐 Step 1: Authenticating...')
  await page.goto(`${baseUrl}/admin/login`)
  await page.fill('input[type="email"]', 'admin@coding-prompts.dev')
  await page.fill('input[type="password"]', 'FredRosa%1978')
  await page.click('button[type="submit"]')

  await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
  console.log('   ✅ Authenticated\n')

  // Step 2: Call API and inspect response
  console.log('📡 Step 2: Calling /api/admin/stats...')

  const apiResponse = await page.evaluate(async () => {
    const response = await fetch('/api/admin/stats')
    const data = await response.json()
    return { status: response.status, data }
  })

  console.log(`   Status: ${apiResponse.status}\n`)

  if (apiResponse.status === 200) {
    const aeo = apiResponse.data.aeo

    console.log('🔍 Step 3: AEO Data Analysis')
    console.log('─────────────────────────────────────────────────')

    if (!aeo) {
      console.log('   ❌ NO AEO KEY IN RESPONSE!')
    } else {
      console.log('   ✅ aeo key exists')
      console.log('\n   Overview:')
      console.log('      totalAIVisits:', aeo.overview?.totalAIVisits || 0)
      console.log('      totalCrawlers:', aeo.overview?.totalCrawlers || 0)
      console.log('      totalReferrals:', aeo.overview?.totalReferrals || 0)
      console.log('      uniqueEngines:', aeo.overview?.uniqueEngines || 0)

      console.log('\n   Arrays:')
      console.log('      byEngine:', aeo.byEngine?.length || 0, 'engines')
      console.log('      timeline:', aeo.timeline?.length || 0, 'days')
      console.log('      topPages:', aeo.topPages?.length || 0, 'pages')
      console.log('      crawlerActivity:', aeo.crawlerActivity?.length || 0, 'crawlers')

      if (aeo.byEngine && aeo.byEngine.length > 0) {
        console.log('\n   Engines Detail:')
        aeo.byEngine.forEach(e => {
          console.log(`      - ${e.engine}: ${e.totalVisits} visits (${e.crawlerVisits} crawlers, ${e.referralVisits} referrals)`)
        })
      }

      // Save to file
      const fs = await import('fs')
      fs.writeFileSync('live-api-aeo-response.json', JSON.stringify(aeo, null, 2))
      console.log('\n   📄 Full response saved to: live-api-aeo-response.json')

      if (aeo.overview?.totalAIVisits === 0) {
        console.log('\n   ❌ PROBLEM: totalAIVisits is 0')
        console.log('      Data exists in Supabase but API returns 0')
      } else {
        console.log('\n   ✅ SUCCESS: API returns correct data!')
      }
    }
  }

  // Step 4: Check what dashboard actually shows
  console.log('\n📊 Step 4: Checking Dashboard Display')
  console.log('─────────────────────────────────────────────────')

  await page.waitForTimeout(2000)

  // Look for AEO metrics in the dashboard
  const dashboardStats = await page.evaluate(() => {
    const stats = {
      found: [],
      notFound: []
    }

    // Try to find AEO total visits
    const totalVisitsEl = document.querySelector('[data-testid="aeo-total-visits"]')
    if (totalVisitsEl) {
      stats.found.push(`Total AI Visits: ${totalVisitsEl.textContent}`)
    } else {
      stats.notFound.push('Total AI Visits element')
    }

    // Check for any "0" text that might indicate the problem
    const allText = document.body.innerText
    const hasZeros = allText.includes('0 visites') || allText.includes('0 AI')

    return { ...stats, hasZeros, sample: allText.substring(0, 500) }
  })

  console.log('   Dashboard check:', dashboardStats.found.length > 0 ? '✅' : '⚠️')
  if (dashboardStats.found.length > 0) {
    console.log('   Found elements:', dashboardStats.found)
  }
  if (dashboardStats.notFound.length > 0) {
    console.log('   Missing elements:', dashboardStats.notFound)
  }

  await page.screenshot({ path: 'dashboard-aeo-check.png', fullPage: true })
  console.log('\n   📸 Screenshot saved: dashboard-aeo-check.png')

} catch (error) {
  console.error('\n❌ Error:', error.message)
} finally {
  await browser.close()
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('✅ Test Complete\n')
