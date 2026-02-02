import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 AUDIT SITE - https://coding-prompts.dev\n');

  // Test 1: Load time
  console.log('1. Testing homepage load time...');
  const startTime = Date.now();
  await page.goto('https://coding-prompts.dev', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;
  console.log(`   ✓ Page Load Time: ${loadTime}ms ${loadTime < 2000 ? '✅' : '⚠️'}`);

  // Test 2: Title
  const title = await page.title();
  console.log(`\n2. SEO Metadata:`);
  console.log(`   ✓ Title: ${title}`);

  // Test 3: Meta description
  const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
  console.log(`   ✓ Meta Description: ${metaDesc ? '✅' : '❌'}`);
  if (metaDesc) console.log(`     "${metaDesc.substring(0, 80)}..."`);

  // Test 4: Check for H1
  const h1Count = await page.locator('h1').count();
  const h1Text = h1Count > 0 ? await page.locator('h1').first().textContent() : 'None';
  console.log(`   ✓ H1 tags: ${h1Count} ${h1Count === 1 ? '✅' : '⚠️'}`);
  console.log(`     "${h1Text}"`);

  // Test 5: Check structured data
  const jsonLd = await page.locator('script[type="application/ld+json"]').count();
  console.log(`   ✓ JSON-LD structured data: ${jsonLd} ${jsonLd > 0 ? '✅' : '❌'}`);

  // Test 6: Check images
  const images = await page.locator('img').count();
  const imagesWithAlt = await page.locator('img[alt]').count();
  const imgRatio = images > 0 ? Math.round((imagesWithAlt / images) * 100) : 0;
  console.log(`\n3. Accessibility:`);
  console.log(`   ✓ Images: ${images} total, ${imagesWithAlt} with alt (${imgRatio}%) ${imgRatio > 90 ? '✅' : '⚠️'}`);

  // Test 7: Performance metrics
  const perfData = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0];
    return {
      dns: Math.round(perf.domainLookupEnd - perf.domainLookupStart),
      tcp: Math.round(perf.connectEnd - perf.connectStart),
      ttfb: Math.round(perf.responseStart - perf.requestStart),
      download: Math.round(perf.responseEnd - perf.responseStart),
      domInteractive: Math.round(perf.domInteractive - perf.fetchStart),
      domComplete: Math.round(perf.domComplete - perf.fetchStart),
    };
  });

  console.log(`\n4. Performance Metrics:`);
  console.log(`   DNS Lookup:      ${perfData.dns}ms ${perfData.dns < 50 ? '✅' : '⚠️'}`);
  console.log(`   TCP Connect:     ${perfData.tcp}ms ${perfData.tcp < 100 ? '✅' : '⚠️'}`);
  console.log(`   TTFB:            ${perfData.ttfb}ms ${perfData.ttfb < 200 ? '✅' : '⚠️'}`);
  console.log(`   Download:        ${perfData.download}ms ${perfData.download < 100 ? '✅' : '⚠️'}`);
  console.log(`   DOM Interactive: ${perfData.domInteractive}ms ${perfData.domInteractive < 1500 ? '✅' : '⚠️'}`);
  console.log(`   DOM Complete:    ${perfData.domComplete}ms ${perfData.domComplete < 2500 ? '✅' : '⚠️'}`);

  // Test 8: Check console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log(`\n5. Testing for console errors...`);
  await page.reload();
  await page.waitForTimeout(2000);
  console.log(`   Console Errors: ${consoleErrors.length} ${consoleErrors.length === 0 ? '✅' : '❌'}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(err => console.log(`     ❌ ${err}`));
  }

  // Test 9: Mobile responsiveness
  console.log(`\n6. Testing mobile responsiveness...`);
  await page.setViewportSize({ width: 375, height: 667 });
  const mobileStart = Date.now();
  await page.reload({ waitUntil: 'networkidle' });
  const mobileLoad = Date.now() - mobileStart;
  console.log(`   ✓ Mobile Load Time: ${mobileLoad}ms ${mobileLoad < 3000 ? '✅' : '⚠️'}`);

  // Test 10: Check specific pages
  const pages = [
    '/troubleshooting/exit-code-1',
    '/setup/installation',
    '/features/sequential-thinking',
    '/vs/cursor'
  ];

  console.log(`\n7. Testing Internal Pages:`);
  for (const path of pages) {
    try {
      const resp = await page.goto(`https://coding-prompts.dev${path}`, { timeout: 10000 });
      const status = resp.status();
      console.log(`   ${status === 200 ? '✓' : '✗'} ${path}: ${status} ${status === 200 ? '✅' : '❌'}`);
    } catch (e) {
      console.log(`   ✗ ${path}: ERROR ❌`);
    }
  }

  // Test 11: Check robots.txt and sitemap
  console.log(`\n8. SEO Files:`);
  const robotsResp = await page.goto('https://coding-prompts.dev/robots.txt');
  console.log(`   ✓ robots.txt: ${robotsResp.status()} ${robotsResp.status() === 200 ? '✅' : '❌'}`);

  const sitemapResp = await page.goto('https://coding-prompts.dev/sitemap.xml');
  console.log(`   ✓ sitemap.xml: ${sitemapResp.status()} ${sitemapResp.status() === 200 ? '✅' : '❌'}`);

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log('✅ AUDIT TERMINÉ');
  console.log('='.repeat(50));
})();
