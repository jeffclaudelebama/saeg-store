# Checklist de tests SAEG

## Vente au kilo / plugin

- [ ] Ajouter un produit au kilo avec quantité décimale (`0.25`, `0.5`, `1.75`)
- [ ] Le prix ligne = `poids * prix/kg`
- [ ] Le stock `saeg_stock_kg` bloque l'ajout si insuffisant
- [ ] Le stock `saeg_stock_kg` est décrémenté au passage en `processing` / `on-hold`
- [ ] Le stock est restauré si commande annulée/refunded (si activé)

## PWA / UX / mobile

- [ ] Bannière “Install PWA” visible au 1er visiteur mobile après ~1.2s
- [ ] Fermeture bannière => masquage 30 jours
- [ ] App déjà installée (standalone) => bannière non affichée
- [ ] Android: `beforeinstallprompt` déclenche l'installation
- [ ] iOS Safari: aide d'installation affichée (Partager > Sur l'écran d'accueil)
- [ ] Page offline accessible / service worker enregistré

## Checkout / livraison

- [ ] Sélection commune => frais (Libreville/Akanda/Owendo)
- [ ] Click&Collect => frais 0
- [ ] Créneau livraison (matin/après-midi) enregistré dans note/meta commande
- [ ] Paiement Cash / Mobile Money (placeholder) disponible
- [ ] Commande créée via `/api/checkout/create-order`
- [ ] Commande visible dans WooCommerce admin
- [ ] `POST /api/cart/validate` refuse poids invalide / stock insuffisant
- [ ] `GET /api/tracking` renvoie un statut cohérent (téléphone + n° commande)

## SEO / partage

- [ ] Meta title/description présents
- [ ] OpenGraph de base présent
- [ ] Bouton WhatsApp “Partager mon panier” génère un message lisible
- [ ] Bouton WhatsApp fiche produit préremplit produit + poids + montant estimé
