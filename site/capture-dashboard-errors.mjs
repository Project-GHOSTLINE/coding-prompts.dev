import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const consoleMessages = [];
const pageErrors = [];
const networkErrors = [];

async function captureEverything() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Capture ALL console output
  page.on('console', msg => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString()
    };
    consoleMessages.push(entry);
    console.log(`[${entry.type.toUpperCase()}] ${entry.text}`);
    if (entry.location) {
      console.log(`  at ${entry.location.url}:${entry.location.lineNumber}:${entry.location.columnNumber}`);
    }
  });

  // Capture page errors (runtime errors)
  page.on('pageerror', error => {
    const entry = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    };
    pageErrors.push(entry);
    console.log('\n=== PAGE ERROR ===');
    console.log(`${error.name}: ${error.message}`);
    console.log(error.stack);
  });

  // Capture network failures
  page.on('requestfailed', request => {
    const entry = {
      url: request.url(),
      failure: request.failure(),
      timestamp: new Date().toISOString()
    };
    networkErrors.push(entry);
    console.log(`\n=== NETWORK FAILURE ===`);
    console.log(`URL: ${entry.url}`);
    console.log(`Error: ${JSON.stringify(entry.failure)}`);
  });

  try {
    console.log('Step 1: Navigating to login page...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 15000 });

    console.log('Step 2: Taking screenshot of login page...');
    await page.screenshot({
      path: join(__dirname, 'screenshot-1-login-page.png'),
      fullPage: true
    });

    console.log('Step 3: Attempting to login...');
    // Using credentials from .env.local
    await page.fill('input[type="email"]', 'admin@coding-prompts.dev');
    await page.fill('input[type="password"]', 'FredRosa%1978');

    await page.screenshot({
      path: join(__dirname, 'screenshot-2-login-filled.png'),
      fullPage: true
    });

    console.log('Step 4: Submitting login form...');
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: join(__dirname, 'screenshot-3-after-login-submit.png'),
      fullPage: true
    });

    console.log('Step 5: Checking current URL after login...');
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/admin/dashboard')) {
      console.log('Step 6: Successfully navigated to dashboard! Taking screenshots...');

      // Wait for dashboard to load
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: join(__dirname, 'screenshot-4-dashboard-loaded.png'),
        fullPage: true
      });

      // Open browser console to see errors
      console.log('Step 7: Waiting to capture any runtime errors...');
      await page.waitForTimeout(5000);

      await page.screenshot({
        path: join(__dirname, 'screenshot-5-dashboard-final.png'),
        fullPage: true
      });

    } else {
      console.log('Login failed or redirected elsewhere');
      await page.screenshot({
        path: join(__dirname, 'screenshot-error-login-failed.png'),
        fullPage: true
      });
    }

  } catch (error) {
    console.error('\n=== CAPTURE SCRIPT ERROR ===');
    console.error(error);
    await page.screenshot({
      path: join(__dirname, 'screenshot-error-capture-failed.png'),
      fullPage: true
    });
  }

  // Generate comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalConsoleMessages: consoleMessages.length,
      consoleErrors: consoleMessages.filter(m => m.type === 'error').length,
      consoleWarnings: consoleMessages.filter(m => m.type === 'warning').length,
      pageErrors: pageErrors.length,
      networkErrors: networkErrors.length
    },
    consoleMessages,
    pageErrors,
    networkErrors
  };

  fs.writeFileSync(
    join(__dirname, 'CONSOLE-ERRORS-FULL-REPORT.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n=== FINAL REPORT ===');
  console.log(`Total Console Messages: ${report.summary.totalConsoleMessages}`);
  console.log(`Console Errors: ${report.summary.consoleErrors}`);
  console.log(`Console Warnings: ${report.summary.consoleWarnings}`);
  console.log(`Page Errors: ${report.summary.pageErrors}`);
  console.log(`Network Errors: ${report.summary.networkErrors}`);

  if (pageErrors.length > 0) {
    console.log('\n=== ALL PAGE ERRORS ===');
    pageErrors.forEach((err, i) => {
      console.log(`\n--- Error ${i + 1} ---`);
      console.log(`${err.name}: ${err.message}`);
      console.log(err.stack);
    });
  }

  if (consoleMessages.filter(m => m.type === 'error').length > 0) {
    console.log('\n=== ALL CONSOLE ERRORS ===');
    consoleMessages.filter(m => m.type === 'error').forEach((msg, i) => {
      console.log(`\n--- Console Error ${i + 1} ---`);
      console.log(msg.text);
      if (msg.location) {
        console.log(`Location: ${msg.location.url}:${msg.location.lineNumber}:${msg.location.columnNumber}`);
      }
    });
  }

  console.log('\n=== Screenshots saved ===');
  console.log('- screenshot-1-login-page.png');
  console.log('- screenshot-2-login-filled.png');
  console.log('- screenshot-3-after-login-submit.png');
  console.log('- screenshot-4-dashboard-loaded.png (if login succeeded)');
  console.log('- screenshot-5-dashboard-final.png (if login succeeded)');
  console.log('\n=== Full report saved to CONSOLE-ERRORS-FULL-REPORT.json ===');

  await browser.close();
}

captureEverything().catch(console.error);
