'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KgSelector } from '@/components/KgSelector';
import { EmptyState } from '@/components/UiStates';
import { SAEG_WHATSAPP_INTL } from '@/lib/constants';
import { getDeliveryFee } from '@/lib/delivery';
import { formatCurrency, formatQty } from '@/lib/format';
import { useCart } from '@/providers/CartProvider';
import type { SaegCommune, SaegDeliveryMode } from '@/types/saeg';

export function CartPageClient() {
  const router = useRouter();
  const { items, subtotal, updateItemQuantity, removeItem, hydrated } = useCart();
  const [commune, setCommune] = useState<SaegCommune>('Libreville');
  const [modeLivraison, setModeLivraison] = useState<SaegDeliveryMode>('delivery');
  const whatsappNumber = SAEG_WHATSAPP_INTL;

  const shipping = getDeliveryFee(commune, modeLivraison);
  const total = subtotal + shipping;

  const shareUrl = useMemo(() => {
    const lines = items.map((item) => `- ${item.name}: ${item.unitType === 'kg' ? `${item.quantity.toFixed(2).replace('.', ',')} kg` : `${item.quantity} unité(s)`}`);
    const text = [
      'Panier SAEG - La Boutique',
      ...lines,
      `Sous-total: ${Math.round(subtotal)} FCFA`,
      `Livraison (${modeLivraison === 'pickup' ? 'Click & Collect' : commune}): ${Math.round(shipping)} FCFA`,
      `Total estimé: ${Math.round(total)} FCFA`,
    ].join('\n');
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }, [items, subtotal, modeLivraison, commune, shipping, total, whatsappNumber]);

  if (!hydrated) {
    return <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">Chargement du panier...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState title="Panier vide" description="Ajoutez des produits au kilo ou à l’unité depuis la boutique." />
        <Link href="/catalogue" className="btn btn-primary">Voir la boutique</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded shadow-sm overflow-hidden border border-slate-200">
          <div className="divide-y divide-slate-200">
            {items.map((item) => {
              const lineTotal = item.unitPrice * item.quantity;
              return (
                <div key={item.key} className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.categoryName || 'Produit'}</p>
                      <h3 className="font-bold text-slate-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">Prix: {formatCurrency(item.unitPrice, item.currency)} {item.unitType === 'kg' ? '/ kg' : '/ unité'}</p>
                    </div>
                    <button className="text-sm font-semibold text-red-600" onClick={() => removeItem(item.key)} type="button">Retirer</button>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <KgSelector
                      unitType={item.unitType}
                      value={item.quantity}
                      minKg={item.minKg}
                      stepKg={item.stepKg}
                      maxKg={item.stockKg}
                      onChange={(next) => updateItemQuantity(item.key, next)}
                    />
                    <div className="rounded-lg bg-primary/5 px-4 py-3 text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">Sous-total</p>
                      <p className="text-lg font-black text-primary">{formatCurrency(lineTotal, item.currency)}</p>
                      <p className="text-xs text-slate-500">{formatQty(item.quantity, item.unitType)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Calcul livraison</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">Mode</span>
              <select className="w-full rounded-lg border-slate-200" value={modeLivraison} onChange={(e) => setModeLivraison(e.target.value as SaegDeliveryMode)}>
                <option value="delivery">Livraison</option>
                <option value="pickup">Click & Collect</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">Commune</span>
              <select className="w-full rounded-lg border-slate-200" value={commune} onChange={(e) => setCommune(e.target.value as SaegCommune)} disabled={modeLivraison === 'pickup'}>
                <option value="Libreville">Libreville</option>
                <option value="Akanda">Akanda</option>
                <option value="Owendo">Owendo</option>
              </select>
            </label>
          </div>
          <a href={shareUrl} target="_blank" rel="noreferrer" className="btn btn-ghost w-full">
            <span className="material-symbols-outlined">share</span>
            Partager mon panier sur WhatsApp
          </a>
        </div>
      </div>

      <aside className="lg:col-span-1">
        <div className="bg-white rounded shadow-lg border border-slate-200 p-6 sticky top-24">
          <h2 className="text-xl font-black text-primary uppercase mb-6">Résumé de la commande</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Sous-total</span>
              <span className="font-semibold">{formatCurrency(subtotal, 'XAF')}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>{modeLivraison === 'pickup' ? 'Click & Collect' : `Livraison ${commune}`}</span>
              <span className="font-semibold">{formatCurrency(shipping, 'XAF')}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Taxes</span>
              <span className="font-semibold">0 FCFA</span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
              <span className="text-lg font-bold text-slate-900 uppercase tracking-tight">Total</span>
              <span className="text-2xl font-black text-primary">{formatCurrency(total, 'XAF')}</span>
            </div>
          </div>

          <button
            className="w-full bg-accent hover:bg-yellow-400 text-primary font-black py-4 rounded uppercase tracking-widest shadow-md flex items-center justify-center gap-2"
            type="button"
            onClick={() => router.push(`/checkout?commune=${encodeURIComponent(commune)}&mode=${modeLivraison}`)}
          >
            Passer à la caisse
            <span className="material-symbols-outlined">payments</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
