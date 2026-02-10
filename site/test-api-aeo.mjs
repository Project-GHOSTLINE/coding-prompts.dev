/**
 * Test API AEO Endpoint
 * Simule un appel à /api/admin/stats pour voir ce qui est retourné
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

console.log('\n=== API AEO TEST ===\n')

// Import the function directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Replicate getAEOAnalytics function
async function getOverviewMetrics(startDate, days) {
  const { data, error } = await supabase
    .from('aeo_tracking')
    .select('source_type, engine_name, timestamp')
    .gte('timestamp', startDate.toISOString())

  console.log('getOverviewMetrics query:')
  console.log('  Error:', error?.message || 'none')
  console.log('  Rows returned:', data?.length || 0)

  if (error || !data) {
    console.error('  ❌ Error fetching overview:', error)
    return {
      totalAIVisits: 0,
      totalCrawlers: 0,
      totalReferrals: 0,
      uniqueEngines: 0,
      avgVisitsPerDay: 0,
      growthRate: 0
    }
  }

  const totalAIVisits = data.length
  const totalCrawlers = data.filter(d => d.source_type === 'crawler').length
  const totalReferrals = data.filter(d => d.source_type === 'referral').length
  const uniqueEngines = new Set(data.map(d => d.engine_name).filter(Boolean)).size
  const avgVisitsPerDay = Math.round(totalAIVisits / days)

  const midDate = new Date(startDate)
  midDate.setDate(midDate.getDate() + Math.floor(days / 2))

  const firstHalf = data.filter(d => new Date(d.timestamp) < midDate).length
  const secondHalf = data.filter(d => new Date(d.timestamp) >= midDate).length
  const growthRate = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0

  return {
    totalAIVisits,
    totalCrawlers,
    totalReferrals,
    uniqueEngines,
    avgVisitsPerDay,
    growthRate
  }
}

async function getEngineStats(startDate) {
  const { data, error } = await supabase
    .from('aeo_tracking')
    .select('engine_name, source_type, page_path, session_duration, bounce, timestamp')
    .gte('timestamp', startDate.toISOString())
    .not('engine_name', 'is', null)

  console.log('\ngetEngineStats query:')
  console.log('  Error:', error?.message || 'none')
  console.log('  Rows returned:', data?.length || 0)

  if (error || !data) {
    return []
  }

  // Grouper par engine
  const grouped = data.reduce((acc, row) => {
    const engine = row.engine_name
    if (!acc[engine]) {
      acc[engine] = {
        engine,
        crawlerVisits: 0,
        referralVisits: 0,
        pages: new Set(),
        durations: [],
        bounces: 0,
        total: 0,
        timestamps: []
      }
    }

    acc[engine].total++
    acc[engine].pages.add(row.page_path)
    acc[engine].timestamps.push(new Date(row.timestamp))

    if (row.source_type === 'crawler') {
      acc[engine].crawlerVisits++
    } else if (row.source_type === 'referral') {
      acc[engine].referralVisits++
      if (row.session_duration) {
        acc[engine].durations.push(row.session_duration)
      }
      if (row.bounce) {
        acc[engine].bounces++
      }
    }

    return acc
  }, {})

  return Object.values(grouped).map((g) => ({
    engine: g.engine,
    crawlerVisits: g.crawlerVisits,
    referralVisits: g.referralVisits,
    totalVisits: g.total,
    uniquePages: g.pages.size,
    avgDuration: g.durations.length > 0
      ? Math.round(g.durations.reduce((a, b) => a + b, 0) / g.durations.length)
      : 0,
    bounceRate: g.referralVisits > 0
      ? Math.round((g.bounces / g.referralVisits) * 100)
      : 0,
    lastVisit: new Date(Math.max(...g.timestamps.map((t) => t.getTime()))).toISOString(),
    trend: 'stable'
  })).sort((a, b) => b.totalVisits - a.totalVisits)
}

async function testAEOAnalytics() {
  try {
    const days = 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    console.log('Testing getAEOAnalytics() with days:', days)
    console.log('Start date:', startDate.toISOString())
    console.log()

    // 1. Overview metrics
    const overview = await getOverviewMetrics(startDate, days)
    console.log('\nOverview Result:')
    console.log('  ', JSON.stringify(overview, null, 2))

    // 2. Engine stats
    const byEngine = await getEngineStats(startDate)
    console.log('\nEngine Stats Result:')
    console.log('  ', JSON.stringify(byEngine, null, 2))

    // Summary
    console.log('\n=== SUMMARY ===')
    console.log('Total AI Visits:', overview.totalAIVisits)
    console.log('Total Crawlers:', overview.totalCrawlers)
    console.log('Total Referrals:', overview.totalReferrals)
    console.log('Unique Engines:', overview.uniqueEngines)
    console.log('Engines:', byEngine.length)

    if (overview.totalAIVisits === 0) {
      console.log('\n❌ PROBLEM FOUND: getAEOAnalytics returns 0')
      console.log('   This is why the dashboard shows 0')
    } else {
      console.log('\n✅ getAEOAnalytics works correctly')
      console.log('   If dashboard still shows 0, check:')
      console.log('   1. API route error handling')
      console.log('   2. Frontend data parsing')
      console.log('   3. Authentication middleware')
    }

  } catch (error) {
    console.error('\n❌ Error in testAEOAnalytics:', error.message)
    console.error(error)
  }
}

testAEOAnalytics()

console.log('\n===================\n')
