'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/providers/CartProvider';

const tabs = [
  { href: '/', label: 'Accueil', icon: 'home' },
  { href: '/catalogue', label: 'Catalogue', icon: 'grid_view' },
  { href: '/panier', label: 'Panier', icon: 'shopping_cart' },
  { href: '/suivi', label: 'Suivi', icon: 'local_shipping' },
  { href: '/a-propos', label: 'À propos', icon: 'info' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="bottom-nav" aria-label="Navigation principale mobile">
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
        return (
          <Link key={tab.href} href={tab.href} className={`bottom-nav__item${active ? ' is-active' : ''}`}>
            <span aria-hidden className="material-symbols-outlined text-[18px] leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.href === '/panier' && itemCount > 0 ? <em className="bottom-nav__badge">{itemCount}</em> : null}
          </Link>
        );
      })}
    </nav>
  );
}
