/**
 * Test AEO Data Fetching
 * Vérifie que les données Supabase sont correctement récupérées
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n=== AEO DATA DEBUG ===\n')
console.log('1. Environment Check:')
console.log('   SUPABASE_URL:', supabaseUrl ? '✓ SET' : '✗ MISSING')
console.log('   SERVICE_KEY:', supabaseKey ? '✓ SET' : '✗ MISSING')

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('\n2. Testing Supabase Connection...')

try {
  // Test connection
  const { data: testData, error: testError } = await supabase
    .from('aeo_tracking')
    .select('count', { count: 'exact', head: true })

  if (testError) {
    console.error('❌ Connection error:', testError.message)
    process.exit(1)
  }

  console.log('   ✓ Connection successful')

  // Get total records
  const { count, error: countError } = await supabase
    .from('aeo_tracking')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Count error:', countError.message)
  } else {
    console.log(`   ✓ Total records in aeo_tracking: ${count}`)
  }

  // Get last 30 days data
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  console.log('\n3. Fetching Last 30 Days Data...')
  console.log('   Start date:', startDate.toISOString())

  const { data: recentData, error: recentError } = await supabase
    .from('aeo_tracking')
    .select('*')
    .gte('timestamp', startDate.toISOString())

  if (recentError) {
    console.error('❌ Query error:', recentError.message)
    process.exit(1)
  }

  console.log(`   ✓ Records found: ${recentData?.length || 0}`)

  if (recentData && recentData.length > 0) {
    console.log('\n4. Sample Data (first 3 records):')
    recentData.slice(0, 3).forEach((record, i) => {
      console.log(`   Record ${i + 1}:`)
      console.log('      Engine:', record.engine_name)
      console.log('      Source:', record.source_type)
      console.log('      Page:', record.page_path)
      console.log('      Time:', new Date(record.timestamp).toLocaleString())
    })

    // Group by engine
    const byEngine = {}
    recentData.forEach(record => {
      const engine = record.engine_name || 'Unknown'
      if (!byEngine[engine]) {
        byEngine[engine] = { crawler: 0, referral: 0, total: 0 }
      }
      byEngine[engine].total++
      if (record.source_type === 'crawler') byEngine[engine].crawler++
      if (record.source_type === 'referral') byEngine[engine].referral++
    })

    console.log('\n5. Data by Engine:')
    Object.entries(byEngine).forEach(([engine, stats]) => {
      console.log(`   ${engine}: ${stats.total} total (${stats.crawler} crawlers, ${stats.referral} referrals)`)
    })

    // Test the actual function logic
    console.log('\n6. Testing getAEOAnalytics() Logic...')

    const totalAIVisits = recentData.length
    const totalCrawlers = recentData.filter(d => d.source_type === 'crawler').length
    const totalReferrals = recentData.filter(d => d.source_type === 'referral').length
    const uniqueEngines = new Set(recentData.map(d => d.engine_name).filter(Boolean)).size
    const avgVisitsPerDay = Math.round(totalAIVisits / 30)

    console.log('   Overview Metrics:')
    console.log('      Total AI Visits:', totalAIVisits)
    console.log('      Total Crawlers:', totalCrawlers)
    console.log('      Total Referrals:', totalReferrals)
    console.log('      Unique Engines:', uniqueEngines)
    console.log('      Avg Visits/Day:', avgVisitsPerDay)

    console.log('\n✅ SUCCESS: Data is available in Supabase!')
    console.log('   If dashboard shows 0, the issue is in the API route or frontend.')

  } else {
    console.log('\n⚠️  WARNING: No data found in last 30 days')
    console.log('   This is why dashboard shows 0')

    // Check if there's any data at all
    const { data: allData, error: allError } = await supabase
      .from('aeo_tracking')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)

    if (allData && allData.length > 0) {
      console.log('   Latest record:', new Date(allData[0].timestamp).toLocaleString())
      console.log('   Data exists but is older than 30 days')
    } else {
      console.log('   Table is completely empty - no data has been tracked yet')
    }
  }

} catch (error) {
  console.error('\n❌ Error:', error.message)
  console.error(error)
  process.exit(1)
}

console.log('\n===================\n')
