import { chromium } from 'playwright';

const testDashboardWithAuth = async () => {
  console.log('🔍 Starting Authenticated Dashboard QA Test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.toString());
  });

  // Capture network errors
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure().errorText
    });
  });

  try {
    // Step 1: Navigate to dashboard (should redirect to login)
    console.log('📍 Step 1: Navigating to dashboard...');
    await page.goto('http://localhost:3001/admin/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Take screenshot of login page
    await page.screenshot({
      path: 'dashboard-qa-01-login.png',
      fullPage: true
    });
    console.log('✅ Login page loaded\n');

    // Step 2: Fill in login form
    console.log('📍 Step 2: Filling login form...');
    await page.fill('input[type="email"], input[name="email"]', 'admin@coding-prompts.dev');
    await page.fill('input[type="password"], input[name="password"]', 'FredRosa%1978');

    await page.screenshot({
      path: 'dashboard-qa-02-form-filled.png',
      fullPage: true
    });
    console.log('✅ Form filled\n');

    // Step 3: Submit login
    console.log('📍 Step 3: Submitting login...');
    await page.click('button[type="submit"], button:has-text("Sign in")');

    // Wait for navigation to dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 }).catch(() => {
      console.log('⚠️  URL did not change to dashboard, checking current URL...');
    });

    await page.waitForTimeout(3000);

    // Take screenshot after login
    await page.screenshot({
      path: 'dashboard-qa-03-after-login.png',
      fullPage: true
    });

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/admin/dashboard')) {
      console.log('✅ Successfully navigated to dashboard\n');
    } else {
      console.log('⚠️  Still on login page - authentication may have failed\n');
    }

    // Step 4: Check dashboard content
    console.log('📍 Step 4: Checking dashboard content...\n');

    const dashboardAnalysis = await page.evaluate(() => {
      const results = {
        pageTitle: document.title,
        h1Text: document.querySelector('h1')?.textContent || 'No H1 found',
        sections: [],
        stats: [],
        charts: [],
        tables: [],
        visibleErrors: [],
        allText: document.body.textContent.substring(0, 500)
      };

      // Check for various dashboard elements
      const h2Elements = document.querySelectorAll('h2, h3');
      results.sections = Array.from(h2Elements).map(el => ({
        tag: el.tagName,
        text: el.textContent,
        visible: el.offsetParent !== null
      }));

      // Check for stat cards/numbers
      const statSelectors = ['[class*="stat"]', '[class*="metric"]', '[class*="count"]'];
      statSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          results.stats.push({
            selector,
            count: elements.length
          });
        }
      });

      // Check for charts
      const chartSelectors = ['canvas', 'svg', '[class*="chart"]'];
      chartSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          results.charts.push({
            selector,
            count: elements.length
          });
        }
      });

      // Check for tables
      const tables = document.querySelectorAll('table');
      results.tables = Array.from(tables).map((table, i) => ({
        index: i,
        rows: table.querySelectorAll('tr').length,
        visible: table.offsetParent !== null
      }));

      // Check for error messages
      const errorSelectors = [
        '[class*="error"]',
        '[role="alert"]',
        '[class*="alert-error"]',
        '[class*="text-red"]',
        '.error',
        '.alert-error'
      ];

      errorSelectors.forEach(selector => {
        const els = document.querySelectorAll(selector);
        if (els.length > 0) {
          Array.from(els).forEach(el => {
            const text = el.textContent.trim();
            if (text.toLowerCase().includes('error') || text.toLowerCase().includes('fail')) {
              results.visibleErrors.push({
                selector,
                text: text.substring(0, 100)
              });
            }
          });
        }
      });

      return results;
    });

    console.log('📊 Dashboard Content Analysis:');
    console.log(`  Page Title: ${dashboardAnalysis.pageTitle}`);
    console.log(`  Main Heading: ${dashboardAnalysis.h1Text}`);
    console.log(`  Sections Found: ${dashboardAnalysis.sections.length}`);

    if (dashboardAnalysis.sections.length > 0) {
      console.log('\n  Section Headings:');
      dashboardAnalysis.sections.forEach((section, i) => {
        console.log(`    ${i + 1}. ${section.text} (${section.visible ? 'visible' : 'hidden'})`);
      });
    }

    if (dashboardAnalysis.stats.length > 0) {
      console.log('\n  Stat Elements:');
      dashboardAnalysis.stats.forEach(stat => {
        console.log(`    - ${stat.selector}: ${stat.count} elements`);
      });
    }

    if (dashboardAnalysis.charts.length > 0) {
      console.log('\n  Chart Elements:');
      dashboardAnalysis.charts.forEach(chart => {
        console.log(`    - ${chart.selector}: ${chart.count} elements`);
      });
    }

    if (dashboardAnalysis.tables.length > 0) {
      console.log('\n  Tables:');
      dashboardAnalysis.tables.forEach(table => {
        console.log(`    - Table ${table.index}: ${table.rows} rows (${table.visible ? 'visible' : 'hidden'})`);
      });
    }

    console.log(`\n  Sample text: ${dashboardAnalysis.allText.substring(0, 200)}...`);

    // Step 5: Take final full screenshot
    console.log('\n📍 Step 5: Taking final screenshots...');
    await page.screenshot({
      path: 'dashboard-qa-04-final-full.png',
      fullPage: true
    });

    await page.screenshot({
      path: 'dashboard-qa-05-final-viewport.png',
      fullPage: false
    });

    console.log('✅ Screenshots saved\n');

    // Step 6: Report errors and warnings
    console.log('📝 Console Messages:');
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    const warningMessages = consoleMessages.filter(msg => msg.type === 'warning');

    if (errorMessages.length > 0) {
      console.log(`\n  ❌ ${errorMessages.length} CONSOLE ERROR(S):`);
      errorMessages.forEach(msg => {
        console.log(`    - ${msg.text}`);
        if (msg.location) {
          console.log(`      at ${msg.location.url}:${msg.location.lineNumber}`);
        }
      });
    } else {
      console.log('  ✅ No console errors');
    }

    if (warningMessages.length > 0) {
      console.log(`\n  ⚠️  ${warningMessages.length} WARNING(S):`);
      warningMessages.forEach(msg => console.log(`    - ${msg.text}`));
    } else {
      console.log('  ✅ No console warnings');
    }

    // Report page errors
    console.log('\n🚨 Page Errors:');
    if (pageErrors.length > 0) {
      console.log(`  ❌ ${pageErrors.length} PAGE ERROR(S):`);
      pageErrors.forEach(err => console.log(`    - ${err}`));
    } else {
      console.log('  ✅ No page errors detected');
    }

    // Report network errors
    console.log('\n🌐 Network Errors:');
    if (networkErrors.length > 0) {
      console.log(`  ❌ ${networkErrors.length} NETWORK ERROR(S):`);
      networkErrors.forEach(err => {
        console.log(`    - ${err.url}`);
        console.log(`      ${err.failure}`);
      });
    } else {
      console.log('  ✅ No network errors detected');
    }

    // Visible errors on page
    if (dashboardAnalysis.visibleErrors.length > 0) {
      console.log('\n⚠️  Visible Error Messages on Page:');
      dashboardAnalysis.visibleErrors.forEach(err => {
        console.log(`  - ${err.text}`);
      });
    } else {
      console.log('\n✅ No visible error messages on page');
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 FINAL TEST SUMMARY');
    console.log('='.repeat(60));

    const hasErrors = pageErrors.length > 0 || errorMessages.length > 0;
    const hasVisibleErrors = dashboardAnalysis.visibleErrors.length > 0;
    const hasNetworkIssues = networkErrors.length > 0;
    const isOnDashboard = currentUrl.includes('/admin/dashboard');
    const hasDashboardContent = dashboardAnalysis.sections.length > 0 ||
                                dashboardAnalysis.charts.length > 0 ||
                                dashboardAnalysis.tables.length > 0;

    console.log('\nChecklist:');
    console.log(`  ${isOnDashboard ? '✅' : '❌'} Navigated to dashboard URL`);
    console.log(`  ${hasDashboardContent ? '✅' : '❌'} Dashboard content visible`);
    console.log(`  ${!hasErrors ? '✅' : '❌'} No JavaScript errors`);
    console.log(`  ${!hasVisibleErrors ? '✅' : '❌'} No visible error messages`);
    console.log(`  ${!hasNetworkIssues ? '✅' : '❌'} No network errors`);

    if (isOnDashboard && hasDashboardContent && !hasErrors && !hasVisibleErrors) {
      console.log('\n✅ PASS - Dashboard loads successfully without crashes or errors');
    } else {
      console.log('\n❌ FAIL - Issues detected:');
      if (!isOnDashboard) console.log('  - Did not reach dashboard URL');
      if (!hasDashboardContent) console.log('  - No dashboard content visible');
      if (hasErrors) console.log('  - JavaScript errors present');
      if (hasVisibleErrors) console.log('  - Visible error messages on page');
      if (hasNetworkIssues) console.log('  - Network errors present');
    }

    console.log('\n📸 Screenshots saved:');
    console.log('  - dashboard-qa-01-login.png');
    console.log('  - dashboard-qa-02-form-filled.png');
    console.log('  - dashboard-qa-03-after-login.png');
    console.log('  - dashboard-qa-04-final-full.png');
    console.log('  - dashboard-qa-05-final-viewport.png');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
    await page.screenshot({
      path: 'dashboard-qa-error.png',
      fullPage: true
    });
    console.log('📸 Error screenshot saved to dashboard-qa-error.png');
  } finally {
    await browser.close();
  }
};

testDashboardWithAuth().catch(console.error);
