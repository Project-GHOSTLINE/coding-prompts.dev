import http from 'http';

const PORT = 3004;
const EMAIL = 'admin@coding-prompts.dev';
const PASSWORD = 'FredRosa%1978';

console.log('🔍 Test API AEO - Dashboard Stats\n');

// Étape 1: Login
function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: EMAIL, password: PASSWORD });

    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      const cookies = res.headers['set-cookie'];

      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 && cookies) {
          console.log('✅ Login réussi');
          // Extraire le token du cookie
          const token = cookies[0].split(';')[0];
          resolve(token);
        } else {
          console.log('❌ Login échoué:', res.statusCode);
          console.log('Response:', body.substring(0, 200));
          reject(new Error('Login failed'));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

// Étape 2: Fetch stats
function fetchStats(cookie) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET',
      headers: {
        'Cookie': cookie
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API Stats répondu\n');
          try {
            const json = JSON.parse(body);

            // Analyser la section AEO
            console.log('=== SECTION AEO ===');
            if (json.aeo) {
              console.log('✅ Section AEO présente\n');
              console.log('Overview:');
              console.log(JSON.stringify(json.aeo.overview, null, 2));
              console.log('\nBy Engine (count):', json.aeo.byEngine?.length || 0);
              console.log('Timeline (count):', json.aeo.timeline?.length || 0);
              console.log('Top Pages (count):', json.aeo.topPages?.length || 0);
              console.log('Crawler Activity (count):', json.aeo.crawlerActivity?.length || 0);

              if (json.aeo.byEngine?.length > 0) {
                console.log('\nBy Engine (first 3):');
                json.aeo.byEngine.slice(0, 3).forEach(e => {
                  console.log(`  - ${e.engineName}: ${e.totalVisits} visites (${e.crawlers} crawlers, ${e.referrals} referrals)`);
                });
              }
            } else {
              console.log('❌ Section AEO manquante!');
              console.log('Keys disponibles:', Object.keys(json));
            }

            resolve(json);
          } catch (e) {
            console.error('❌ Erreur parsing JSON:', e.message);
            console.log('Body:', body.substring(0, 500));
            reject(e);
          }
        } else {
          console.log('❌ API Stats échoué:', res.statusCode);
          console.log('Response:', body.substring(0, 200));
          reject(new Error('Stats failed'));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

// Exécution
(async () => {
  try {
    const cookie = await login();
    await fetchStats(cookie);
    console.log('\n✅ Test terminé avec succès!');
  } catch (error) {
    console.error('\n❌ Test échoué:', error.message);
    process.exit(1);
  }
})();
