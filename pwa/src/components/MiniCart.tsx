'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/providers/CartProvider';
import { formatCurrency } from '@/lib/format';
import { SafeImage } from '@/components/SafeImage';

export function MiniCart() {
  const { items, subtotal, miniCartOpen, closeMiniCart } = useCart();

  useEffect(() => {
    if (miniCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [miniCartOpen]);

  if (!miniCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={closeMiniCart}>
      <div
        className="w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-t-lg bg-white shadow-2xl sm:rounded-lg sm:slide-in-from-right-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-900">Panier</h2>
          <button
            type="button"
            onClick={closeMiniCart}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-center text-slate-500">Votre panier est vide</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-medium text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500">
                      {item.unitType === 'kg'
                        ? `${item.quantity.toFixed(2).replace('.', ',')} kg`
                        : `${item.quantity} unité${item.quantity > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.unitPrice * item.quantity, item.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(subtotal, 'XAF')}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeMiniCart}
                className="rounded-lg border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continuer les achats
              </button>
              <Link
                href="/panier"
                onClick={closeMiniCart}
                className="rounded-lg bg-primary py-3 text-center text-sm font-semibold text-white hover:bg-primary/90"
              >
                Voir le panier
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}