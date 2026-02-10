import { chromium } from 'playwright';

const testDashboard = async () => {
  console.log('🔍 Starting Dashboard QA Test...\n');

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
      text: msg.text()
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
    console.log('📍 Navigating to http://localhost:3001/admin/dashboard...');
    await page.goto('http://localhost:3001/admin/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded successfully\n');

    // Wait for dynamic content
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: 'dashboard-qa-test-full.png',
      fullPage: true
    });

    console.log('📸 Screenshot saved to dashboard-qa-test-full.png\n');

    // Check for specific sections
    console.log('🔍 Checking for dashboard sections...\n');
    const sections = await page.evaluate(() => {
      const results = [];

      // Check for common dashboard elements
      const checks = [
        { selector: 'h1, h2', name: 'Page Header' },
        { selector: '[class*="card"]', name: 'Card Components' },
        { selector: '[class*="chart"]', name: 'Chart Components' },
        { selector: 'main', name: 'Main Content' },
        { selector: '[class*="dashboard"]', name: 'Dashboard Container' }
      ];

      checks.forEach(({ selector, name }) => {
        const elements = document.querySelectorAll(selector);
        results.push({
          name,
          selector,
          found: elements.length,
          visible: Array.from(elements).some(el => el.offsetParent !== null)
        });
      });

      // Check for error messages
      const errorSelectors = [
        '[class*="error"]',
        '[role="alert"]',
        '[class*="alert-error"]',
        '[class*="text-red"]'
      ];

      const errors = [];
      errorSelectors.forEach(selector => {
        const els = document.querySelectorAll(selector);
        if (els.length > 0) {
          errors.push({
            selector,
            count: els.length,
            text: Array.from(els).map(el => el.textContent.substring(0, 100))
          });
        }
      });

      return { sections: results, visibleErrors: errors };
    });

    console.log('📊 Section Check Results:');
    sections.sections.forEach(s => {
      const status = s.found > 0 && s.visible ? '✅' : '❌';
      console.log(`  ${status} ${s.name}: ${s.found} found, visible: ${s.visible}`);
    });

    if (sections.visibleErrors.length > 0) {
      console.log('\n⚠️  Visible Error Messages Found:');
      sections.visibleErrors.forEach(err => {
        console.log(`  ${err.selector}: ${err.count} elements`);
        err.text.forEach(text => console.log(`    - ${text}`));
      });
    } else {
      console.log('\n✅ No visible error messages found');
    }

    // Report console messages
    console.log('\n📝 Console Messages:');
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    const warningMessages = consoleMessages.filter(msg => msg.type === 'warning');

    if (errorMessages.length > 0) {
      console.log(`\n  ❌ ${errorMessages.length} ERROR(S):`);
      errorMessages.forEach(msg => console.log(`    - ${msg.text}`));
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
      networkErrors.forEach(err => console.log(`    - ${err.url}\n      ${err.failure}`));
    } else {
      console.log('  ✅ No network errors detected');
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(60));

    const hasErrors = pageErrors.length > 0 || errorMessages.length > 0 || sections.visibleErrors.length > 0;
    const hasNetworkIssues = networkErrors.length > 0;
    const allSectionsVisible = sections.sections.every(s => s.found > 0 && s.visible);

    if (!hasErrors && !hasNetworkIssues && allSectionsVisible) {
      console.log('✅ PASS - Dashboard loads without crashes or errors');
    } else {
      console.log('❌ FAIL - Issues detected:');
      if (pageErrors.length > 0) console.log('  - Page errors present');
      if (errorMessages.length > 0) console.log('  - Console errors present');
      if (sections.visibleErrors.length > 0) console.log('  - Visible error messages');
      if (networkErrors.length > 0) console.log('  - Network errors present');
      if (!allSectionsVisible) console.log('  - Some sections not visible');
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await page.screenshot({
      path: 'dashboard-qa-error.png',
      fullPage: true
    });
    console.log('📸 Error screenshot saved to dashboard-qa-error.png');
  } finally {
    await browser.close();
  }
};

testDashboard().catch(console.error);
