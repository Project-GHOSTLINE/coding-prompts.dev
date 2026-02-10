import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function captureWithConsole() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Collect all console messages
  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text, timestamp: new Date().toISOString() });
    console.log(`[${type.toUpperCase()}] ${text}`);
  });

  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.log('PAGE ERROR:', error.message);
    console.log('STACK:', error.stack);
  });

  try {
    console.log('Navigating to http://localhost:3001/admin/dashboard...');
    await page.goto('http://localhost:3001/admin/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(3000);

    // Take screenshot of the page
    console.log('Taking page screenshot...');
    await page.screenshot({
      path: join(__dirname, 'dashboard-page-render.png'),
      fullPage: true
    });

    // Open DevTools console and take screenshot
    console.log('Opening DevTools...');
    const client = await context.newCDPSession(page);

    // Take screenshot showing console
    await page.evaluate(() => {
      // Try to make errors visible on page if any
      const errorDiv = document.createElement('div');
      errorDiv.id = 'playwright-error-display';
      errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:20px;z-index:999999;font-family:monospace;white-space:pre-wrap;max-height:300px;overflow:auto;';
      errorDiv.textContent = 'Checking for errors...';
      document.body.appendChild(errorDiv);
    });

    await page.screenshot({
      path: join(__dirname, 'dashboard-with-error-overlay.png'),
      fullPage: false
    });

    // Save console messages to file
    const report = {
      url: 'http://localhost:3001/admin/dashboard',
      timestamp: new Date().toISOString(),
      consoleMessages,
      errors,
      summary: {
        totalConsoleMessages: consoleMessages.length,
        totalErrors: errors.length,
        errorTypes: consoleMessages.filter(m => m.type === 'error').length,
        warnings: consoleMessages.filter(m => m.type === 'warning').length
      }
    };

    const fs = await import('fs');
    fs.writeFileSync(
      join(__dirname, 'console-errors-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n=== CONSOLE ERROR REPORT ===');
    console.log(`Total Console Messages: ${report.summary.totalConsoleMessages}`);
    console.log(`Console Errors: ${report.summary.errorTypes}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Page Errors: ${report.summary.totalErrors}`);

    if (errors.length > 0) {
      console.log('\n=== PAGE ERRORS ===');
      errors.forEach((err, i) => {
        console.log(`\nError ${i + 1}:`);
        console.log(err.message);
        console.log(err.stack);
      });
    }

    if (consoleMessages.filter(m => m.type === 'error').length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      consoleMessages.filter(m => m.type === 'error').forEach((msg, i) => {
        console.log(`\nConsole Error ${i + 1}:`);
        console.log(msg.text);
      });
    }

  } catch (error) {
    console.error('Failed to capture:', error);
    await page.screenshot({
      path: join(__dirname, 'dashboard-capture-failed.png'),
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

captureWithConsole().catch(console.error);
