import { chromium } from 'playwright';

const DASHBOARD_URL = 'https://coding-prompts.dev/admin';
const LOGIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@coding-prompts.dev';
const LOGIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-password-here';

async function testDashboard() {
  console.log('🚀 Starting Playwright test...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to dashboard
    console.log('📍 Step 1: Navigating to dashboard...');
    await page.goto(DASHBOARD_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded');

    // 2. Take screenshot of login page
    await page.screenshot({ path: '/Users/xunit/Desktop/Projets/coding-prompts.dev/site/login-page.png' });
    console.log('📸 Login page screenshot saved');

    // 3. Check current URL and page content
    const currentURL = page.url();
    const pageTitle = await page.title();
    console.log(`Current URL: ${currentURL}`);
    console.log(`Page title: ${pageTitle}`);

    // 4. Try to find login form with different selectors
    const emailInput = await page.locator('input[type="email"], input[id*="email"], input[name*="email"]').first();
    const emailCount = await emailInput.count();

    if (emailCount > 0) {
      console.log('\n📍 Step 2: Found login form, attempting login...');
      await emailInput.fill(LOGIN_EMAIL);

      // Try different password selectors
      const passwordInput = await page.locator('input[type="password"], input[id*="password"], input[name*="password"]').first();
      const passwordCount = await passwordInput.count();

      if (passwordCount > 0) {
        await passwordInput.fill(LOGIN_PASSWORD);

        // Find submit button
        const submitButton = await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
        await submitButton.click();

        // Wait for navigation or error
        await page.waitForTimeout(5000);
        console.log('✅ Login attempted');
      } else {
        console.log('⚠️  No password field found');
      }
    } else {
      console.log('⚠️  No email field found - might be authenticated already or different page structure');
    }

    // 3. Wait for dashboard to load
    console.log('\n📍 Step 3: Waiting for dashboard to load...');
    await page.waitForSelector('text=SEO Performance', { timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('✅ Dashboard loaded');

    // 4. Extract metrics
    console.log('\n📍 Step 4: Extracting metrics...\n');

    const metrics = await page.evaluate(() => {
      const data = {
        seoMetrics: [],
        trafficData: {},
        aiTests: [],
        fakeDataFound: []
      };

      // Check SEO Performance cards
      const statCards = document.querySelectorAll('.grid .bg-white.rounded-lg.shadow');
      statCards.forEach((card, idx) => {
        if (idx < 4) { // First 4 cards are SEO metrics
          const title = card.querySelector('.text-gray-600')?.textContent?.trim();
          const value = card.querySelector('.text-3xl')?.textContent?.trim();
          const change = card.querySelector('.text-sm.mt-2')?.textContent?.trim();

          data.seoMetrics.push({ title, value, change });

          // Check for fake data
          if (change && (change.includes('+12') || change.includes('+18%') || change.includes('+2') || change.includes('-0.3'))) {
            data.fakeDataFound.push(`SEO: ${title} has fake change: ${change}`);
          }
        }
      });

      // Check Traffic Overview
      const trafficSection = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Traffic Overview'));
      if (trafficSection) {
        const trafficCard = trafficSection.nextElementSibling;
        const pageViews = trafficCard?.querySelector('.text-3xl')?.textContent?.trim();
        const uniqueVisitors = trafficCard?.querySelectorAll('.text-3xl')[1]?.textContent?.trim();

        data.trafficData = { pageViews, uniqueVisitors };

        // Check for fake data
        if (pageViews && !pageViews.includes('N/A') && parseInt(pageViews.replace(/\D/g, '')) > 100) {
          data.fakeDataFound.push(`Traffic: Page Views shows fake number: ${pageViews}`);
        }
      }

      // Check AI Tests
      const aiSection = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('AI Citation Tests'));
      if (aiSection) {
        const aiCard = aiSection.nextElementSibling;
        const models = aiCard?.querySelectorAll('.font-medium.text-gray-900');
        const scores = aiCard?.querySelectorAll('.text-2xl.font-bold');

        models?.forEach((model, idx) => {
          data.aiTests.push({
            model: model.textContent?.trim(),
            score: scores[idx]?.textContent?.trim()
          });

          // Check for fake scores
          const scoreText = scores[idx]?.textContent?.trim();
          if (scoreText && scoreText.match(/[3-5]\/5/)) {
            data.fakeDataFound.push(`AI Tests: ${model.textContent?.trim()} has fake score: ${scoreText}`);
          }
        });
      }

      return data;
    });

    // 5. Display results
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DASHBOARD METRICS REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔍 SEO Performance (SEMrush):');
    metrics.seoMetrics.forEach(m => {
      const status = (m.value === 'N/A' || m.value === '0' || m.change?.includes('N/A') || m.change?.includes('No data')) ? '✅' : '❌';
      console.log(`  ${status} ${m.title}: ${m.value} (${m.change})`);
    });

    console.log('\n🔍 Traffic Overview:');
    const trafficStatus = (metrics.trafficData.pageViews === 'N/A' || metrics.trafficData.pageViews === '0') ? '✅' : '❌';
    console.log(`  ${trafficStatus} Page Views: ${metrics.trafficData.pageViews || 'Not found'}`);
    console.log(`  ${trafficStatus} Unique Visitors: ${metrics.trafficData.uniqueVisitors || 'Not found'}`);

    console.log('\n🔍 AI Citation Tests:');
    metrics.aiTests.forEach(test => {
      const status = test.score === 'N/A' ? '✅' : '❌';
      console.log(`  ${status} ${test.model}: ${test.score}`);
    });

    // 6. Check for fake data
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (metrics.fakeDataFound.length > 0) {
      console.log('❌ FAKE DATA DETECTED:');
      metrics.fakeDataFound.forEach(fake => console.log(`  ⚠️  ${fake}`));
      console.log('\n❌ TEST FAILED: Dashboard still shows fake data!');
    } else {
      console.log('✅ NO FAKE DATA DETECTED');
      console.log('✅ TEST PASSED: All metrics show N/A or real data only!');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 7. Take screenshot
    const screenshotPath = '/Users/xunit/Desktop/Projets/coding-prompts.dev/site/dashboard-test.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    await page.screenshot({ path: '/Users/xunit/Desktop/Projets/coding-prompts.dev/site/error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testDashboard().catch(console.error);
