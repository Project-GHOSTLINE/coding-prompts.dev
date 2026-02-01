# 🚀 DÉMARRAGE RAPIDE - coding-prompts.dev

## ⚡ En 3 Étapes (15 minutes)

### ÉTAPE 1: Copier le Prompt dans Claude Code (2 min)

1. Ouvrir Claude Code dans votre terminal
2. Copier TOUT le contenu de `CLAUDE_CODE_PROMPT.md`
3. Coller dans Claude Code
4. Appuyer sur Entrée

Claude Code va créer:
- ✅ Repository Git
- ✅ Structure Next.js complète
- ✅ Tous les composants
- ✅ Schema.org optimisé
- ✅ Premier article complet

### ÉTAPE 2: Deploy sur Vercel (5 min)

```bash
# Dans le dossier du projet créé par Claude Code
cd coding-prompts

# Installer Vercel CLI
npm install -g vercel

# Login Vercel
vercel login

# Deploy
vercel --prod

# Suivre les instructions (appuyer Entrée pour defaults)
```

### ÉTAPE 3: Connecter le Domaine (5 min)

**Dans Vercel Dashboard:**
1. Aller sur votre projet
2. Settings → Domains
3. Add Domain: `coding-prompts.dev`
4. Copier les records DNS

**Dans Cloudflare:**
1. DNS → Add Record
2. Type: `CNAME`
3. Name: `@`
4. Content: `cname.vercel-dns.com`
5. Proxy: OFF (orange cloud désactivé)

6. Add Record
7. Type: `CNAME`
8. Name: `www`
9. Content: `cname.vercel-dns.com`
10. Proxy: OFF

**Attendre 5-10 minutes** → Site live ! 🎉

---

## 📋 Commandes Git (Si besoin manuel)

Si Claude Code n'a pas créé le repo automatiquement:

```bash
# Dans le dossier coding-prompts
git init
git add .
git commit -m "Initial commit: AI-optimized site"

# Créer repo GitHub (option A - avec gh CLI)
gh repo create coding-prompts --public --source=. --remote=origin
git push -u origin main

# OU créer repo GitHub (option B - manuel)
# 1. Aller sur github.com/new
# 2. Nom: coding-prompts
# 3. Public
# 4. Ne PAS initialiser avec README
# 5. Créer

# Puis:
git remote add origin https://github.com/VOTRE_USERNAME/coding-prompts.git
git branch -M main
git push -u origin main
```

---

## ⚠️ DOMAINE .COM PAS DISPONIBLE

`coding-prompts.com` est déjà pris.

### 🎯 Recommandation: NE PAS ACHETER d'alternative

**Pourquoi?**
- Vous avez déjà `.dev` (optimal pour AI)
- `.dev` est MIEUX que `.com` pour développeurs
- Économisez $10-60

**Si vous DEVEZ avoir une backup:**

### Option A: Meilleur rapport qualité/prix
`coding-prompts.org` - **$7.50** (renouvelle à $10.13)
→ Rediriger 301 vers .dev

### Option B: Pour UK audience
`coding-prompts.uk` - **$5.22**
→ Créer version UK si expansion internationale

### ❌ À ÉVITER:
- `.coach` ($60) - trop cher
- `.academy` ($36) - trop cher  
- `.mobi`, `.vip`, `.icu` - mauvaise réputation SEO

**Mon conseil:** Gardez juste `.dev` et concentrez sur le contenu !

---

## 🎨 Images à Créer AVANT Deploy

### 1. Logo (512x512px)
**Option rapide:**
```bash
# Utiliser un emoji ou texte simple
# Canva.com (gratuit)
# Logo.com ($10)
```

### 2. OG Image (1200x630px)
**Template simple:**
- Fond bleu (#4472C4)
- Titre: "Coding Prompts"
- Sous-titre: "Professional AI Development Tools"
- Logo

**Tools gratuits:**
- Canva
- Figma
- Photopea (Photoshop gratuit)

### 3. Fichiers à placer
```bash
public/
├── logo.png          # 512x512
├── og-image.png      # 1200x630
├── twitter-card.png  # 1200x630
└── favicon.ico       # 32x32
```

---

## ✅ Checklist Premier Deploy

### Avant de push:
- [ ] Images dans `/public`
- [ ] Remplacer `YOUR_GOOGLE_VERIFICATION_CODE`
- [ ] Vérifier que `package.json` est correct
- [ ] Tester en local: `npm run dev`

### Après deploy:
- [ ] Site accessible sur coding-prompts.dev
- [ ] HTTPS fonctionne (cadenas vert)
- [ ] Mobile responsive
- [ ] Vitesse OK (< 3 secondes)

### Dans les 24h:
- [ ] Google Search Console
- [ ] Submit sitemap
- [ ] Premier test AI citation

### Dans les 48h:
- [ ] Tester dans ChatGPT: "How to fix Claude Code exit code 1?"
- [ ] Tester dans Claude
- [ ] Tester dans Perplexity
- [ ] Noter si vous êtes cité

---

## 🆘 Dépannage Rapide

### "Vercel domain not verified"
→ Vérifier DNS dans Cloudflare (attendre 10 min)

### "Build failed"
→ Vérifier `package.json` et `tsconfig.json`

### "Images not loading"
→ Vérifier fichiers dans `/public`

### "Schema errors"
→ Tester sur validator.schema.org

---

## 📊 Premiers KPIs à Suivre

### Jour 1-7:
- Nombre de pages indexées Google
- Score PageSpeed
- Erreurs Schema.org

### Jour 8-30:
- Trafic organique (Google Analytics)
- Citations AI (tests manuels)
- Backlinks (ahrefs free)

---

## 🎯 Prochaines Étapes (Après Deploy)

### Semaine 1:
1. ✅ Article #1 live (exit-code-1)
2. Écrire article #2 (permissions)
3. Écrire article #3 (super tips)
4. Ajouter 10 prompts

### Semaine 2:
1. Articles #4-5
2. 20 prompts supplémentaires
3. Premier post Reddit
4. Configuration Google Analytics

### Semaine 3-4:
1. 5 articles supplémentaires
2. 50 prompts total
3. Guest post (1-2)
4. Newsletter signup

---

## 💡 Tips Finaux

1. **Content First**
   - Focus sur 1 excellent article
   - Mieux que 10 articles moyens

2. **Update Regularly**
   - Changer `dateModified` tous les 3 mois
   - Ajouter des FAQ basées sur questions

3. **Monitor AI Citations**
   - Tester manuellement chaque semaine
   - Ajuster contenu basé sur résultats

4. **Community Building**
   - Répondre aux questions Reddit
   - Partager sur Twitter/X
   - Contribuer à discussions

---

**READY? Copiez le prompt dans Claude Code et GO! 🚀**
