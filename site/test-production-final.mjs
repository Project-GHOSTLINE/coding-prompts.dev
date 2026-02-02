import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🌐 TEST FINAL PRODUCTION - https://coding-prompts.dev\n');
  console.log('='.repeat(70));

  // Test headers
  console.log('\n🔐 SECURITY HEADERS\n');
  const response = await page.goto('https://coding-prompts.dev');
  const headers = response.headers();

  const requiredHeaders = {
    'x-frame-options': { expected: 'DENY', name: 'X-Frame-Options' },
    'x-content-type-options': { expected: 'nosniff', name: 'X-Content-Type-Options' },
    'x-xss-protection': { expected: '1; mode=block', name: 'X-XSS-Protection' },
    'referrer-policy': { expected: 'strict-origin-when-cross-origin', name: 'Referrer-Policy' },
    'permissions-policy': { expected: 'camera=(), microphone=()', name: 'Permissions-Policy' },
    'content-security-policy': { expected: "default-src 'self'", name: 'Content-Security-Policy' },
    'x-robots-tag': { expected: 'index, follow', name: 'X-Robots-Tag' },
    'x-ai-friendly': { expected: 'structured-data', name: 'X-AI-Friendly' }
  };

  let passedHeaders = 0;
  for (const [key, config] of Object.entries(requiredHeaders)) {
    const value = headers[key];
    const present = value !== undefined;
    const correct = value && value.includes(config.expected);

    if (correct) passedHeaders++;

    const emoji = correct ? '✅' : (present ? '⚠️' : '❌');
    console.log(`${emoji} ${config.name}`);
    if (present && !correct) {
      console.log(`   Expected to contain: "${config.expected}"`);
      console.log(`   Got: "${value.substring(0, 60)}..."`);
    }
  }

  console.log(`\nScore: ${passedHeaders}/${Object.keys(requiredHeaders).length} headers ${passedHeaders === Object.keys(requiredHeaders).length ? '✅' : '❌'}`);

  // Test AEO features
  console.log('\n🤖 AEO FEATURES\n');

  const title = await page.title();
  console.log(`✅ Title: ${title}`);

  const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
  console.log(`${metaDesc ? '✅' : '❌'} Meta Description: ${metaDesc ? 'Present' : 'Missing'}`);

  const h1Count = await page.locator('h1').count();
  console.log(`${h1Count === 1 ? '✅' : '⚠️'} H1 tags: ${h1Count} ${h1Count === 1 ? '(perfect)' : '(should be 1)'}`);

  const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
  console.log(`${jsonLdCount > 0 ? '✅' : '❌'} JSON-LD scripts: ${jsonLdCount}`);

  if (jsonLdCount > 0) {
    try {
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').first().textContent();
      const parsed = JSON.parse(jsonLdContent);
      const hasContext = parsed['@context'] && parsed['@context'].includes('schema.org');
      console.log(`${hasContext ? '✅' : '❌'} JSON-LD valid: ${hasContext ? 'schema.org compliant' : 'invalid'}`);
    } catch (e) {
      console.log(`❌ JSON-LD parse error`);
    }
  }

  // Test performance
  console.log('\n⚡ PERFORMANCE\n');

  const startTime = Date.now();
  await page.reload({ waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;
  console.log(`${loadTime < 2000 ? '✅' : '⚠️'} Page load: ${loadTime}ms ${loadTime < 1000 ? '(excellent)' : loadTime < 2000 ? '(good)' : '(needs improvement)'}`);

  const perfData = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0];
    return {
      ttfb: Math.round(perf.responseStart - perf.requestStart),
      domInteractive: Math.round(perf.domInteractive - perf.fetchStart),
      domComplete: Math.round(perf.domComplete - perf.fetchStart),
    };
  });

  console.log(`${perfData.ttfb < 200 ? '✅' : '⚠️'} TTFB: ${perfData.ttfb}ms`);
  console.log(`${perfData.domInteractive < 1500 ? '✅' : '⚠️'} DOM Interactive: ${perfData.domInteractive}ms`);
  console.log(`${perfData.domComplete < 2500 ? '✅' : '⚠️'} DOM Complete: ${perfData.domComplete}ms`);

  // Test MDX page
  console.log('\n📄 MDX PAGE TEST\n');

  const mdxResp = await page.goto('https://coding-prompts.dev/troubleshooting/exit-code-1');
  console.log(`${mdxResp.status() === 200 ? '✅' : '❌'} Page loads: ${mdxResp.status()}`);

  const mdxJsonLd = await page.locator('script[type="application/ld+json"]').count();
  console.log(`${mdxJsonLd > 0 ? '✅' : '❌'} JSON-LD present: ${mdxJsonLd} scripts`);

  // Check console errors
  console.log('\n🔍 ERROR CHECK\n');

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('https://coding-prompts.dev');
  await page.waitForTimeout(2000);

  console.log(`${errors.length === 0 ? '✅' : '❌'} Console errors: ${errors.length}`);
  if (errors.length > 0) {
    errors.slice(0, 3).forEach(err => console.log(`   ❌ ${err.substring(0, 80)}`));
  }

  // Test special routes
  console.log('\n🗂️ SPECIAL ROUTES\n');

  const robotsResp = await page.goto('https://coding-prompts.dev/robots.txt');
  const robotsHeaders = robotsResp.headers();
  console.log(`${robotsResp.status() === 200 ? '✅' : '❌'} robots.txt: ${robotsResp.status()}`);
  console.log(`${robotsHeaders['cache-control']?.includes('86400') ? '✅' : '⚠️'} Cache: ${robotsHeaders['cache-control']}`);

  const sitemapResp = await page.goto('https://coding-prompts.dev/sitemap.xml');
  const sitemapHeaders = sitemapResp.headers();
  console.log(`${sitemapResp.status() === 200 ? '✅' : '❌'} sitemap.xml: ${sitemapResp.status()}`);
  console.log(`${sitemapHeaders['cache-control']?.includes('3600') ? '✅' : '⚠️'} Cache: ${sitemapHeaders['cache-control']}`);

  await browser.close();

  // Calculate scores
  console.log('\n' + '='.repeat(70));
  console.log('📊 SCORES FINAUX');
  console.log('='.repeat(70));

  const scores = {
    'Security Headers': Math.round((passedHeaders / Object.keys(requiredHeaders).length) * 100),
    'AEO Features': jsonLdCount > 0 && h1Count === 1 ? 100 : 90,
    'Performance': loadTime < 2000 && perfData.ttfb < 200 ? 100 : 90,
    'No Errors': errors.length === 0 ? 100 : 80,
    'Special Routes': robotsResp.status() === 200 && sitemapResp.status() === 200 ? 100 : 80
  };

  for (const [category, score] of Object.entries(scores)) {
    const emoji = score === 100 ? '✅' : score >= 90 ? '⚠️' : '❌';
    console.log(`${emoji} ${category.padEnd(25)} ${score}/100`);
  }

  const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b) / Object.keys(scores).length);

  console.log('\n' + '='.repeat(70));
  console.log(`🎯 SCORE GLOBAL: ${avgScore}/100`);

  if (avgScore >= 95) {
    console.log('🏆 EXCELLENT - Site parfaitement optimisé pour AEO et sécurisé !');
  } else if (avgScore >= 85) {
    console.log('✅ TRÈS BON - Site bien optimisé avec quelques améliorations mineures possibles');
  } else if (avgScore >= 75) {
    console.log('⚠️ BON - Site fonctionnel mais nécessite quelques améliorations');
  } else {
    console.log('❌ À AMÉLIORER - Plusieurs problèmes à corriger');
  }

  console.log('='.repeat(70));
})();
