import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppProviders } from '@/providers/AppProviders';
import { PwaBoot } from '@/components/PwaBoot';
import { InstallPwaPrompt } from '@/components/InstallPwaPrompt';
import { BottomNav } from '@/components/BottomNav';
import { APP_NAME } from '@/lib/constants';
import { env } from '@/lib/env';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${APP_NAME}`,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Invendus des marchés éphémères SAEG. Vente au kilo, livraison locale Libreville/Akanda/Owendo et Click & Collect.',
  manifest: '/manifest.webmanifest',
  applicationName: APP_NAME,
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: APP_NAME,
    description: 'Produits frais et invendus valorisés au Gabon. Vente au kilo, livraison locale, click & collect.',
    type: 'website',
    locale: 'fr_GA',
    url: env.siteUrl,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SAEG - La Boutique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: 'Produits frais et invendus valorisés au Gabon. Vente au kilo, livraison locale, click & collect.',
    images: ['/og-default.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#1B7F3A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.className} font-display bg-background-light text-slate-900 antialiased`}>
        <AppProviders>
          <PwaBoot />
          {children}
          <InstallPwaPrompt />
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
