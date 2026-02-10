# Configuration Google Services pour AEO Dashboard

Ce guide explique comment configurer Google Search Console et Google Analytics 4 pour le dashboard AEO de coding-prompts.dev.

## Prérequis

- Accès à Google Cloud Console
- Propriétaire du site coding-prompts.dev dans Google Search Console
- Accès Admin à la propriété Google Analytics 4

---

## 1. Créer un Service Account Google

### Étape 1: Google Cloud Console

1. Aller sur https://console.cloud.google.com/
2. Créer un nouveau projet (ou utiliser un existant)
   - Nom: `coding-prompts-aeo-dashboard`
3. Aller dans **IAM & Admin** > **Service Accounts**
4. Cliquer sur **Create Service Account**
   - Nom: `aeo-dashboard`
   - Description: `Service account pour le dashboard AEO`
5. Cliquer sur **Create and Continue**
6. **Rôles**: Aucun rôle nécessaire pour le moment (skip)
7. Cliquer sur **Done**

### Étape 2: Créer la clé JSON

1. Dans la liste des Service Accounts, cliquer sur celui que vous venez de créer
2. Aller dans l'onglet **Keys**
3. Cliquer sur **Add Key** > **Create new key**
4. Choisir **JSON**
5. Télécharger le fichier JSON
6. **⚠️ IMPORTANT**: Ce fichier contient des credentials sensibles - NE JAMAIS le commiter!

### Étape 3: Activer les APIs

1. Dans Google Cloud Console, aller dans **APIs & Services** > **Library**
2. Activer les APIs suivantes:
   - **Google Search Console API**
   - **Google Analytics Data API** (v1)

---

## 2. Configurer Google Search Console

### Étape 1: Ajouter le Service Account

1. Aller sur https://search.google.com/search-console
2. Sélectionner votre propriété: `https://coding-prompts.dev`
3. Aller dans **Settings** (engrenage en bas à gauche)
4. Cliquer sur **Users and permissions**
5. Cliquer sur **Add user**
6. Email: Copier le `client_email` de votre fichier JSON (format: `xxx@xxx.iam.gserviceaccount.com`)
7. Permission: **Full** (ou **Owner** si disponible)
8. Cliquer sur **Add**

### Vérifier la configuration

```bash
# Tester l'accès à l'API
curl "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fcoding-prompts.dev%2F" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)"
```

---

## 3. Configurer Google Analytics 4

### Étape 1: Trouver votre Property ID

1. Aller sur https://analytics.google.com/
2. Cliquer sur **Admin** (engrenage en bas à gauche)
3. Dans la colonne **Property**, cliquer sur **Property Settings**
4. Noter le **Property ID** (format: `123456789`)

### Étape 2: Ajouter le Service Account

1. Toujours dans **Admin**
2. Dans la colonne **Property**, cliquer sur **Property Access Management**
3. Cliquer sur le bouton **+** (Add users)
4. Email: Copier le `client_email` de votre fichier JSON
5. Role: **Viewer** (suffisant pour lire les données)
6. Décocher **Notify new users by email**
7. Cliquer sur **Add**

---

## 4. Configurer les Variables d'Environnement

### Fichier .env.local

Créer ou éditer `/site/.env.local`:

```env
# Google Service Account (copier le contenu entier du fichier JSON sur une seule ligne)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"coding-prompts-aeo-dashboard","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"aeo-dashboard@coding-prompts-aeo-dashboard.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Google Analytics 4 Property ID
GA4_PROPERTY_ID=123456789

# SEMrush (déjà configuré)
SEMRUSH_API_KEY=0c83e99dd9e328d1c53035bd66c59e54

# Admin credentials
JWT_SECRET=votre-jwt-secret
ADMIN_EMAIL=admin@coding-prompts.dev
ADMIN_PASSWORD=your-secure-password
```

### Pour Vercel (Production)

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet: `coding-prompts-dev`
3. Aller dans **Settings** > **Environment Variables**
4. Ajouter:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: Copier le contenu entier du fichier JSON
   - `GA4_PROPERTY_ID`: Votre Property ID
   - `SEMRUSH_API_KEY`: La clé SEMrush
   - `JWT_SECRET`: Un secret aléatoire sécurisé
   - `ADMIN_EMAIL`: admin@coding-prompts.dev
   - `ADMIN_PASSWORD`: your-secure-password

---

## 5. Tester l'Intégration

### Localement

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir le dashboard
open http://localhost:3000/admin

# Se connecter
# Email: admin@coding-prompts.dev
# Password: your-secure-password
```

### Avec Playwright

```bash
# Exécuter les tests
node test-dashboard.mjs
```

---

## 6. Structure des Données Retournées

### Google Search Console

```typescript
{
  totalClicks: number | "N/A",
  totalImpressions: number | "N/A",
  avgCTR: number | "N/A",        // En pourcentage
  avgPosition: number | "N/A",
  topQueries: [
    {
      query: string,
      clicks: number,
      impressions: number,
      ctr: number,
      position: number
    }
  ],
  topPages: [
    {
      page: string,
      clicks: number,
      impressions: number,
      ctr: number,
      position: number
    }
  ]
}
```

### Google Analytics 4

```typescript
{
  pageViews: {
    total: number | "N/A",
    change: string              // Ex: "+12%", "-5%"
  },
  uniqueVisitors: {
    total: number | "N/A",
    change: string
  },
  avgSessionDuration: number | "N/A",  // En secondes
  bounceRate: number | "N/A",          // En pourcentage
  topPages: [
    {
      path: string,
      views: number,
      change: string
    }
  ],
  topSources: [
    {
      source: string,
      users: number,
      sessions: number
    }
  ],
  deviceBreakdown: {
    desktop: number,
    mobile: number,
    tablet: number
  }
}
```

---

## 7. Dépannage

### Erreur: "Permission denied"

- Vérifier que le Service Account a bien été ajouté dans Google Search Console
- Vérifier que le Service Account a bien été ajouté dans Google Analytics
- Vérifier que les APIs sont activées dans Google Cloud Console

### Erreur: "Property not found"

- Vérifier le Property ID dans GA4
- Vérifier que le format est juste un nombre (pas "properties/123456789")

### Erreur: "Invalid credentials"

- Vérifier que le JSON est bien formaté (une seule ligne)
- Vérifier qu'il n'y a pas de caractères spéciaux échappés incorrectement
- Re-générer une nouvelle clé si nécessaire

### Données "N/A"

C'est normal si:
- Le site est nouveau (pas encore de données dans GSC/GA4)
- Les APIs ne sont pas configurées (credentials manquants)
- Il y a une erreur d'authentification (voir les logs)

---

## 8. Sécurité

### ⚠️ RÈGLES DE SÉCURITÉ

1. **JAMAIS** commiter le fichier JSON du Service Account
2. **JAMAIS** commiter le fichier `.env.local`
3. Toujours utiliser des variables d'environnement
4. Restreindre les permissions du Service Account au minimum nécessaire
5. Rotation régulière des clés (tous les 90 jours recommandé)

### Vérifier .gitignore

```bash
# S'assurer que ces fichiers sont ignorés
cat .gitignore | grep -E "(\.env\.local|service-account)"
```

---

## 9. Resources

- [Google Search Console API Docs](https://developers.google.com/webmaster-tools/v1/api_reference_index)
- [Google Analytics Data API Docs](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Service Account Setup](https://cloud.google.com/iam/docs/creating-managing-service-accounts)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Dernière mise à jour**: 2026-02-02
**Statut**: ✅ Documentation complète
