import { clampDecimal } from '@/lib/format';
import { getDeliveryFee, getDeliveryLabel } from '@/lib/delivery';
import type { SaegCartItem, SaegCartValidationResult, SaegCommune, SaegDeliveryMode, SaegProduct } from '@/types/saeg';

export function validateWeightStep(quantity: number, minKg: number, stepKg: number): boolean {
  const scale = 1000;
  const q = Math.round(quantity * scale);
  const min = Math.round(minKg * scale);
  const step = Math.max(1, Math.round(stepKg * scale));
  return q >= min && (q - min) % step === 0;
}

function resolveProductPrice(product: SaegProduct): number {
  if (product.unit_type === 'kg') {
    return product.sale_price || product.price || product.price_per_kg || product.regular_price || 0;
  }
  return product.sale_price || product.price || product.regular_price || 0;
}

export function validateCartAgainstProducts(params: {
  items: SaegCartItem[];
  products: SaegProduct[];
  commune: SaegCommune;
  modeLivraison: SaegDeliveryMode;
}): SaegCartValidationResult {
  const productMap = new Map(params.products.map((p) => [p.id, p]));
  let subtotal = 0;

  const lines = params.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      return { productId: item.productId, quantity: item.quantity, lineTotal: 0, valid: false, message: 'Produit introuvable.' };
    }

    const qty = clampDecimal(item.quantity, 2);
    if (qty <= 0) {
      return { productId: item.productId, quantity: qty, lineTotal: 0, valid: false, message: 'Quantité invalide.' };
    }

    if (product.unit_type === 'kg') {
      const minKg = product.min_kg || 0.25;
      const stepKg = product.step_kg || 0.25;
      const stockKg = product.stock_kg ?? 0;
      if (!validateWeightStep(qty, minKg, stepKg)) {
        return { productId: item.productId, quantity: qty, lineTotal: 0, valid: false, message: `Le poids doit respecter un pas de ${stepKg} kg.` };
      }
      if (qty > stockKg + 0.0001) {
        return { productId: item.productId, quantity: qty, lineTotal: 0, valid: false, message: 'Stock insuffisant.' };
      }
    }

    const lineTotal = clampDecimal(resolveProductPrice(product) * qty, 2);
    subtotal += lineTotal;
    return { productId: item.productId, quantity: qty, lineTotal, valid: true };
  });

  const shipping = getDeliveryFee(params.commune, params.modeLivraison);
  const valid = lines.every((l) => l.valid);

  return {
    valid,
    currency: params.products[0]?.currency ?? 'XAF',
    currencySymbol: params.products[0]?.currency_symbol ?? 'FCFA',
    subtotal: clampDecimal(subtotal, 2),
    shipping,
    total: clampDecimal(subtotal + shipping, 2),
    shippingLabel: getDeliveryLabel(params.commune, params.modeLivraison),
    lines,
  };
}
