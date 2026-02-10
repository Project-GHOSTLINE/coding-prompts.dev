import { chromium } from 'playwright';

console.log('🚀 Démarrage tests Playwright...\n');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const errors = [];
const successes = [];

// Capturer les erreurs console
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push({ type: 'console', message: msg.text() });
  }
});

// Capturer les erreurs réseau
page.on('response', response => {
  const status = response.status();
  const url = response.url();
  
  if (status >= 400 && status < 600) {
    errors.push({ 
      type: 'http', 
      status, 
      url: url.replace('http://localhost:3000', '')
    });
  }
});

try {
  // Test 1: Homepage
  console.log('📍 Test 1: Chargement homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(2000);
  const title = await page.title();
  console.log(`   ✅ Page chargée: "${title}"\n`);
  successes.push('Homepage chargée');

  // Test 2: Vérifier CSP dans le navigateur
  console.log('📍 Test 2: Vérification CSP dans le navigateur...');
  const cspViolations = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Content Security Policy') || text.includes('CSP')) {
      cspViolations.push(text);
    }
  });
  await page.waitForTimeout(1000);
  
  if (cspViolations.length === 0) {
    console.log('   ✅ Aucune violation CSP détectée\n');
    successes.push('CSP OK');
  } else {
    console.log('   ⚠️  Violations CSP détectées:\n');
    cspViolations.forEach(v => console.log(`      - ${v}`));
  }

  // Test 3: Test routes admin
  console.log('📍 Test 3: Navigation vers /admin...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  
  if (currentUrl.includes('/admin/login')) {
    console.log('   ✅ Redirection vers login correcte\n');
    successes.push('Admin redirect OK');
  } else {
    console.log(`   ❌ Pas de redirection (URL: ${currentUrl})\n`);
    errors.push({ type: 'navigation', message: 'Admin not redirecting to login' });
  }

  // Test 4: Page de login
  console.log('📍 Test 4: Page de login...');
  const emailField = await page.locator('input[type="email"]').count();
  const passwordField = await page.locator('input[type="password"]').count();
  
  if (emailField > 0 && passwordField > 0) {
    console.log('   ✅ Formulaire de login présent\n');
    successes.push('Login form OK');
  } else {
    console.log('   ❌ Formulaire de login manquant\n');
    errors.push({ type: 'ui', message: 'Login form not found' });
  }

  // Test 5: Test d'authentification
  console.log('📍 Test 5: Test authentification...');
  if (emailField > 0 && passwordField > 0) {
    await page.locator('input[type="email"]').first().fill('admin@coding-prompts.dev');
    await page.locator('input[type="password"]').first().fill(process.env.ADMIN_PASSWORD || 'FredRosa%1978');
    
    const submitBtn = await page.locator('button[type="submit"]').first();
    await submitBtn.click();
    
    await page.waitForTimeout(3000);
    const newUrl = page.url();
    
    if (newUrl.includes('/admin/dashboard')) {
      console.log('   ✅ Authentification réussie, redirection vers dashboard\n');
      successes.push('Auth OK');
      
      // Test 6: Dashboard chargé
      console.log('📍 Test 6: Vérification dashboard...');
      await page.waitForTimeout(2000);
      
      const dashboardTitle = await page.locator('h1, h2').first().textContent();
      console.log(`   ✅ Dashboard chargé: "${dashboardTitle}"\n`);
      successes.push('Dashboard loaded');
      
    } else {
      console.log(`   ⚠️  Auth incertaine (URL: ${newUrl})\n`);
    }
  }

  // Test 7: Test 404
  console.log('📍 Test 7: Test page 404...');
  await page.goto('http://localhost:3000/page-inexistante', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const pageContent = await page.content();
  
  if (pageContent.includes('404') || pageContent.includes('not found') || pageContent.includes('Not Found')) {
    console.log('   ✅ Page 404 fonctionne\n');
    successes.push('404 page OK');
  } else {
    console.log('   ⚠️  Page 404 incertaine\n');
  }

} catch (error) {
  console.error('❌ Erreur durant les tests:', error.message);
  errors.push({ type: 'fatal', message: error.message });
}

// Rapport final
console.log('\n==========================================');
console.log('📊 RAPPORT FINAL');
console.log('==========================================\n');

console.log(`✅ Succès: ${successes.length}`);
successes.forEach(s => console.log(`   - ${s}`));

console.log(`\n❌ Erreurs: ${errors.length}`);
if (errors.length > 0) {
  errors.forEach(e => {
    if (e.type === 'http') {
      console.log(`   - HTTP ${e.status}: ${e.url}`);
    } else {
      console.log(`   - ${e.type}: ${e.message || e.text || 'Unknown'}`);
    }
  });
} else {
  console.log('   Aucune erreur détectée !');
}

console.log('\n==========================================');

await browser.close();
console.log('\n✅ Tests Playwright terminés\n');
