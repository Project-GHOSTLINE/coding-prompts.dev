#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = '/Users/xunit/Desktop/Projets/coding-prompts.dev/site/qa-screenshots';
const BASE_URL = 'http://localhost:3001';
const CREDENTIALS = {
  email: 'admin@coding-prompts.dev',
  password: 'FredRosa%1978'
};

// Create screenshots directory
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const issues = [];
const testResults = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  tests: []
};

function addIssue(severity, component, description, screenshotPath) {
  issues.push({ severity, component, description, screenshotPath });
  console.log(`[${severity}] ${component}: ${description}`);
}

function addTestResult(name, status, details, screenshotPath) {
  testResults.tests.push({ name, status, details, screenshotPath });
  console.log(`[TEST] ${name}: ${status}`);
}

async function captureScreenshot(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Screenshot saved: ${path}`);
  return path;
}

async function checkConsoleErrors(page) {
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    consoleErrors.push(`Page error: ${error.message}`);
  });
  return consoleErrors;
}

(async () => {
  console.log('🔍 Starting QA Dashboard Test - Evidence-Based Analysis\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const error = msg.text();
      consoleErrors.push(error);
      console.log(`🔴 CONSOLE ERROR: ${error}`);
    }
  });

  page.on('pageerror', error => {
    const errorMsg = `Page error: ${error.message}`;
    consoleErrors.push(errorMsg);
    console.log(`🔴 PAGE ERROR: ${errorMsg}`);
  });

  try {
    // TEST 1: Login Page Access
    console.log('\n=== TEST 1: Login Page Access ===');
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const screenshot1 = await captureScreenshot(page, '01-login-page');

    if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
      addTestResult('Login Redirect', 'PASS', `Redirected to: ${currentUrl}`, screenshot1);
    } else {
      addIssue('CRITICAL', 'Authentication', `Expected redirect to login, got: ${currentUrl}`, screenshot1);
      addTestResult('Login Redirect', 'FAIL', `No redirect to login page`, screenshot1);
    }

    // Check login form elements
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');

    if (!emailInput) {
      addIssue('CRITICAL', 'Login Form', 'Email input field not found', screenshot1);
    }
    if (!passwordInput) {
      addIssue('CRITICAL', 'Login Form', 'Password input field not found', screenshot1);
    }
    if (!submitButton) {
      addIssue('CRITICAL', 'Login Form', 'Submit button not found', screenshot1);
    }

    // TEST 2: Login Process
    console.log('\n=== TEST 2: Login Process ===');
    if (emailInput && passwordInput && submitButton) {
      await emailInput.fill(CREDENTIALS.email);
      await passwordInput.fill(CREDENTIALS.password);

      const screenshot2 = await captureScreenshot(page, '02-login-filled');
      addTestResult('Login Form Fill', 'PASS', 'Credentials entered', screenshot2);

      await submitButton.click();
      await page.waitForTimeout(3000); // Wait for navigation and loading

      const afterLoginUrl = page.url();
      const screenshot3 = await captureScreenshot(page, '03-after-login');

      if (afterLoginUrl.includes('/admin/dashboard')) {
        addTestResult('Login Success', 'PASS', `Navigated to: ${afterLoginUrl}`, screenshot3);
      } else {
        addIssue('CRITICAL', 'Authentication', `Login failed, redirected to: ${afterLoginUrl}`, screenshot3);
        addTestResult('Login Success', 'FAIL', `Not on dashboard: ${afterLoginUrl}`, screenshot3);
      }
    } else {
      addIssue('CRITICAL', 'Login', 'Cannot test login - form elements missing', screenshot1);
      addTestResult('Login Success', 'FAIL', 'Form elements missing', screenshot1);
    }

    // TEST 3: Dashboard Components
    console.log('\n=== TEST 3: Dashboard Components ===');
    await page.waitForTimeout(2000);

    const screenshot4 = await captureScreenshot(page, '04-dashboard-full');

    // Check for sidebar
    const sidebar = await page.$('aside, nav[class*="sidebar"], [class*="Sidebar"]');
    if (sidebar) {
      const sidebarVisible = await sidebar.isVisible();
      if (sidebarVisible) {
        addTestResult('Sidebar', 'PASS', 'Sidebar found and visible', screenshot4);
      } else {
        addIssue('HIGH', 'Sidebar', 'Sidebar exists but not visible', screenshot4);
        addTestResult('Sidebar', 'FAIL', 'Sidebar not visible', screenshot4);
      }
    } else {
      addIssue('HIGH', 'Sidebar', 'Sidebar element not found in DOM', screenshot4);
      addTestResult('Sidebar', 'FAIL', 'Sidebar not found', screenshot4);
    }

    // Check for metric cards
    const metricCards = await page.$$('[class*="card"], [class*="Card"], [class*="metric"]');
    if (metricCards.length > 0) {
      addTestResult('Metric Cards', 'PASS', `Found ${metricCards.length} metric cards`, screenshot4);

      // Check if cards have content
      for (let i = 0; i < Math.min(metricCards.length, 5); i++) {
        const cardText = await metricCards[i].textContent();
        if (!cardText || cardText.trim().length === 0) {
          addIssue('MEDIUM', 'Metric Cards', `Card ${i+1} has no text content`, screenshot4);
        }
      }
    } else {
      addIssue('HIGH', 'Metric Cards', 'No metric cards found', screenshot4);
      addTestResult('Metric Cards', 'FAIL', 'No cards found', screenshot4);
    }

    // TEST 4: SEMrush Section
    console.log('\n=== TEST 4: SEMrush Section ===');

    // Scroll to SEMrush section
    await page.evaluate(() => {
      const semrushElement = document.querySelector('[class*="semrush"], [class*="SEMrush"]');
      if (semrushElement) {
        semrushElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(1000);

    const screenshot5 = await captureScreenshot(page, '05-semrush-section');

    // Check for SEMrush heading/section
    const semrushSection = await page.$('text=/SEMrush/i');
    if (semrushSection) {
      addTestResult('SEMrush Section', 'PASS', 'SEMrush section found', screenshot5);
    } else {
      addIssue('HIGH', 'SEMrush', 'SEMrush section not found', screenshot5);
      addTestResult('SEMrush Section', 'FAIL', 'Section not found', screenshot5);
    }

    // Check for table
    const table = await page.$('table');
    if (table) {
      addTestResult('SEMrush Table', 'PASS', 'Table element found', screenshot5);

      // Check table headers
      const headers = await page.$$('th');
      const headerTexts = await Promise.all(headers.map(h => h.textContent()));
      console.log('📊 Table headers:', headerTexts);

      // Check for keywords
      const keywordCells = await page.$$('td:first-child');
      const keywords = await Promise.all(keywordCells.map(cell => cell.textContent()));

      if (keywords.length > 0) {
        addTestResult('SEMrush Keywords', 'PASS', `Found ${keywords.length} keywords`, screenshot5);

        // TEST 5: Keyword Truncation
        console.log('\n=== TEST 5: Keyword Truncation Test ===');

        // Check for long keywords and their truncation
        for (let i = 0; i < Math.min(keywordCells.length, 10); i++) {
          const cell = keywordCells[i];
          const keyword = await cell.textContent();
          const boundingBox = await cell.boundingBox();

          if (keyword && keyword.length > 30) {
            // Check if truncate class is applied
            const classes = await cell.getAttribute('class');
            const hasTruncate = classes && classes.includes('truncate');
            const hasMaxWidth = classes && (classes.includes('max-w-xs') || classes.includes('max-w'));

            if (!hasTruncate || !hasMaxWidth) {
              addIssue('MEDIUM', 'Keyword Truncation',
                `Long keyword "${keyword}" (${keyword.length} chars) missing truncate/max-w-xs classes. Classes: ${classes}`,
                screenshot5);
            }

            // Check for text overflow
            const isOverflowing = await cell.evaluate(el => {
              return el.scrollWidth > el.clientWidth;
            });

            if (isOverflowing && !hasTruncate) {
              addIssue('HIGH', 'Keyword Overflow',
                `Keyword "${keyword.substring(0, 50)}..." is overflowing without truncation`,
                screenshot5);
            }
          }
        }

        const screenshot6 = await captureScreenshot(page, '06-keyword-truncation-check');
        addTestResult('Keyword Truncation', 'CHECKED', `Inspected ${Math.min(keywordCells.length, 10)} keywords`, screenshot6);

      } else {
        addIssue('HIGH', 'SEMrush Data', 'No keywords found in table', screenshot5);
        addTestResult('SEMrush Keywords', 'FAIL', 'No keywords', screenshot5);
      }
    } else {
      addIssue('HIGH', 'SEMrush Table', 'Table element not found', screenshot5);
      addTestResult('SEMrush Table', 'FAIL', 'Table not found', screenshot5);
    }

    // TEST 6: Mobile Responsive Check
    console.log('\n=== TEST 6: Mobile Responsive Check ===');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const screenshot7 = await captureScreenshot(page, '07-mobile-view');
    addTestResult('Mobile Responsive', 'CHECKED', 'Mobile viewport screenshot captured', screenshot7);

    // Check if sidebar is hidden/hamburger menu visible on mobile
    const mobileSidebar = await page.$('aside, nav[class*="sidebar"]');
    if (mobileSidebar) {
      const isMobileSidebarVisible = await mobileSidebar.isVisible();
      if (isMobileSidebarVisible) {
        // Check if it's transformed/hidden
        const transform = await mobileSidebar.evaluate(el => window.getComputedStyle(el).transform);
        console.log('📱 Mobile sidebar transform:', transform);
      }
    }

    // TEST 7: Console Errors Summary
    console.log('\n=== TEST 7: Console Errors Summary ===');
    if (consoleErrors.length > 0) {
      addIssue('CRITICAL', 'Console Errors', `Found ${consoleErrors.length} console errors`, screenshot4);
      consoleErrors.forEach((error, i) => {
        console.log(`   ${i+1}. ${error}`);
      });
      addTestResult('Console Errors', 'FAIL', `${consoleErrors.length} errors found`, screenshot4);
    } else {
      addTestResult('Console Errors', 'PASS', 'No console errors detected', screenshot4);
    }

  } catch (error) {
    console.error('🔴 TEST EXECUTION ERROR:', error);
    addIssue('CRITICAL', 'Test Execution', `Test failed: ${error.message}`, null);
    await captureScreenshot(page, '99-error-state');
  } finally {
    await browser.close();
  }

  // Generate QA Report
  console.log('\n\n========================================');
  console.log('📋 QA EVIDENCE-BASED REPORT');
  console.log('========================================\n');

  console.log(`📅 Test Date: ${testResults.timestamp}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📸 Screenshots Directory: ${SCREENSHOTS_DIR}\n`);

  console.log(`\n🔍 ISSUES FOUND: ${issues.length}\n`);

  if (issues.length === 0) {
    console.log('✅ NO ISSUES FOUND - But this is suspicious for a first test. Review screenshots manually.\n');
  } else {
    const critical = issues.filter(i => i.severity === 'CRITICAL');
    const high = issues.filter(i => i.severity === 'HIGH');
    const medium = issues.filter(i => i.severity === 'MEDIUM');

    if (critical.length > 0) {
      console.log(`🔴 CRITICAL (${critical.length}):`);
      critical.forEach((issue, i) => {
        console.log(`   ${i+1}. [${issue.component}] ${issue.description}`);
        if (issue.screenshotPath) console.log(`      Evidence: ${issue.screenshotPath}`);
      });
      console.log();
    }

    if (high.length > 0) {
      console.log(`🟠 HIGH (${high.length}):`);
      high.forEach((issue, i) => {
        console.log(`   ${i+1}. [${issue.component}] ${issue.description}`);
        if (issue.screenshotPath) console.log(`      Evidence: ${issue.screenshotPath}`);
      });
      console.log();
    }

    if (medium.length > 0) {
      console.log(`🟡 MEDIUM (${medium.length}):`);
      medium.forEach((issue, i) => {
        console.log(`   ${i+1}. [${issue.component}] ${issue.description}`);
        if (issue.screenshotPath) console.log(`      Evidence: ${issue.screenshotPath}`);
      });
      console.log();
    }
  }

  console.log('\n📊 TEST RESULTS SUMMARY:\n');
  testResults.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '🔍';
    console.log(`${icon} ${test.name}: ${test.status}`);
    console.log(`   ${test.details}`);
    if (test.screenshotPath) console.log(`   Evidence: ${test.screenshotPath}`);
    console.log();
  });

  // Save JSON report
  const reportPath = join(SCREENSHOTS_DIR, 'test-results.json');
  writeFileSync(reportPath, JSON.stringify({
    ...testResults,
    issues,
    summary: {
      totalTests: testResults.tests.length,
      passed: testResults.tests.filter(t => t.status === 'PASS').length,
      failed: testResults.tests.filter(t => t.status === 'FAIL').length,
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'CRITICAL').length,
      highIssues: issues.filter(i => i.severity === 'HIGH').length,
      mediumIssues: issues.filter(i => i.severity === 'MEDIUM').length
    }
  }, null, 2));

  console.log(`\n💾 Full report saved: ${reportPath}`);

  // Final verdict
  console.log('\n========================================');
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.severity === 'HIGH').length;

  if (criticalCount > 0) {
    console.log('❌ VERDICT: FAILED - Critical issues must be fixed');
    process.exit(1);
  } else if (highCount > 0) {
    console.log('⚠️  VERDICT: NEEDS WORK - High priority issues found');
    process.exit(1);
  } else if (issues.length > 0) {
    console.log('⚠️  VERDICT: MINOR ISSUES - Review and fix medium priority items');
  } else {
    console.log('✅ VERDICT: PASSED - But verify screenshots manually');
  }
  console.log('========================================\n');
})();
