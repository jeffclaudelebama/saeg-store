'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import type { SaegProduct } from '@/types/saeg';

export function ViewItemTracker({ product }: { product: SaegProduct }) {
  useEffect(() => {
    trackEvent('view_item', {
      item_id: product.id,
      item_name: product.name,
      price: product.sale_price || product.price || product.regular_price,
      item_category: product.categories[0]?.name,
      unit_type: product.unit_type,
    });
  }, [product]);

  return null;
}

export function BeginCheckoutTracker({ total, items }: { total: number; items: number }) {
  useEffect(() => {
    if (items <= 0) return;
    trackEvent('begin_checkout', { value: total, items_count: items, currency: 'XAF' });
  }, [total, items]);

  return null;
}

export function PurchaseTracker({ orderNumber, total }: { orderNumber: string; total: number }) {
  useEffect(() => {
    if (!orderNumber) return;
    trackEvent('purchase', { transaction_id: orderNumber, value: total, currency: 'XAF' });
  }, [orderNumber, total]);

  return null;
}
