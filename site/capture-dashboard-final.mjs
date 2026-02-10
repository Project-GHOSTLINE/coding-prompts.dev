import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:3004/admin/login');
  await page.fill('input[type="email"]', 'admin@coding-prompts.dev');
  await page.fill('input[type="password"]', 'FredRosa%1978');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard');

  // Attendre que le dashboard charge complètement
  await page.waitForSelector('text=Loading dashboard...', { state: 'hidden', timeout: 15000 });

  // Scroll vers la section AEO
  await page.evaluate(() => {
    const aeoSection = Array.from(document.querySelectorAll('*'))
      .find(el => el.textContent.includes('AEO Tracking'));
    if (aeoSection) {
      aeoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  await page.waitForTimeout(2000);

  // Screenshot full page
  await page.screenshot({
    path: '../dashboard-aeo-fixed-fullpage.png',
    fullPage: true
  });

  // Screenshot viewport centré sur AEO
  await page.screenshot({
    path: '../dashboard-aeo-fixed-viewport.png',
    fullPage: false
  });

  console.log('✅ Screenshots capturés:');
  console.log('   - dashboard-aeo-fixed-fullpage.png (page complète)');
  console.log('   - dashboard-aeo-fixed-viewport.png (viewport)');

  await browser.close();
})();
