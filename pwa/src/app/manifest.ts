import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SAEG - La Boutique',
    short_name: 'SAEG Boutique',
    description: 'PWA SAEG pour la vente des invendus des marchés éphémères',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFF6E6',
    theme_color: '#1B7F3A',
    lang: 'fr-GA',
    icons: [
      { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
