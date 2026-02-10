# 🔧 Guide de Configuration Google Analytics 4

## Objectif
Configurer Google Analytics 4 pour afficher les vraies données dans le dashboard `/admin/dashboard`.

---

## 📋 Prérequis

1. Un compte Google Cloud Platform (GCP)
2. Un compte Google Analytics 4 avec une propriété configurée
3. Accès administrateur aux deux

---

## 🚀 Étapes de Configuration

### Étape 1 : Créer un Service Account dans Google Cloud

1. **Aller sur Google Cloud Console**
   - https://console.cloud.google.com

2. **Créer ou sélectionner un projet**
   - Si nouveau projet : Cliquer "New Project"
   - Nom suggéré : "coding-prompts-analytics"

3. **Créer un Service Account**
   - Menu hamburger → IAM & Admin → Service Accounts
   - Cliquer "CREATE SERVICE ACCOUNT"

   **Informations** :
   - Service account name : `analytics-reader`
   - Service account ID : `analytics-reader@[PROJECT_ID].iam.gserviceaccount.com`
   - Description : "Read-only access to GA4 data"

   - Cliquer "CREATE AND CONTINUE"

   **Grant permissions** : (Optionnel - Skip)
   - Cliquer "CONTINUE"

   **Grant users access** : (Optionnel - Skip)
   - Cliquer "DONE"

4. **Créer une clé JSON**
   - Dans la liste des service accounts, cliquer sur celui créé
   - Onglet "KEYS"
   - "ADD KEY" → "Create new key"
   - Type : **JSON**
   - Cliquer "CREATE"

   → **Un fichier JSON sera téléchargé automatiquement** 📥

   **IMPORTANT** : Ce fichier contient des credentials sensibles. Ne jamais le commit dans git !

---

### Étape 2 : Activer l'API Google Analytics Data

1. **Dans Google Cloud Console**
   - Menu → APIs & Services → Library
   - Chercher "Google Analytics Data API"
   - Cliquer sur "Google Analytics Data API"
   - Cliquer "ENABLE"

---

### Étape 3 : Donner accès au Service Account dans GA4

1. **Aller sur Google Analytics**
   - https://analytics.google.com

2. **Accéder aux paramètres de la propriété**
   - Admin (⚙️ en bas à gauche)
   - Colonne "Property" → "Property access management"

3. **Ajouter le Service Account**
   - Cliquer "+" (Add users)
   - Email address : Coller l'email du service account
     - Format : `analytics-reader@[PROJECT_ID].iam.gserviceaccount.com`
   - Role : **Viewer** (lecture seule suffit)
   - Décocher "Notify new users by email"
   - Cliquer "Add"

---

### Étape 4 : Trouver le GA4 Property ID

1. **Dans Google Analytics**
   - Admin (⚙️ en bas à gauche)
   - Colonne "Property" → "Property settings"

2. **Copier le Property ID**
   - En haut de la page : "PROPERTY ID: XXXXXXXXX"
   - Format : Nombre de 9 chiffres (ex: `473016123`)

---

### Étape 5 : Configurer les Variables d'Environnement

1. **Ouvrir le fichier JSON téléchargé**
   - Le fichier devrait ressembler à :

   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "analytics-reader@your-project.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```

2. **Copier TOUT le contenu JSON** (pas juste certains champs)

3. **Ouvrir `.env.local`**
   ```bash
   nano site/.env.local
   ```

4. **Remplacer la section Google Services par** :

   ```bash
   # ===================================================================
   # GOOGLE SERVICES
   # ===================================================================

   # Google Analytics 4 - Service Account Credentials
   # Documentation: https://developers.google.com/analytics/devguides/reporting/data/v1
   GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...PASTE-FULL-JSON-HERE..."}'

   # GA4 Property ID (9 digits)
   GA4_PROPERTY_ID=473016123
   ```

   **IMPORTANT** :
   - Le JSON doit être sur UNE SEULE LIGNE
   - Entouré de guillemets simples `'...'`
   - Pas de retours à la ligne dans le JSON

   **Astuce** : Utiliser un outil pour minifier le JSON :
   - https://jsonformatter.org/json-minify
   - OU : `cat service-account.json | jq -c .`

5. **Sauvegarder et fermer**

---

### Étape 6 : Tester la Configuration

1. **Redémarrer le serveur Next.js**
   ```bash
   cd site
   npm run dev
   ```

2. **Se connecter au dashboard**
   - http://localhost:3000/admin/login
   - Email: `admin@coding-prompts.dev`
   - Password: `FredRosa%1978`

3. **Vérifier le dashboard**
   - http://localhost:3000/admin/dashboard

   **✅ Succès si** :
   - Les métriques affichent des nombres (pas "N/A")
   - Les graphiques contiennent des données
   - Aucune erreur dans la console navigateur
   - Aucune erreur "Google Analytics credentials not configured" dans les logs serveur

4. **Vérifier les logs serveur**
   ```bash
   # Dans le terminal où npm run dev tourne
   # Chercher :
   ✅ Pas d'erreurs "Google Analytics error"
   ✅ Pas d'erreurs "AI Traffic error"
   ✅ Pas d'erreurs "Content Performance error"
   ```

---

## 🚨 Troubleshooting

### Erreur : "Google Analytics credentials not configured"
→ Vérifier que `GOOGLE_SERVICE_ACCOUNT_JSON` est bien défini dans `.env.local`

### Erreur : "GA4 Property ID not configured"
→ Vérifier que `GA4_PROPERTY_ID` est bien défini dans `.env.local`

### Erreur : "Permission denied" ou "PERMISSION_DENIED"
→ Le service account n'a pas accès à la propriété GA4
→ Retourner à l'Étape 3 et ajouter le service account

### Erreur : "Invalid JSON"
→ Le JSON du service account est mal formaté
→ Vérifier qu'il n'y a pas de retours à la ligne
→ Vérifier les guillemets (simples autour, doubles à l'intérieur)

### Le dashboard affiche toujours "N/A"
1. Vérifier que l'API Google Analytics Data est activée (Étape 2)
2. Vérifier les logs serveur pour des erreurs spécifiques
3. Vérifier que le Property ID est correct (9 chiffres)
4. Attendre 24-48h si la propriété GA4 est toute nouvelle (pas encore de données)

---

## 📝 Exemple Complet .env.local

```bash
# Local development environment variables

# ===================================================================
# ADMIN AUTHENTICATION
# ===================================================================
JWT_SECRET=bm/2kN62qjywXFj4Y8qec6huYr8Jvw75VDjEcDyA+KbNUF+pRZl9/5j5AqdDk/7ii/HlWIJH2D8vfC8M5CQ5JA==
ADMIN_EMAIL=admin@coding-prompts.dev
ADMIN_PASSWORD=FredRosa%1978

# ===================================================================
# SUPABASE - Base de Données (Analytics Storage)
# ===================================================================
NEXT_PUBLIC_SUPABASE_URL=https://dllyzfuqjzuhvshrlmuq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbHl6ZnVxanp1aHZzaHJsbXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTU5ODEsImV4cCI6MjA4MTU3MTk4MX0.xskVblRlKdbTST1Mdgz76oR7N2rDq8ZOUgaN-f_TTM4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbHl6ZnVxanp1aHZzaHJsbXVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTk4MSwiZXhwIjoyMDgxNTcxOTgxfQ.Qg5eQwDxeAtTDXplNkQZa4hOp_dSMBIu_DKbuquryFo

# ===================================================================
# GOOGLE SERVICES
# ===================================================================
# Google Analytics 4 - Service Account Credentials
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project-id","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...FULL-KEY-HERE...\n-----END PRIVATE KEY-----\n","client_email":"analytics-reader@your-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://..."}'

# GA4 Property ID
GA4_PROPERTY_ID=473016123
```

---

## ✅ Checklist Finale

Avant de considérer la configuration terminée :

- [ ] Service Account créé dans Google Cloud
- [ ] API Google Analytics Data activée
- [ ] Clé JSON téléchargée
- [ ] Service Account ajouté à GA4 avec rôle Viewer
- [ ] Property ID copié
- [ ] JSON minifié et ajouté à `.env.local`
- [ ] Property ID ajouté à `.env.local`
- [ ] Serveur redémarré
- [ ] Dashboard testé et affiche des données
- [ ] Aucune erreur dans les logs

---

## 📚 Ressources

- [Google Analytics Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Service Account Authentication](https://cloud.google.com/docs/authentication/getting-started)
- [GA4 Property Settings](https://support.google.com/analytics/answer/9304153)

---

**Dernière mise à jour** : 2026-02-10
**Status** : ✅ Guide complet
