#!/bin/bash
# ==============================================================================
# SETUP VERCEL ENVIRONMENT VARIABLES
# ==============================================================================
# Configure toutes les variables d'environnement pour production
# ==============================================================================

set -e

PROJECT_ID="prj_JhfX1GlH5RRnUMS70mVlqqb708Dl"

echo "🔧 Configuration des variables d'environnement Vercel..."
echo ""

# Charger les variables depuis .env.local
if [ ! -f "site/.env.local" ]; then
  echo "❌ Erreur: site/.env.local n'existe pas"
  exit 1
fi

# Fonction pour ajouter une variable
add_env() {
  local key=$1
  local value=$2
  local env_type=${3:-production}

  echo "📝 Ajout de $key..."
  echo "$value" | vercel env add "$key" "$env_type" --yes 2>/dev/null || echo "   (déjà existante, skip)"
}

echo "1️⃣ Configuration ADMIN AUTHENTICATION..."
add_env "JWT_SECRET" "bm/2kN62qjywXFj4Y8qec6huYr8Jvw75VDjEcDyA+KbNUF+pRZl9/5j5AqdDk/7ii/HlWIJH2D8vfC8M5CQ5JA=="
add_env "ADMIN_EMAIL" "admin@coding-prompts.dev"
add_env "ADMIN_PASSWORD" "FredRosa%1978"

echo ""
echo "2️⃣ Configuration SUPABASE..."
add_env "NEXT_PUBLIC_SUPABASE_URL" "https://dllyzfuqjzuhvshrlmuq.supabase.co"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbHl6ZnVxanp1aHZzaHJsbXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTU5ODEsImV4cCI6MjA4MTU3MTk4MX0.xskVblRlKdbTST1Mdgz76oR7N2rDq8ZOUgaN-f_TTM4"
add_env "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbHl6ZnVxanp1aHZzaHJsbXVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTk4MSwiZXhwIjoyMDgxNTcxOTgxfQ.Qg5eQwDxeAtTDXplNkQZa4hOp_dSMBIu_DKbuquryFo"

echo ""
echo "3️⃣ Configuration GOOGLE SERVICES..."

# Lire le JSON depuis .env.local
GOOGLE_JSON=$(grep "GOOGLE_SERVICE_ACCOUNT_JSON=" site/.env.local | cut -d= -f2- | tr -d "'")
GA4_PROPERTY_ID=$(grep "GA4_PROPERTY_ID=" site/.env.local | cut -d= -f2)

add_env "GOOGLE_SERVICE_ACCOUNT_JSON" "$GOOGLE_JSON"
add_env "GA4_PROPERTY_ID" "$GA4_PROPERTY_ID"

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Variables configurées :"
echo "   - JWT_SECRET"
echo "   - ADMIN_EMAIL"
echo "   - ADMIN_PASSWORD"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - GOOGLE_SERVICE_ACCOUNT_JSON"
echo "   - GA4_PROPERTY_ID"
echo ""
echo "🚀 Prêt pour le déploiement !"
