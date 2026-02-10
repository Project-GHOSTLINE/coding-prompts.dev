# 📋 INSTRUCTIONS: Créer la Table AEO dans Supabase

**Date**: 2026-02-10
**Durée**: 2 minutes

---

## 🎯 OBJECTIF

Créer la table `aeo_tracking` dans Supabase pour stocker les visites AI (crawlers + referrals).

---

## 📝 ÉTAPES

### 1. Ouvrir le Supabase Dashboard

Ouvre ce lien dans ton navigateur:

```
https://supabase.com/dashboard/project/dllyzfuqjzuhvshrlmuq
```

### 2. Aller dans SQL Editor

- Dans la sidebar gauche, clique sur **"SQL Editor"**
- Ou va directement sur: https://supabase.com/dashboard/project/dllyzfuqjzuhvshrlmuq/sql/new

### 3. Créer une nouvelle query

- Clique sur **"New Query"** (bouton en haut)

### 4. Copier-coller le SQL

**Ouvre le fichier**:
```
site/supabase-aeo-schema.sql
```

**Copie TOUT le contenu** (Cmd+A, Cmd+C)

**Colle dans le SQL Editor** (Cmd+V)

### 5. Exécuter le SQL

- Clique sur **"Run"** (bouton en haut à droite)
- Ou utilise le raccourci: **Cmd+Enter** (Mac) ou **Ctrl+Enter** (Windows)

### 6. Vérifier qu'il n'y a pas d'erreurs

Tu devrais voir un message de succès en vert: **"Success. No rows returned"**

Si tu vois des erreurs, copie-les et envoie-les moi.

---

## ✅ VÉRIFICATION

Une fois le SQL exécuté, vérifie que la table existe:

### Via SQL Editor:

```sql
SELECT COUNT(*) FROM aeo_tracking;
```

Tu devrais voir: `count: 8` (8 données de test)

### Via Terminal:

```bash
node site/test-aeo-tracking.mjs
```

Tu devrais voir des visites de test insérées.

---

## 📊 CE QUI EST CRÉÉ

### Table: `aeo_tracking`
- Stocke toutes les visites AI
- 8 données de test incluses

### Index (6):
- `idx_aeo_timestamp` - Pour tri par date
- `idx_aeo_engine` - Pour filtrer par moteur
- `idx_aeo_source_type` - Pour filtrer par type
- `idx_aeo_page_path` - Pour stats par page
- `idx_aeo_engine_timestamp` - Pour queries combinées
- `idx_aeo_session_id` - Pour tracking de sessions

### Vues (3):
- `aeo_by_engine` - Stats par moteur AI
- `aeo_top_pages` - Top pages par trafic AI
- `aeo_daily_timeline` - Timeline quotidienne

### Fonction:
- `calculate_aeo_score(page_path, days)` - Calcule le score AEO

---

## 🧪 QUERIES DE TEST

Après création, teste ces queries dans le SQL Editor:

```sql
-- Voir toutes les visites
SELECT * FROM aeo_tracking ORDER BY timestamp DESC;

-- Stats par moteur
SELECT * FROM aeo_by_engine;

-- Top pages
SELECT * FROM aeo_top_pages LIMIT 10;

-- Score AEO de la homepage
SELECT * FROM calculate_aeo_score('/', 30);
```

---

## ❓ PROBLÈMES ?

### Erreur: "relation does not exist"
→ La table n'a pas été créée, réessaye l'étape 5

### Erreur: "permission denied"
→ Vérifie que tu es bien connecté comme propriétaire du projet

### Erreur: "syntax error"
→ Vérifie que tu as copié TOUT le contenu du fichier SQL

---

## ✨ PROCHAINE ÉTAPE

Une fois la table créée avec succès:

```bash
# Tester le tracking
node site/test-aeo-tracking.mjs

# Démarrer le serveur dev (le middleware trackera automatiquement)
npm run dev
```

Le middleware est déjà configuré pour tracker automatiquement toutes les visites AI! 🚀

---

**Dernière mise à jour**: 2026-02-10
