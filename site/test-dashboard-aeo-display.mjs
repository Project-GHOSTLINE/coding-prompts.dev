import { chromium } from 'playwright';

const PORT = 3004;
const EMAIL = 'admin@coding-prompts.dev';
const PASSWORD = 'FredRosa%1978';

console.log('🔍 Test Dashboard AEO - Vérification affichage\n');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Login
    console.log('1️⃣  Navigation vers login...');
    await page.goto(`http://localhost:${PORT}/admin/login`);
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    console.log('✅ Login réussi\n');

    // 2. Attendre que le dashboard se charge
    console.log('2️⃣  Attente chargement dashboard...');
    // Attendre que le spinner disparaisse
    try {
      await page.waitForSelector('text=Loading dashboard...', { state: 'hidden', timeout: 15000 });
      console.log('✅ Dashboard chargé\n');
    } catch (e) {
      console.log('⚠️  Timeout - Dashboard toujours en loading\n');
    }

    // 3. Chercher la section AEO
    console.log('3️⃣  Recherche section AEO...');
    const aeoSection = await page.locator('text=AEO Tracking').first();
    const aeoVisible = await aeoSection.isVisible().catch(() => false);

    if (aeoVisible) {
      console.log('✅ Section AEO visible\n');
    } else {
      console.log('❌ Section AEO non trouvée!\n');
    }

    // 4. Extraire les métriques AEO affichées
    console.log('4️⃣  Extraction des métriques AEO...');

    // Chercher tous les éléments contenant "AI Visits" ou des chiffres AEO
    const metrics = await page.evaluate(() => {
      const results = {
        found: [],
        text: []
      };

      // Chercher "Total AI Visits", "Total Crawlers", etc.
      const patterns = [
        /Total.*AI.*Visits?/i,
        /Total.*Crawlers?/i,
        /Total.*Referrals?/i,
        /Unique.*Engines?/i,
        /AEO.*Score/i,
        /ChatGPT/i,
        /Claude/i,
        /Perplexity/i
      ];

      document.body.innerText.split('\n').forEach(line => {
        patterns.forEach(pattern => {
          if (pattern.test(line)) {
            results.found.push(line.trim());
          }
        });
      });

      // Capturer le texte de la section AEO si elle existe
      const aeoHeaders = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent.includes('AEO Tracking'));

      if (aeoHeaders.length > 0) {
        const section = aeoHeaders[0].closest('div');
        if (section) {
          results.text = section.innerText.split('\n').slice(0, 30);
        }
      }

      return results;
    });

    if (metrics.found.length > 0) {
      console.log('📊 Métriques trouvées:');
      metrics.found.forEach(m => console.log(`   - ${m}`));
      console.log();
    } else {
      console.log('⚠️  Aucune métrique AEO trouvée dans le texte\n');
    }

    if (metrics.text.length > 0) {
      console.log('📄 Contenu section AEO:');
      metrics.text.forEach(line => {
        if (line.trim()) console.log(`   ${line}`);
      });
      console.log();
    }

    // 5. Screenshot pour analyse visuelle
    console.log('5️⃣  Capture screenshot...');
    await page.screenshot({
      path: 'dashboard-aeo-test.png',
      fullPage: true
    });
    console.log('✅ Screenshot sauvegardé: dashboard-aeo-test.png\n');

    // 6. Vérifier les appels API
    console.log('6️⃣  Vérification appels API...');
    const apiCalls = [];

    page.on('response', response => {
      if (response.url().includes('/api/admin/stats')) {
        apiCalls.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    // Rafraîchir pour capturer l'appel API
    await page.reload();
    await page.waitForTimeout(2000);

    if (apiCalls.length > 0) {
      console.log('✅ API Stats appelée:');
      apiCalls.forEach(call => {
        console.log(`   - ${call.url} (${call.status})`);
      });
    } else {
      console.log('⚠️  Aucun appel API /admin/stats détecté');
    }

    console.log('\n✅ Test terminé!');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    await page.screenshot({ path: 'dashboard-aeo-error.png' });
    console.log('Screenshot d\'erreur sauvegardé: dashboard-aeo-error.png');
  } finally {
    await browser.close();
  }
})();
