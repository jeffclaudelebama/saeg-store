# AGROPAG Store Monorepo

Monorepo pour la boutique AGROPAG (vente des invendus des marchés éphémères) :
- Backoffice WordPress + WooCommerce (headless source) sur `admin.store.saeggabon.ga`
- Front PWA Next.js (headless) sur `store.saeggabon.ga`

## Structure

- `wp/` : plugin WordPress/WooCommerce AGROPAG + docs d'installation
- `pwa/` : front Next.js App Router + PWA + API proxy WooCommerce REST
- `infra/` : exemples de configuration Nginx/Caddy + templates `.env`
- `data/` : CSV d'import catalogue produits AGROPAG
- `docs/` : checklist de tests et notes de déploiement

## Prérequis

- PHP 8.1+
- MySQL 8+ (ou MariaDB compatible)
- WordPress (stable) + WooCommerce (stable)
- Node.js 20+
- pnpm 9+
- HTTPS (SSL) sur les 2 sous-domaines

## Installation rapide (aperçu)

### 1) WordPress / WooCommerce (`admin.store.saeggabon.ga`)

1. Installer WordPress latest stable.
2. Activer WooCommerce latest stable.
3. Activer le plugin `wp/plugins/saeg-weight-products`.
4. Copier `wp/mu-plugins/saeg-headless-security.php` vers `wp-content/mu-plugins/`.
5. Régler :
   - Permaliens : `/%postname%/`
   - Devise : `XAF (FCFA)`
   - Fuseau horaire : `Africa/Libreville`
   - Taxes : désactivées (phase 1)
6. Installer/configurer :
   - WP Mail SMTP
   - plugin sécurité léger (ex. Limit Login Attempts Reloaded / WPS Hide Login selon politique)
   - plugin cache compatible headless (ex. Cache Enabler) sans mettre en cache `/wp-json/`
7. Créer une clé WooCommerce REST en lecture/écriture minimale pour les commandes.

### 2) PWA Next.js (`store.saeggabon.ga`)

```bash
cd /Users/monsieurpitty/saeg-store
pnpm install
cp infra/env/pwa.env.example pwa/.env.local
pnpm dev
```

### 3) Déploiement

- `pwa/` : Vercel ou serveur Node (`pnpm build && pnpm start`)
- `wp/` : hébergement PHP/Nginx/Apache + MySQL
- Voir `infra/nginx/` et `infra/caddy/` pour exemples reverse proxy + SSL.

## Variables d'environnement (PWA)

Voir `infra/env/pwa.env.example`.

Clés importantes :
- `AGROPAG_WC_BASE_URL=https://admin.store.saeggabon.ga`
- `AGROPAG_WC_CONSUMER_KEY=...`
- `AGROPAG_WC_CONSUMER_SECRET=...`
- `NEXT_PUBLIC_SITE_URL=https://store.saeggabon.ga`
- `NEXT_PUBLIC_WP_URL=https://admin.store.saeggabon.ga` (alias dev/prod pour les médias WP)
- `NEXT_PUBLIC_AGROPAG_WHATSAPP_SHARE_NUMBER=24177638864`

## CORS strict (WP -> front headless)

Le MU-plugin fourni limite les origines REST autorisées à `https://store.saeggabon.ga` (configurable via constante).

## Endpoints proxy Next.js (serveur uniquement)

- `GET /api/products`
- `GET /api/product/[id]`
- `GET /api/categories`
- `POST /api/cart/validate`
- `POST /api/checkout/create-order`
- `GET /api/tracking?orderNumber=...&phone=...`

Les secrets WooCommerce restent côté serveur (Route Handlers App Router).

## Création des clés WooCommerce REST

WooCommerce > Réglages > Avancé > API REST > Ajouter une clé :
- Description : `AGROPAG PWA Proxy`
- Utilisateur : administrateur technique dédié
- Permissions : `Read/Write`

La clé est utilisée uniquement côté serveur Next.js (API proxy). **Ne jamais exposer au client.**

## Import produits (CSV)

1. Produits > Importer
2. Utiliser `data/saeg-products-import.csv`
3. Mapper les colonnes WooCommerce standard (nom, description, prix, catégories, images)
4. Mapper les métadonnées AGROPAG via plugin :
   - `saeg_unit`
   - `saeg_price_per_kg`
   - `saeg_step_kg`
   - `saeg_min_kg`
   - `saeg_stock_kg`
   - `saeg_is_daily_surplus`
   - `saeg_origin`

## Livraison / zones (WooCommerce)

Créer les zones :
- Libreville (frais par défaut: 1500 FCFA)
- Akanda (2000 FCFA)
- Owendo (2500 FCFA)
- Click&Collect (0 FCFA, méthode locale)

## Commandes d'installation / déploiement (résumé)

```bash
# Monorepo
cd /Users/monsieurpitty/saeg-store
pnpm install
pnpm dev

# Build PWA
pnpm build
pnpm start
```

## Notes sécurité & performance

- SSL obligatoire sur les 2 domaines
- CORS REST strict (MU-plugin)
- Rate limit login (plugin sécurité)
- Ne pas cacher `/wp-json/*` et webhooks WooCommerce
- Secrets uniquement côté serveur Next.js (Route Handlers)
- OpenGraph/SEO configurés côté Next.js

## Images WordPress (éviter les images cassées)

- En production, utiliser des URLs absolues HTTPS pour toutes les images produits (Media Library WordPress).
- Vérifier les options WordPress :
  - `siteurl = https://admin.store.saeggabon.ga`
  - `home = https://admin.store.saeggabon.ga`
- Si les URLs médias sont en `http://` alors que la PWA tourne en `https://`, le navigateur bloque (mixed content).
- La PWA normalise les URLs reçues (relatives -> absolues, `http` -> `https` en prod sur domaines AGROPAG).
- `next.config.mjs` autorise `admin.store.saeggabon.ga` et les hôtes de dev (`localhost`/`127.0.0.1`) via `images.remotePatterns`.
- En local, définir `NEXT_PUBLIC_WP_URL` (ou `NEXT_PUBLIC_WP_PUBLIC_URL`) vers votre WordPress local, ex. `http://localhost:8080`.
