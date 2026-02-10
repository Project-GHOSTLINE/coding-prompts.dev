/**
 * Test Dashboard API Call
 * Simule l'appel exact que fait le frontend
 */

import fetch from 'node-fetch'

console.log('\n=== DASHBOARD API TEST ===\n')

async function testAPI() {
  const url = 'http://localhost:3000/api/admin/stats'

  console.log('1. Testing WITHOUT authentication...')
  try {
    const response = await fetch(url)
    console.log('   Status:', response.status, response.statusText)

    if (response.status === 401) {
      console.log('   ✓ Correctly returns 401 Unauthorized')
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message)
  }

  console.log('\n2. Testing WITH authentication...')
  // Simulate authenticated request
  // Note: We'll need to login first to get a valid token

  console.log('   Creating login request...')
  const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@coding-prompts.dev',
      password: 'FredRosa%1978'
    })
  })

  console.log('   Login status:', loginResponse.status)

  if (loginResponse.status === 200) {
    // Get cookies
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('   Cookies received:', cookies ? 'Yes' : 'No')

    if (cookies) {
      console.log('\n3. Fetching stats with auth...')
      const statsResponse = await fetch(url, {
        headers: {
          'Cookie': cookies
        }
      })

      console.log('   Status:', statsResponse.status)

      if (statsResponse.status === 200) {
        const data = await statsResponse.json()

        console.log('\n4. AEO Data in Response:')
        console.log('   aeo.overview.totalAIVisits:', data.aeo?.overview?.totalAIVisits)
        console.log('   aeo.overview.totalCrawlers:', data.aeo?.overview?.totalCrawlers)
        console.log('   aeo.overview.totalReferrals:', data.aeo?.overview?.totalReferrals)
        console.log('   aeo.overview.uniqueEngines:', data.aeo?.overview?.uniqueEngines)
        console.log('   aeo.byEngine.length:', data.aeo?.byEngine?.length)

        console.log('\n5. Full AEO Object:')
        console.log(JSON.stringify(data.aeo, null, 2))

        if (data.aeo?.overview?.totalAIVisits === 0) {
          console.log('\n❌ PROBLEM: API returns 0 for AEO data')
          console.log('   This confirms the issue is in the API route')
        } else {
          console.log('\n✅ SUCCESS: API returns correct AEO data')
          console.log('   If dashboard still shows 0, issue is in frontend parsing')
        }
      } else {
        const error = await statsResponse.text()
        console.error('   ❌ Stats API error:', error)
      }
    }
  } else {
    const error = await loginResponse.text()
    console.error('   ❌ Login failed:', error)
  }
}

testAPI().catch(error => {
  console.error('\n❌ Test failed:', error.message)
  console.error(error)
  process.exit(1)
})

console.log('\n===================\n')
