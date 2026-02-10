-- ==============================================================================
-- AEO TRACKING TABLE - Answer Engine Optimization
-- ==============================================================================
-- Table pour tracker les visites des crawlers AI et le trafic référé par les AI engines
-- Date: 2026-02-10
-- ==============================================================================

-- Supprimer la table si elle existe (dev seulement)
DROP TABLE IF EXISTS aeo_tracking CASCADE;

-- Créer la table principale
CREATE TABLE aeo_tracking (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Source de la visite
  source_type TEXT NOT NULL CHECK (source_type IN ('crawler', 'referral', 'organic')),
  engine_name TEXT, -- 'ChatGPT', 'Claude', 'Perplexity', 'Gemini', 'Copilot', etc.

  -- Informations de la requête
  user_agent TEXT,
  referrer TEXT,
  ip_address INET,

  -- Informations de la page
  page_path TEXT NOT NULL,
  page_title TEXT,

  -- Informations de session
  session_id TEXT, -- Pour tracker les sessions multi-pages
  session_duration INTEGER, -- En secondes
  pages_viewed INTEGER DEFAULT 1,
  bounce BOOLEAN DEFAULT TRUE,

  -- Métadonnées additionnelles
  metadata JSONB
);

-- ==============================================================================
-- INDEX POUR PERFORMANCE
-- ==============================================================================

-- Index sur timestamp pour queries temporelles
CREATE INDEX idx_aeo_timestamp ON aeo_tracking(timestamp DESC);

-- Index sur engine_name pour grouper par moteur
CREATE INDEX idx_aeo_engine ON aeo_tracking(engine_name) WHERE engine_name IS NOT NULL;

-- Index sur source_type pour filtrer par type
CREATE INDEX idx_aeo_source_type ON aeo_tracking(source_type);

-- Index sur page_path pour analytics par page
CREATE INDEX idx_aeo_page_path ON aeo_tracking(page_path);

-- Index composé pour queries fréquentes (engine + timestamp)
CREATE INDEX idx_aeo_engine_timestamp ON aeo_tracking(engine_name, timestamp DESC) WHERE engine_name IS NOT NULL;

-- Index sur session_id pour tracking de sessions
CREATE INDEX idx_aeo_session_id ON aeo_tracking(session_id) WHERE session_id IS NOT NULL;

-- ==============================================================================
-- VUES POUR ANALYTICS
-- ==============================================================================

-- Vue: Résumé par moteur AI
CREATE OR REPLACE VIEW aeo_by_engine AS
SELECT
  engine_name,
  source_type,
  COUNT(*) as total_visits,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT page_path) as unique_pages,
  AVG(session_duration) as avg_duration,
  AVG(pages_viewed) as avg_pages_per_visit,
  (COUNT(*) FILTER (WHERE bounce = false)::FLOAT / NULLIF(COUNT(*), 0) * 100) as engagement_rate,
  DATE_TRUNC('day', MAX(timestamp)) as last_visit
FROM aeo_tracking
WHERE engine_name IS NOT NULL
GROUP BY engine_name, source_type
ORDER BY total_visits DESC;

-- Vue: Top pages par trafic AI
CREATE OR REPLACE VIEW aeo_top_pages AS
SELECT
  page_path,
  COUNT(*) as total_visits,
  COUNT(DISTINCT engine_name) as engines_count,
  AVG(session_duration) as avg_duration,
  AVG(pages_viewed) as avg_pages_viewed,
  (COUNT(*) FILTER (WHERE bounce = false)::FLOAT / NULLIF(COUNT(*), 0) * 100) as engagement_rate,
  ARRAY_AGG(DISTINCT engine_name) FILTER (WHERE engine_name IS NOT NULL) as engines
FROM aeo_tracking
WHERE source_type IN ('crawler', 'referral')
GROUP BY page_path
ORDER BY total_visits DESC
LIMIT 50;

-- Vue: Timeline du trafic AI (par jour)
CREATE OR REPLACE VIEW aeo_daily_timeline AS
SELECT
  DATE_TRUNC('day', timestamp) as day,
  source_type,
  engine_name,
  COUNT(*) as visits,
  COUNT(DISTINCT session_id) as unique_sessions
FROM aeo_tracking
WHERE timestamp >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', timestamp), source_type, engine_name
ORDER BY day DESC, visits DESC;

-- ==============================================================================
-- FONCTIONS HELPER
-- ==============================================================================

-- Fonction: Calculer le score AEO d'une page
CREATE OR REPLACE FUNCTION calculate_aeo_score(target_page TEXT, days INTEGER DEFAULT 30)
RETURNS TABLE(
  page_path TEXT,
  aeo_score NUMERIC,
  ai_traffic INTEGER,
  organic_traffic INTEGER,
  ai_ratio NUMERIC,
  avg_duration INTEGER,
  engagement_rate NUMERIC,
  engines_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.page_path,
    -- Score AEO (0-100)
    ROUND(
      (COUNT(*) FILTER (WHERE t.source_type IN ('crawler', 'referral'))::FLOAT / NULLIF(COUNT(*), 0) * 30) + -- 30% ratio AI traffic
      (LEAST(COUNT(*) FILTER (WHERE t.source_type IN ('crawler', 'referral')), 1000)::FLOAT / 1000 * 25) + -- 25% volume AI
      (LEAST(AVG(t.session_duration), 600)::FLOAT / 600 * 20) + -- 20% engagement
      (COUNT(DISTINCT t.engine_name)::FLOAT / 7 * 10) -- 10% diversité engines (max 7)
    , 2) as aeo_score,

    COUNT(*) FILTER (WHERE t.source_type IN ('crawler', 'referral'))::INTEGER as ai_traffic,
    COUNT(*) FILTER (WHERE t.source_type = 'organic')::INTEGER as organic_traffic,
    ROUND((COUNT(*) FILTER (WHERE t.source_type IN ('crawler', 'referral'))::FLOAT / NULLIF(COUNT(*), 0) * 100), 2) as ai_ratio,
    ROUND(AVG(t.session_duration))::INTEGER as avg_duration,
    ROUND((COUNT(*) FILTER (WHERE t.bounce = false)::FLOAT / NULLIF(COUNT(*), 0) * 100), 2) as engagement_rate,
    COUNT(DISTINCT t.engine_name)::INTEGER as engines_count
  FROM aeo_tracking t
  WHERE t.page_path = target_page
    AND t.timestamp >= NOW() - (days || ' days')::INTERVAL
  GROUP BY t.page_path;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- POLITIQUES RLS (Row Level Security) - Optionnel
-- ==============================================================================

-- Activer RLS
ALTER TABLE aeo_tracking ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs anonymes peuvent insérer (pour le tracking)
CREATE POLICY "Allow anonymous insert" ON aeo_tracking
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Politique: Seulement les admins peuvent lire
CREATE POLICY "Allow admin read" ON aeo_tracking
  FOR SELECT
  TO authenticated
  USING (true);

-- ==============================================================================
-- DONNÉES DE TEST (Optionnel - à supprimer en prod)
-- ==============================================================================

-- Insérer quelques données de test
INSERT INTO aeo_tracking (source_type, engine_name, user_agent, referrer, page_path, page_title, session_id, session_duration, pages_viewed, bounce) VALUES
  -- Crawlers
  ('crawler', 'ChatGPT', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0', '', '/', 'Homepage', NULL, NULL, 1, TRUE),
  ('crawler', 'ClaudeBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0', '', '/troubleshooting/exit-code-1', 'Exit Code 1', NULL, NULL, 1, TRUE),
  ('crawler', 'PerplexityBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0', '', '/features/sequential-thinking', 'Sequential Thinking', NULL, NULL, 1, TRUE),

  -- Referrals depuis AI engines
  ('referral', 'ChatGPT', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'https://chat.openai.com/', '/', 'Homepage', 'sess-001', 245, 3, FALSE),
  ('referral', 'Claude', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'https://claude.ai/chat/', '/troubleshooting/exit-code-1', 'Exit Code 1', 'sess-002', 420, 5, FALSE),
  ('referral', 'Perplexity', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'https://www.perplexity.ai/', '/setup/installation', 'Installation', 'sess-003', 180, 2, FALSE),

  -- Trafic organique
  ('organic', NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'https://google.com/', '/', 'Homepage', 'sess-004', 60, 1, TRUE),
  ('organic', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'https://google.com/search?q=claude+code', '/setup/installation', 'Installation', 'sess-005', 150, 2, FALSE);

-- ==============================================================================
-- QUERIES UTILES POUR ANALYTICS
-- ==============================================================================

-- Résumé global du trafic AI
-- SELECT * FROM aeo_by_engine;

-- Top 10 pages par trafic AI
-- SELECT * FROM aeo_top_pages LIMIT 10;

-- Score AEO de la homepage
-- SELECT * FROM calculate_aeo_score('/', 30);

-- Trafic AI des 7 derniers jours
-- SELECT day, engine_name, visits
-- FROM aeo_daily_timeline
-- WHERE day >= NOW() - INTERVAL '7 days'
-- ORDER BY day DESC, visits DESC;

-- Ratio AI vs Organic par page
-- SELECT
--   page_path,
--   COUNT(*) FILTER (WHERE source_type IN ('crawler', 'referral')) as ai_traffic,
--   COUNT(*) FILTER (WHERE source_type = 'organic') as organic_traffic,
--   ROUND(
--     COUNT(*) FILTER (WHERE source_type IN ('crawler', 'referral'))::FLOAT /
--     NULLIF(COUNT(*), 0) * 100,
--     2
--   ) as ai_percentage
-- FROM aeo_tracking
-- WHERE timestamp >= NOW() - INTERVAL '30 days'
-- GROUP BY page_path
-- ORDER BY ai_traffic DESC
-- LIMIT 20;
