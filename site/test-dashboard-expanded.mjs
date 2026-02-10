#!/usr/bin/env node

/**
 * Test Dashboard with AEO Section Expanded
 */

import { chromium } from 'playwright'

const baseUrl = 'http://localhost:3003'

console.log('\n🧪 TESTING DASHBOARD AEO SECTION (EXPANDED)\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const browser = await chromium.launch({ headless: false, slowMo: 500 })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await context.newPage()

try {
  // Login
  console.log('🔐 Logging in...')
  await page.goto(`${baseUrl}/admin/login`)
  await page.fill('input[type="email"]', 'admin@coding-prompts.dev')
  await page.fill('input[type="password"]', 'FredRosa%1978')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
  console.log('   ✅ Logged in\n')

  // Wait for dashboard to load
  await page.waitForTimeout(2000)

  // Take initial screenshot
  await page.screenshot({ path: 'dashboard-1-closed.png', fullPage: true })
  console.log('📸 Screenshot 1: dashboard-1-closed.png\n')

  // Find and click on AEO Tracking Dashboard section
  console.log('🎯 Looking for AEO Tracking Dashboard...')

  const aeoSection = await page.locator('text=AEO Tracking Dashboard').first()
  if (await aeoSection.isVisible()) {
    console.log('   ✅ Found AEO section\n')

    // Click to expand
    console.log('📂 Expanding AEO section...')
    await aeoSection.click()
    await page.waitForTimeout(1000)

    await page.screenshot({ path: 'dashboard-2-expanded.png', fullPage: true })
    console.log('📸 Screenshot 2: dashboard-2-expanded.png\n')

    // Check what's visible inside
    console.log('🔍 Checking visible AEO metrics...')

    const metrics = await page.evaluate(() => {
      const results = []

      // Look for metric values
      const numberElements = document.querySelectorAll('.text-3xl, .text-2xl, .text-4xl')
      numberElements.forEach(el => {
        const text = el.textContent?.trim()
        if (text && /^\d+$/.test(text)) {
          results.push({
            value: text,
            context: el.parentElement?.textContent?.substring(0, 50)
          })
        }
      })

      return results
    })

    console.log('   Found metrics:')
    metrics.forEach(m => {
      console.log(`      - ${m.value}`)
    })

    // Look specifically for AEO numbers
    const aeoNumbers = await page.evaluate(() => {
      const text = document.body.innerText
      const lines = text.split('\n')
      return lines.filter(line =>
        line.includes('AI Visits') ||
        line.includes('Crawlers') ||
        line.includes('Referrals') ||
        line.includes('Engines')
      ).slice(0, 10)
    })

    console.log('\n   AEO-related text:')
    aeoNumbers.forEach(line => {
      console.log(`      ${line}`)
    })

  } else {
    console.log('   ❌ AEO section not found')
  }

  await page.waitForTimeout(2000)

} catch (error) {
  console.error('\n❌ Error:', error.message)
  await page.screenshot({ path: 'dashboard-error.png', fullPage: true })
} finally {
  await browser.close()
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('✅ Test Complete\n')
