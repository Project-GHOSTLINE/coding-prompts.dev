import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 AUDIT POST-HEADERS - http://localhost:3000\n');

  // Test 1: Homepage load
  console.log('1. Testing homepage...');
  const startTime = Date.now();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;
  console.log(`   ✓ Load Time: ${loadTime}ms ${loadTime < 2000 ? '✅' : '⚠️'}`);

  // Test 2: Check all security headers
  console.log('\n2. Security Headers:');

  const response = await page.goto('http://localhost:3000');
  const headers = response.headers();

  const securityHeaders = {
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
    'x-xss-protection': '1; mode=block',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'content-security-policy': "default-src 'self'",
    'x-robots-tag': 'index, follow',
    'x-ai-friendly': 'structured-data, json-ld, semantic-html'
  };

  let headerScore = 0;
  const totalHeaders = Object.keys(securityHeaders).length;

  for (const [header, expectedValue] of Object.entries(securityHeaders)) {
    const actualValue = headers[header];
    const isPresent = actualValue !== undefined;
    const isCorrect = actualValue && actualValue.includes(expectedValue);

    if (isCorrect) headerScore++;

    console.log(`   ${isCorrect ? '✅' : '❌'} ${header}: ${isPresent ? '✓' : '✗'}`);
    if (isPresent && !isCorrect) {
      console.log(`      Expected: ${expectedValue}`);
      console.log(`      Got: ${actualValue.substring(0, 50)}...`);
    }
  }

  console.log(`\n   Score: ${headerScore}/${totalHeaders} headers correct ${headerScore === totalHeaders ? '✅' : '⚠️'}`);

  // Test 3: Check JSON-LD still works
  console.log('\n3. AEO Features:');
  const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
  console.log(`   ✓ JSON-LD scripts: ${jsonLdCount} ${jsonLdCount > 0 ? '✅' : '❌'}`);

  if (jsonLdCount > 0) {
    const jsonLdContent = await page.locator('script[type="application/ld+json"]').first().textContent();
    const isValid = jsonLdContent.includes('"@context"') && jsonLdContent.includes('schema.org');
    console.log(`   ✓ JSON-LD valid: ${isValid ? '✅' : '❌'}`);
  }

  // Test 4: Check H1 and meta
  const h1Count = await page.locator('h1').count();
  console.log(`   ✓ H1 tags: ${h1Count} ${h1Count === 1 ? '✅' : '⚠️'}`);

  const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
  console.log(`   ✓ Meta description: ${metaDesc ? '✅' : '❌'}`);

  // Test 5: Console errors
  console.log('\n4. Checking for errors...');
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.reload();
  await page.waitForTimeout(2000);
  console.log(`   Console errors: ${consoleErrors.length} ${consoleErrors.length === 0 ? '✅' : '❌'}`);
  if (consoleErrors.length > 0) {
    consoleErrors.slice(0, 3).forEach(err => console.log(`     ❌ ${err.substring(0, 80)}`));
  }

  // Test 6: Test MDX page with structured data
  console.log('\n5. Testing MDX page with structured data...');
  const mdxResp = await page.goto('http://localhost:3000/troubleshooting/exit-code-1');
  console.log(`   ✓ MDX page loads: ${mdxResp.status()} ${mdxResp.status() === 200 ? '✅' : '❌'}`);

  const mdxJsonLd = await page.locator('script[type="application/ld+json"]').count();
  console.log(`   ✓ MDX JSON-LD: ${mdxJsonLd} scripts ${mdxJsonLd > 0 ? '✅' : '❌'}`);

  // Test 7: Check robots.txt headers
  console.log('\n6. Special routes:');
  const robotsResp = await page.goto('http://localhost:3000/robots.txt');
  const robotsHeaders = robotsResp.headers();
  const robotsCache = robotsHeaders['cache-control'];
  console.log(`   ✓ robots.txt cache: ${robotsCache ? robotsCache : 'none'}`);
  console.log(`     ${robotsCache && robotsCache.includes('86400') ? '✅ 24h cache' : '⚠️ Should be 24h'}`);

  const sitemapResp = await page.goto('http://localhost:3000/sitemap.xml');
  const sitemapHeaders = sitemapResp.headers();
  const sitemapCache = sitemapHeaders['cache-control'];
  console.log(`   ✓ sitemap.xml cache: ${sitemapCache ? sitemapCache : 'none'}`);
  console.log(`     ${sitemapCache && sitemapCache.includes('3600') ? '✅ 1h cache' : '⚠️ Should be 1h'}`);

  // Test 8: Performance metrics
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const perfData = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0];
    return {
      domInteractive: Math.round(perf.domInteractive - perf.fetchStart),
      domComplete: Math.round(perf.domComplete - perf.fetchStart),
    };
  });

  console.log('\n7. Performance:');
  console.log(`   DOM Interactive: ${perfData.domInteractive}ms ${perfData.domInteractive < 1500 ? '✅' : '⚠️'}`);
  console.log(`   DOM Complete: ${perfData.domComplete}ms ${perfData.domComplete < 2500 ? '✅' : '⚠️'}`);

  await browser.close();

  // Calculate final score
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSULTATS:');
  console.log('='.repeat(60));

  const scores = {
    'Security Headers': Math.round((headerScore / totalHeaders) * 100),
    'AEO Features': jsonLdCount > 0 && h1Count === 1 ? 100 : 80,
    'No Errors': consoleErrors.length === 0 ? 100 : 50,
    'Performance': perfData.domComplete < 2500 ? 100 : 80
  };

  for (const [category, score] of Object.entries(scores)) {
    const emoji = score === 100 ? '✅' : score >= 80 ? '⚠️' : '❌';
    console.log(`${emoji} ${category}: ${score}/100`);
  }

  const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b) / Object.keys(scores).length);
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 SCORE GLOBAL: ${avgScore}/100 ${avgScore >= 90 ? '✅ EXCELLENT' : avgScore >= 80 ? '⚠️ BON' : '❌ À AMÉLIORER'}`);
  console.log('='.repeat(60));
})();
