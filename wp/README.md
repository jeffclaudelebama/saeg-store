# AGROPAG WordPress / WooCommerce (Backoffice Headless)

## Plugins recommandés (phase 1)

- WooCommerce
- AGROPAG Weight Products (fourni dans `plugins/saeg-weight-products`)
- WP Mail SMTP
- Limit Login Attempts (ou équivalent)
- Cache léger compatible headless (ex. Cache Enabler)
- (Optionnel) WooCommerce PDF Invoices & Packing Slips

## Réglages WordPress

- Permaliens : `/%postname%/`
- SSL : forcé (`FORCE_SSL_ADMIN` + reverse proxy HTTPS)
- Fuseau : `Africa/Libreville`
- Langue : `Français`

## Réglages WooCommerce

- Devise : `XAF` (FCFA)
- Taxes : `Non` (phase 1)
- Gestion stock : activée
- Zones de livraison : Libreville / Akanda / Owendo + retrait local

## Rôle “Superviseur”

Le plugin AGROPAG crée un rôle `saeg_superviseur` pouvant :
- voir commandes et statistiques WooCommerce
- modifier produits (prix, stock, métadonnées de poids)
- ne pas gérer plugins/réglages globaux

## CORS / sécurité headless

Copier `mu-plugins/saeg-headless-security.php` dans `wp-content/mu-plugins/` pour :
- autoriser uniquement `https://store.saeggabon.ga`
- restreindre l'en-tête CORS REST
- désactiver XML-RPC
- réduire exposition de la version WP
