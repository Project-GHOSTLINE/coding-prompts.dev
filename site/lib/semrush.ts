const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY || '0c83e99dd9e328d1c53035bd66c59e54'
const SEMRUSH_API_URL = 'https://api.semrush.com'

export interface KeywordData {
  keyword: string
  position: number
  volume: number
  traffic: number
  url: string
}

export interface SEMrushStats {
  totalKeywords: number | string
  avgPosition: number | string
  estimatedTraffic: number | string
  totalBacklinks: number | string
  topKeywords: KeywordData[]
}

export async function getSEMrushData(domain: string): Promise<SEMrushStats> {
  if (!SEMRUSH_API_KEY || SEMRUSH_API_KEY === '0c83e99dd9e328d1c53035bd66c59e54') {
    console.log('SEMrush API: Using real API key')
  }

  try {
    // Get organic keywords data
    const keywordsResponse = await fetch(
      `${SEMRUSH_API_URL}/?type=domain_organic&key=${SEMRUSH_API_KEY}&display_limit=100&export_columns=Ph,Po,Nq,Tr,Ur&domain=${domain}&database=us`,
      { cache: 'no-store' }
    )

    if (!keywordsResponse.ok) {
      console.error(`SEMrush API error: ${keywordsResponse.status}`)
      throw new Error(`SEMrush API error: ${keywordsResponse.status}`)
    }

    const keywordsText = await keywordsResponse.text()
    const lines = keywordsText.trim().split('\n')

    // Check if we got an error response
    if (lines[0].includes('ERROR')) {
      console.error('SEMrush API returned error:', lines[0])
      throw new Error(lines[0])
    }

    // Parse CSV-like response
    const keywords: KeywordData[] = []
    let totalPosition = 0

    for (let i = 1; i < lines.length; i++) {
      // Skip header
      const parts = lines[i].split(';')
      if (parts.length >= 5) {
        const keyword: KeywordData = {
          keyword: parts[0],
          position: parseFloat(parts[1]) || 0,
          volume: parseInt(parts[2]) || 0,
          traffic: parseFloat(parts[3]) || 0,
          url: parts[4] || ''
        }
        keywords.push(keyword)
        totalPosition += keyword.position
      }
    }

    // If no keywords found, return N/A
    if (keywords.length === 0) {
      console.log('SEMrush: No keywords found for domain')
      return {
        totalKeywords: 0,
        avgPosition: 'N/A',
        estimatedTraffic: 0,
        totalBacklinks: 'N/A',
        topKeywords: []
      }
    }

    // Calculate stats
    const avgPosition = keywords.length > 0 ? totalPosition / keywords.length : 0
    const estimatedTraffic = keywords.reduce((sum, kw) => sum + kw.traffic, 0)

    // Get top 10 keywords by traffic
    const topKeywords = keywords
      .sort((a, b) => b.traffic - a.traffic)
      .slice(0, 10)

    // Get backlinks count (separate API call)
    let totalBacklinks: number | string = 'N/A'
    try {
      const backlinksResponse = await fetch(
        `${SEMRUSH_API_URL}/?type=backlinks_overview&key=${SEMRUSH_API_KEY}&target=${domain}&target_type=root_domain&display_limit=1`,
        { cache: 'no-store' }
      )

      if (backlinksResponse.ok) {
        const backlinksText = await backlinksResponse.text()
        const backlinksLines = backlinksText.trim().split('\n')
        if (backlinksLines.length > 1 && !backlinksLines[0].includes('ERROR')) {
          const parts = backlinksLines[1].split(';')
          totalBacklinks = parseInt(parts[0]) || 0
        }
      }
    } catch (error) {
      console.error('Backlinks API error:', error)
    }

    return {
      totalKeywords: keywords.length,
      avgPosition: Math.round(avgPosition * 10) / 10,
      estimatedTraffic: Math.round(estimatedTraffic),
      totalBacklinks,
      topKeywords
    }
  } catch (error) {
    console.error('SEMrush API error:', error)
    // Return N/A on error - NO MOCK DATA
    throw error
  }
}
