'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/providers/CartProvider';

const navItems: Array<{ href: Route; label: string }> = [
  { href: '/', label: 'Accueil' },
  { href: '/catalogue', label: 'Boutique' },
  { href: '/livraison', label: 'Livraison' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary">
              <span className="material-symbols-outlined">eco</span>
            </div>
            <div>
              <span className="block text-sm font-black leading-none text-primary">SAEG</span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">La Boutique</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors ${active ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 hover:text-primary'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/catalogue" className="hidden sm:flex items-center rounded-lg bg-primary/5 px-3 py-2 text-sm text-slate-600">
              <span className="material-symbols-outlined mr-2 text-lg text-primary/60">search</span>
              <span className="hidden lg:inline">Rechercher...</span>
            </Link>
            <Link href="/panier" className="relative p-2 text-slate-700 hover:bg-primary/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
              {itemCount > 0 ? (
                <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              ) : null}
            </Link>
            <Link href="/suivi" className="p-2 text-slate-700 hover:bg-primary/10 rounded-lg transition-colors" aria-label="Suivi commande">
              <span className="material-symbols-outlined">local_shipping</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
