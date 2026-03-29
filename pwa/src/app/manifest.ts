import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AGROPAG - La Boutique',
    short_name: 'AGROPAG Boutique',
    description: 'PWA AGROPAG pour la vente des invendus des marchés éphémères',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFF6E6',
    theme_color: '#1B7F3A',
    lang: 'fr-GA',
    icons: [
      { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
