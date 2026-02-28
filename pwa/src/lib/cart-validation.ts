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
  const tolerance = 0.001;
  const productMap = new Map(params.products.map((p) => [p.id, p]));
  let subtotal = 0;
  const errors: SaegCartValidationResult['errors'] = [];

  const lines = params.items.map((item) => {
    const productId = Number(item.productId ?? item.product_id);
    const unitType = item.unitType ?? item.unit_type ?? 'unit';
    const itemName = item.name || `Produit ${productId}`;
    const itemKey = item.key || `p:${productId}`;
    const product = productMap.get(productId);

    const pushError = (reason: string, details?: string) => {
      errors.push({
        itemKey,
        product_id: productId,
        name: itemName,
        reason,
        details,
      });
    };

    if (!Number.isFinite(productId) || productId <= 0) {
      pushError('product_id manquant', 'Le produit doit avoir un identifiant valide.');
      return {
        itemKey,
        productId: 0,
        product_id: 0,
        name: itemName,
        unitType,
        quantity: 0,
        lineTotal: 0,
        valid: false,
        reason: 'product_id manquant',
        message: 'Produit invalide.',
      };
    }

    if (!product) {
      pushError('produit introuvable', 'Ce produit n’existe plus dans le catalogue.');
      return {
        itemKey,
        productId,
        product_id: productId,
        name: itemName,
        unitType,
        quantity: item.quantity,
        lineTotal: 0,
        valid: false,
        reason: 'produit introuvable',
        message: 'Produit introuvable.',
      };
    }

    if (product.unit_type !== unitType) {
      pushError('type unité incohérent', `Attendu: ${product.unit_type}, reçu: ${unitType}.`);
      return {
        itemKey,
        productId,
        product_id: productId,
        name: itemName,
        unitType,
        quantity: item.quantity,
        lineTotal: 0,
        valid: false,
        reason: 'type unité incohérent',
        message: 'Type d’unité incohérent.',
      };
    }

    if (unitType === 'kg') {
      const rawWeight = typeof item.weight_kg === 'number' ? item.weight_kg : item.quantity;
      const weight = clampDecimal(Number(rawWeight), 3);
      const minKg = product.min_kg || item.minKg || item.min_kg || 0.25;
      const stepKg = product.step_kg || item.stepKg || item.step_kg || 0.25;
      const stockKg = product.stock_kg ?? item.stockKg ?? item.stock_kg ?? null;
      const pricePerKg = product.price_per_kg || item.pricePerKg || item.price_per_kg || item.unitPrice || item.unit_price || 0;

      if (!Number.isFinite(weight) || weight <= 0) {
        pushError('poids manquant', 'Le poids doit être renseigné pour un produit vendu au kilo.');
        return {
          itemKey,
          productId,
          product_id: productId,
          name: product.name,
          unitType,
          quantity: 0,
          weight_kg: 0,
          lineTotal: 0,
          valid: false,
          reason: 'poids manquant',
          message: 'Poids manquant.',
        };
      }

      if (weight + tolerance < minKg) {
        pushError('poids inférieur au minimum', `Minimum requis: ${minKg.toFixed(2).replace('.', ',')} kg.`);
        return {
          itemKey,
          productId,
          product_id: productId,
          name: product.name,
          unitType,
          quantity: 1,
          weight_kg: weight,
          lineTotal: 0,
          valid: false,
          reason: 'poids inférieur au minimum',
          message: `Le poids doit être ≥ ${minKg} kg.`,
          details: `Demandé ${weight.toFixed(2).replace('.', ',')} kg, minimum ${minKg.toFixed(2).replace('.', ',')} kg.`,
        };
      }

      const diff = (weight - minKg) / stepKg;
      if (Math.abs(Math.round(diff) - diff) > tolerance) {
        pushError('poids invalide (step)', `Le poids doit être multiple de ${stepKg.toFixed(2).replace('.', ',')} kg.`);
        return {
          itemKey,
          productId,
          product_id: productId,
          name: product.name,
          unitType,
          quantity: 1,
          weight_kg: weight,
          lineTotal: 0,
          valid: false,
          reason: 'poids invalide (step)',
          message: `Le poids doit être multiple de ${stepKg} kg.`,
          details: `Poids ${weight.toFixed(2).replace('.', ',')} kg, pas ${stepKg.toFixed(2).replace('.', ',')} kg.`,
        };
      }

      if (typeof stockKg === 'number' && weight > stockKg + tolerance) {
        pushError('stock insuffisant', `Demandé ${weight.toFixed(2).replace('.', ',')} kg, disponible ${stockKg.toFixed(2).replace('.', ',')} kg.`);
        return {
          itemKey,
          productId,
          product_id: productId,
          name: product.name,
          unitType,
          quantity: 1,
          weight_kg: weight,
          lineTotal: 0,
          valid: false,
          reason: 'stock insuffisant',
          message: 'Stock insuffisant.',
          details: `Demandé ${weight.toFixed(2).replace('.', ',')} kg, disponible ${stockKg.toFixed(2).replace('.', ',')} kg.`,
        };
      }

      if (pricePerKg <= 0) {
        pushError('prix/kg manquant', 'price_per_kg est requis pour les produits au kilo.');
        return {
          itemKey,
          productId,
          product_id: productId,
          name: product.name,
          unitType,
          quantity: 1,
          weight_kg: weight,
          lineTotal: 0,
          valid: false,
          reason: 'prix/kg manquant',
          message: 'Prix/kg manquant.',
        };
      }

      const lineTotal = clampDecimal(pricePerKg * weight, 2);
      if (lineTotal <= 0) {
        pushError('total invalide', 'Le total de ligne doit être supérieur à 0.');
        return {
          itemKey,
          productId,
          product_id: productId,
          name: product.name,
          unitType,
          quantity: 1,
          weight_kg: weight,
          lineTotal,
          valid: false,
          reason: 'total invalide',
          message: 'Total invalide.',
        };
      }

      subtotal += lineTotal;
      return {
        itemKey,
        productId,
        product_id: productId,
        name: product.name,
        unitType,
        quantity: 1,
        weight_kg: weight,
        lineTotal,
        valid: true,
      };
    }

    const qty = Math.round(Number(item.quantity));
    if (!Number.isFinite(qty) || qty < 1) {
      pushError('quantité invalide', 'La quantité doit être un entier ≥ 1.');
      return {
        itemKey,
        productId,
        product_id: productId,
        name: product.name,
        unitType,
        quantity: 0,
        lineTotal: 0,
        valid: false,
        reason: 'quantité invalide',
        message: 'Quantité invalide.',
      };
    }

    const unitPrice = resolveProductPrice(product);
    if (unitPrice <= 0) {
      pushError('prix manquant', 'Le prix unitaire doit être supérieur à 0.');
      return {
        itemKey,
        productId,
        product_id: productId,
        name: product.name,
        unitType,
        quantity: qty,
        lineTotal: 0,
        valid: false,
        reason: 'prix manquant',
        message: 'Prix invalide.',
      };
    }

    const lineTotal = clampDecimal(unitPrice * qty, 2);
    if (lineTotal <= 0) {
      pushError('total invalide', 'Le total de ligne doit être supérieur à 0.');
      return {
        itemKey,
        productId,
        product_id: productId,
        name: product.name,
        unitType,
        quantity: qty,
        lineTotal,
        valid: false,
        reason: 'total invalide',
        message: 'Total invalide.',
      };
    }

    subtotal += lineTotal;
    return {
      itemKey,
      productId,
      product_id: productId,
      name: product.name,
      unitType,
      quantity: qty,
      lineTotal,
      valid: true,
    };
  });

  const shipping = getDeliveryFee(params.commune, params.modeLivraison);
  const valid = errors.length === 0 && lines.every((l) => l.valid);

  return {
    ok: valid,
    valid,
    currency: params.products[0]?.currency ?? 'XAF',
    currencySymbol: params.products[0]?.currency_symbol ?? 'FCFA',
    subtotal: clampDecimal(subtotal, 2),
    shipping,
    total: clampDecimal(subtotal + shipping, 2),
    shippingLabel: getDeliveryLabel(params.commune, params.modeLivraison),
    lines,
    errors,
  };
}
