/**
 * Test Browser Dashboard
 * Simule le comportement du navigateur pour débugger
 */

import puppeteer from 'puppeteer'

console.log('\n=== BROWSER DASHBOARD TEST ===\n')

async function testDashboard() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox']
  })

  try {
    const page = await browser.newPage()

    // Capture console logs
    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()
      if (type === 'error') {
        console.log('   [BROWSER ERROR]', text)
      } else if (text.includes('AEO') || text.includes('stats') || text.includes('fetch')) {
        console.log(`   [BROWSER ${type.toUpperCase()}]`, text)
      }
    })

    // Capture network requests
    page.on('response', async response => {
      const url = response.url()
      if (url.includes('/api/admin/stats')) {
        console.log('\n   📡 API Response:', response.status())
        try {
          const data = await response.json()
          console.log('   AEO Data:', {
            totalAIVisits: data.aeo?.overview?.totalAIVisits,
            totalCrawlers: data.aeo?.overview?.totalCrawlers,
            byEngine: data.aeo?.byEngine?.length
          })
        } catch (e) {
          console.log('   Could not parse JSON')
        }
      }
    })

    console.log('1. Navigating to login page...')
    await page.goto('http://localhost:3000/admin/login', {
      waitUntil: 'networkidle0'
    })

    console.log('2. Filling login form...')
    await page.type('input[type="email"]', 'admin@coding-prompts.dev')
    await page.type('input[type="password"]', 'FredRosa%1978')

    console.log('3. Submitting login...')
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]')
    ])

    console.log('4. Waiting for dashboard to load...')
    await page.waitForTimeout(3000)

    // Check current URL
    const currentUrl = page.url()
    console.log('   Current URL:', currentUrl)

    if (currentUrl.includes('/admin/dashboard')) {
      console.log('   ✓ Successfully redirected to dashboard')

      // Wait for data to load
      await page.waitForTimeout(2000)

      // Extract AEO values from page
      const aeoValues = await page.evaluate(() => {
        // Find the AEO section
        const badges = Array.from(document.querySelectorAll('div'))
        const aeoSection = badges.find(el => el.textContent?.includes('visites AI'))

        // Find all the metric cards
        const metrics = {
          totalAIVisits: document.querySelector('div.text-blue-600.text-lg')?.textContent,
          badges: aeoSection?.textContent
        }

        return metrics
      })

      console.log('\n5. AEO Values on Page:')
      console.log('   Total AI Visits (displayed):', aeoValues.totalAIVisits)
      console.log('   Badge text:', aeoValues.badges)

      if (aeoValues.totalAIVisits === '0' || aeoValues.badges?.includes('0 visites')) {
        console.log('\n❌ CONFIRMED: Dashboard displays 0 despite API returning correct data')
        console.log('   This is a frontend rendering issue')
      } else {
        console.log('\n✅ Dashboard displays correct data')
      }

      // Take screenshot
      await page.screenshot({
        path: '/Users/xunit/Desktop/Projets/coding-prompts.dev/site/dashboard-debug.png',
        fullPage: true
      })
      console.log('\n📸 Screenshot saved to dashboard-debug.png')

    } else {
      console.log('   ❌ Login failed, still on:', currentUrl)
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
  } finally {
    await browser.close()
  }
}

testDashboard().catch(console.error)

console.log('\n===================\n')
