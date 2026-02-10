#!/bin/bash

# Ajouter les IDs aux CollapsibleSection
sed -i '' '450s/<CollapsibleSection$/<CollapsibleSection id="aeo-tests"/' app/admin/dashboard/page.tsx
sed -i '' '646s/<CollapsibleSection$/<CollapsibleSection id="ai-engines"/' app/admin/dashboard/page.tsx
sed -i '' '774s/<CollapsibleSection$/<CollapsibleSection id="seo"/' app/admin/dashboard/page.tsx
sed -i '' '967s/<CollapsibleSection$/<CollapsibleSection id="content-comparison"/' app/admin/dashboard/page.tsx
sed -i '' '1210s/<CollapsibleSection$/<CollapsibleSection id="quick-stats"/' app/admin/dashboard/page.tsx

echo "✅ IDs ajoutés aux 5 sections principales"
