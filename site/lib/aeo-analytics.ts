/**
 * AEO Analytics - Answer Engine Optimization Data
 *
 * Récupère les données de tracking AEO depuis Supabase:
 * - Visites des crawlers AI
 * - Trafic référé par les AI engines
 * - Statistiques par moteur
 * - Timeline et tendances
 *
 * Date: 2026-02-10
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ============================================================================
// INTERFACES
// ============================================================================

export interface AEOStats {
  overview: {
    totalAIVisits: number
    totalCrawlers: number
    totalReferrals: number
    uniqueEngines: number
    avgVisitsPerDay: number
    growthRate: number
  }
  byEngine: Array<{
    engine: string
    crawlerVisits: number
    referralVisits: number
    totalVisits: number
    uniquePages: number
    avgDuration: number
    bounceRate: number
    lastVisit: string
    trend: 'up' | 'down' | 'stable'
  }>
  timeline: Array<{
    date: string
    crawlers: number
    referrals: number
    total: number
    topEngine: string
  }>
  topPages: Array<{
    path: string
    aiVisits: number
    crawlerVisits: number
    referralVisits: number
    uniqueEngines: number
    topEngine: string
    aeoScore: number
  }>
  crawlerActivity: Array<{
    engine: string
    visits: number
    pagesScanned: number
    lastScan: string
    scanFrequency: string
  }>
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Récupère toutes les statistiques AEO
 */
export async function getAEOAnalytics(days: number = 30): Promise<AEOStats> {
  try {
    // Calculer la date de début
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 1. Overview metrics
    const overview = await getOverviewMetrics(startDate, days)

    // 2. Stats par engine
    const byEngine = await getEngineStats(startDate)

    // 3. Timeline quotidienne
    const timeline = await getTimeline(startDate)

    // 4. Top pages
    const topPages = await getTopPages(startDate)

    // 5. Activité des crawlers
    const crawlerActivity = await getCrawlerActivity(startDate)

    return {
      overview,
      byEngine,
      timeline,
      topPages,
      crawlerActivity
    }
  } catch (error) {
    console.error('Error fetching AEO analytics:', error)

    // Retourner des données vides en cas d'erreur
    return {
      overview: {
        totalAIVisits: 0,
        totalCrawlers: 0,
        totalReferrals: 0,
        uniqueEngines: 0,
        avgVisitsPerDay: 0,
        growthRate: 0
      },
      byEngine: [],
      timeline: [],
      topPages: [],
      crawlerActivity: []
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * 1. Métriques générales
 */
async function getOverviewMetrics(startDate: Date, days: number) {
  const { data, error } = await supabase
    .from('aeo_tracking')
    .select('source_type, engine_name, timestamp')
    .gte('timestamp', startDate.toISOString())

  if (error || !data) {
    console.error('Error fetching overview:', error)
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

  // Calculer le growth rate (comparaison première moitié vs deuxième moitié)
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

/**
 * 2. Stats par moteur AI
 */
async function getEngineStats(startDate: Date) {
  const { data, error } = await supabase
    .from('aeo_tracking')
    .select('engine_name, source_type, page_path, session_duration, bounce, timestamp')
    .gte('timestamp', startDate.toISOString())
    .not('engine_name', 'is', null)

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
  }, {} as Record<string, any>)

  // Transformer en array et calculer les metrics
  return Object.values(grouped).map((g: any) => ({
    engine: g.engine,
    crawlerVisits: g.crawlerVisits,
    referralVisits: g.referralVisits,
    totalVisits: g.total,
    uniquePages: g.pages.size,
    avgDuration: g.durations.length > 0
      ? Math.round(g.durations.reduce((a: number, b: number) => a + b, 0) / g.durations.length)
      : 0,
    bounceRate: g.referralVisits > 0
      ? Math.round((g.bounces / g.referralVisits) * 100)
      : 0,
    lastVisit: new Date(Math.max(...g.timestamps.map((t: Date) => t.getTime()))).toISOString(),
    trend: 'stable' as const // TODO: calculer la tendance
  })).sort((a, b) => b.totalVisits - a.totalVisits)
}

/**
 * 3. Timeline quotidienne
 */
async function getTimeline(startDate: Date) {
  const { data, error } = await supabase
    .from('aeo_tracking')
    .select('timestamp, source_type, engine_name')
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: true })

  if (error || !data) {
    return []
  }

  // Grouper par jour
  const grouped = data.reduce((acc, row) => {
    const date = new Date(row.timestamp).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = {
        date,
        crawlers: 0,
        referrals: 0,
        engines: {} as Record<string, number>
      }
    }

    if (row.source_type === 'crawler') {
      acc[date].crawlers++
    } else if (row.source_type === 'referral') {
      acc[date].referrals++
    }

    if (row.engine_name) {
      acc[date].engines[row.engine_name] = (acc[date].engines[row.engine_name] || 0) + 1
    }

    return acc
  }, {} as Record<string, any>)

  return Object.values(grouped).map((g: any) => {
    const topEngine = Object.entries(g.engines)
      .sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || 'Unknown'

    return {
      date: g.date,
      crawlers: g.crawlers,
      referrals: g.referrals,
      total: g.crawlers + g.referrals,
      topEngine
    }
  })
}

/**
 * 4. Top pages par trafic AI
 */
async function getTopPages(startDate: Date) {
  const { data, error } = await supabase
    .from('aeo_tracking')
    .select('page_path, source_type, engine_name')
    .gte('timestamp', startDate.toISOString())

  if (error || !data) {
    return []
  }

  // Grouper par page
  const grouped = data.reduce((acc, row) => {
    const path = row.page_path
    if (!acc[path]) {
      acc[path] = {
        path,
        aiVisits: 0,
        crawlerVisits: 0,
        referralVisits: 0,
        engines: new Set()
      }
    }

    acc[path].aiVisits++
    if (row.source_type === 'crawler') {
      acc[path].crawlerVisits++
    } else if (row.source_type === 'referral') {
      acc[path].referralVisits++
    }

    if (row.engine_name) {
      acc[path].engines.add(row.engine_name)
    }

    return acc
  }, {} as Record<string, any>)

  // Calculer le score AEO et trier
  return Object.values(grouped)
    .map((g: any) => {
      const uniqueEngines = g.engines.size
      const topEngine = Array.from(g.engines)[0] as string || 'Unknown'

      // Score AEO simple (à améliorer)
      const aeoScore = Math.round(
        (g.aiVisits / 10) * 30 + // Volume
        (uniqueEngines / 7) * 40 + // Diversité
        (g.referralVisits / Math.max(g.aiVisits, 1)) * 30 // Ratio referral
      )

      return {
        path: g.path,
        aiVisits: g.aiVisits,
        crawlerVisits: g.crawlerVisits,
        referralVisits: g.referralVisits,
        uniqueEngines,
        topEngine,
        aeoScore: Math.min(aeoScore, 100)
      }
    })
    .sort((a, b) => b.aiVisits - a.aiVisits)
    .slice(0, 20)
}

/**
 * 5. Activité des crawlers
 */
async function getCrawlerActivity(startDate: Date) {
  const { data, error } = await supabase
    .from('aeo_tracking')
    .select('engine_name, page_path, timestamp')
    .eq('source_type', 'crawler')
    .gte('timestamp', startDate.toISOString())
    .not('engine_name', 'is', null)

  if (error || !data) {
    return []
  }

  // Grouper par engine
  const grouped = data.reduce((acc, row) => {
    const engine = row.engine_name
    if (!acc[engine]) {
      acc[engine] = {
        engine,
        visits: 0,
        pages: new Set(),
        timestamps: []
      }
    }

    acc[engine].visits++
    acc[engine].pages.add(row.page_path)
    acc[engine].timestamps.push(new Date(row.timestamp))

    return acc
  }, {} as Record<string, any>)

  return Object.values(grouped).map((g: any) => {
    const timestamps = g.timestamps.sort((a: Date, b: Date) => a.getTime() - b.getTime())
    const lastScan = timestamps[timestamps.length - 1].toISOString()

    // Calculer la fréquence moyenne entre scans
    const intervals = []
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push((timestamps[i].getTime() - timestamps[i - 1].getTime()) / (1000 * 60 * 60 * 24))
    }
    const avgInterval = intervals.length > 0
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 0

    let scanFrequency = 'Unknown'
    if (avgInterval < 1) scanFrequency = 'Multiple times/day'
    else if (avgInterval < 7) scanFrequency = 'Daily'
    else if (avgInterval < 30) scanFrequency = 'Weekly'
    else scanFrequency = 'Monthly'

    return {
      engine: g.engine,
      visits: g.visits,
      pagesScanned: g.pages.size,
      lastScan,
      scanFrequency
    }
  }).sort((a, b) => b.visits - a.visits)
}
