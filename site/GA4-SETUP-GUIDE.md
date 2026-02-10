# Google Analytics 4 - Configuration Guide AEO

## Custom Dimensions à créer dans GA4

Pour activer le tracking avancé AI, configure ces dimensions custom dans GA4:

### Accès à la configuration
1. Ouvre Google Analytics 4
2. Admin → Property → Custom Definitions
3. Click "Create custom dimension"

### Dimensions à créer

| Dimension Name | Event Parameter | Scope | Description |
|----------------|----------------|-------|-------------|
| **AI Engine** | `ai_engine` | User | Moteur IA (ChatGPT, Claude, Gemini, etc.) |
| **AI Traffic Type** | `ai_traffic_type` | Session | Type de trafic (crawler, referral) |
| **Content Type** | `content_type` | Event | Type de contenu (troubleshooting, setup, features) |
| **Page Category** | `page_category` | Event | Catégorie de page |

### Custom Metrics (Optionnel)

| Metric Name | Event Parameter | Unit | Description |
|-------------|----------------|------|-------------|
| **AI Session Score** | `ai_session_score` | Standard | Score qualité session AI |
| **Citation Likelihood** | `citation_likelihood` | Standard | Probabilité de citation |

---

## Événements Custom Trackés

Les événements suivants sont automatiquement envoyés à GA4:

### 1. `ai_crawler_visit`
Déclenché quand un crawler AI visite le site

**Paramètres:**
- `ai_engine`: Nom du moteur (ChatGPT, Claude, etc.)
- `user_agent`: User-agent du crawler
- `event_category`: "AI Traffic"

### 2. `ai_citation`
Déclenché quand du contenu est potentiellement cité

**Paramètres:**
- `ai_engine`: Moteur qui cite
- `cited_content`: Extrait cité
- `page_path`: Page citée
- `event_category`: "AEO"

### 3. `search_query`
Track les requêtes de recherche (organic ou AI)

**Paramètres:**
- `search_query`: Requête
- `search_source`: "organic" ou "ai"
- `ai_engine`: Moteur AI (si applicable)
- `event_category`: "Search"

### 4. `content_engagement`
Interactions avec le contenu

**Paramètres:**
- `content_type`: Type de contenu
- `engagement_action`: Action (scroll, copy, click)
- `engagement_value`: Valeur numérique
- `event_category`: "Content"

### 5. `code_copy`
Quand un code snippet est copié

**Paramètres:**
- `code_language`: Langage du code
- `code_length`: Longueur du code
- `event_category`: "Content Interaction"

### 6. `scroll_depth`
Profondeur de scroll

**Paramètres:**
- `scroll_percentage`: % scrollé (25, 50, 75, 100)
- `event_category`: "Engagement"

---

## Rapports Recommandés

### Exploration 1: AI Traffic Analysis
**Dimensions:**
- AI Engine
- Page Path
- Session Source

**Metrics:**
- Sessions
- Page Views
- Engagement Rate

### Exploration 2: Content Performance by AI Engine
**Dimensions:**
- Content Type
- AI Engine
- Landing Page

**Metrics:**
- Sessions
- Average Engagement Time
- Bounce Rate

### Exploration 3: Citation Tracking
**Dimensions:**
- AI Engine
- Cited Content
- Page Category

**Metrics:**
- Event Count
- Total Users

---

## User Properties Configurées

Ces propriétés sont automatiquement définies:

- `traffic_type`: "ai" ou "organic"
- `ai_engine`: Moteur AI identifié
- `content_category`: Catégorie de contenu visitée

---

## Vérification de la Configuration

### Test rapide
1. Ouvre Google Analytics 4
2. Va dans Realtime
3. Visite le site depuis un user-agent AI simulé
4. Vérifie que l'événement `ai_crawler_visit` apparaît
5. Check les custom dimensions dans les détails de l'événement

### User-Agent Test
```bash
curl -A "ChatGPT-User/1.0" https://coding-prompts.dev/troubleshooting/exit-code-1
```

### Debug Mode
Pour activer le debug dans le navigateur:
```javascript
gtag('config', 'G-24Q7ZZ71LB', { debug_mode: true })
```

Puis ouvre Chrome DevTools → Network → Filter "collect" pour voir les requêtes GA4.

---

## Filtres Recommandés

### Segment: AI Traffic Only
```
User Property: traffic_type = ai
```

### Segment: ChatGPT Traffic
```
User Property: ai_engine = ChatGPT
```

### Segment: High-Value Content
```
Event: content_engagement
Parameter: engagement_value > 50
```

---

## Exportation vers BigQuery (Optionnel)

Pour analyse avancée, exporte les données vers BigQuery:

1. Admin → Property → BigQuery Linking
2. Link to BigQuery
3. Configure daily export

Requête SQL exemple:
```sql
SELECT
  event_name,
  user_properties.value.string_value AS ai_engine,
  COUNT(*) as event_count
FROM `project.analytics_XXXXXX.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260201' AND '20260228'
  AND event_name = 'ai_crawler_visit'
GROUP BY event_name, ai_engine
ORDER BY event_count DESC
```

---

**Dernière mise à jour:** 2026-02-03
**Status:** ✅ Configured and Active
