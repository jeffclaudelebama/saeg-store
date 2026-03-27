'use client';

import { useMemo, useState } from 'react';
import { KgSelector } from '@/components/KgSelector';
import { AGROPAG_WHATSAPP_INTL } from '@/lib/constants';
import { useCart } from '@/providers/CartProvider';
import { formatCurrency, formatKg } from '@/lib/format';
import type { SaegProduct } from '@/types/saeg';

export function ProductDetailClient({ product }: { product: SaegProduct }) {
  const { addItem } = useCart();
  const whatsappNumber = AGROPAG_WHATSAPP_INTL;
  const defaultQty = product.unit_type === 'kg' ? product.min_kg || 0.25 : 1;
  const [quantity, setQuantity] = useState<number>(defaultQty);

  const unitPrice = product.unit_type === 'kg'
    ? product.sale_price || product.price || product.price_per_kg || product.regular_price
    : product.sale_price || product.price || product.regular_price;

  const total = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const whatsappUrl = useMemo(() => {
    const message = [
      'Bonjour AGROPAG,',
      `Je souhaite commander: ${product.name}`,
      product.unit_type === 'kg' ? `Quantité: ${quantity.toFixed(2).replace('.', ',')} kg` : `Quantité: ${quantity}`,
      `Montant estimé: ${Math.round(total)} FCFA`,
    ].join('\n');
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [product.name, product.unit_type, quantity, total, whatsappNumber]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <label className="text-sm font-bold text-slate-700">{product.unit_type === 'kg' ? 'Quantité (kg)' : 'Quantité'}</label>
        <KgSelector
          unitType={product.unit_type}
          value={quantity}
          minKg={product.min_kg || 0.25}
          stepKg={product.step_kg || 0.25}
          maxKg={product.stock_kg}
          onChange={setQuantity}
        />

        {product.unit_type === 'kg' && typeof product.stock_kg === 'number' ? (
          <div className={`rounded-lg border px-4 py-3 text-sm ${product.low_stock ? 'border-red-200 bg-red-50 text-red-700' : 'border-primary/10 bg-primary/5 text-primary'}`}>
            Stock restant estimé: <strong>{formatKg(product.stock_kg)}</strong>
          </div>
        ) : null}
      </div>

      <div className="sticky-cta">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:max-w-none">
          <div className="flex items-center justify-between rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
            <span className="text-sm font-medium text-primary">Total estimé</span>
            <strong className="text-xl font-black text-primary">{formatCurrency(total, product.currency)}</strong>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 py-4"
              onClick={() => addItem(product, quantity)}
            >
              <span className="material-symbols-outlined">shopping_basket</span>
              Ajouter au panier
            </button>
            <a
              className="w-full border-2 border-primary/40 hover:border-primary/60 text-primary font-bold rounded-lg flex items-center justify-center gap-2 transition-all py-4 bg-white"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined">chat</span>
              Commander sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
