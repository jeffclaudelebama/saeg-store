'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { clampDecimal } from '@/lib/format';
import { trackEvent } from '@/lib/analytics';
import type { SaegCartItem, SaegProduct } from '@/types/saeg';

type CartAction =
  | { type: 'hydrate'; items: SaegCartItem[]; warnings: string[] }
  | { type: 'add'; product: SaegProduct; quantity: number }
  | { type: 'update'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }
  | { type: 'clearWarnings' }
  | { type: 'openMiniCart' }
  | { type: 'closeMiniCart' };

interface CartState {
  items: SaegCartItem[];
  hydrated: boolean;
  hydrateWarnings: string[];
  miniCartOpen: boolean;
}

interface CartContextValue extends CartState {
  itemCount: number;
  subtotal: number;
  addItem: (product: SaegProduct, quantity: number) => void;
  updateItemQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  clearHydrateWarnings: () => void;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

const STORAGE_KEY = 'saeg_cart_v1';
const CartContext = createContext<CartContextValue | null>(null);

function makeKey(productId: number): string {
  return `p:${productId}`;
}

function productUnitPrice(product: SaegProduct): number {
  if (product.unit_type === 'kg') {
    return product.sale_price || product.price || product.price_per_kg || product.regular_price || 0;
  }
  return product.sale_price || product.price || product.regular_price || 0;
}

function itemEffectiveQuantity(item: SaegCartItem): number {
  if (item.unitType === 'kg') {
    return clampDecimal(item.weight_kg ?? item.quantity, 2);
  }
  return Math.max(1, Math.round(item.quantity));
}

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 0 ? value : null;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

function toCartItem(product: SaegProduct, quantity: number): SaegCartItem {
  const minKg = product.min_kg || (product.unit_type === 'kg' ? 0.25 : 1);
  const stepKg = product.step_kg || 0.25;
  const unitPrice = productUnitPrice(product);
  const qty = product.unit_type === 'kg' ? clampDecimal(Math.max(quantity, minKg), 2) : Math.max(1, Math.round(quantity));
  return {
    key: makeKey(product.id),
    productId: product.id,
    product_id: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] ?? null,
    unitType: product.unit_type,
    unit_type: product.unit_type,
    quantity: qty,
    weight_kg: product.unit_type === 'kg' ? qty : undefined,
    stepKg,
    step_kg: stepKg,
    minKg,
    min_kg: minKg,
    stockKg: product.stock_kg,
    stock_kg: product.stock_kg,
    unitPrice,
    unit_price: unitPrice,
    pricePerKg: product.price_per_kg || unitPrice,
    price_per_kg: product.price_per_kg || unitPrice,
    currency: product.currency,
    currencySymbol: product.currency_symbol,
    categoryName: product.categories[0]?.name,
  };
}

function normalizeStoredItems(input: unknown): { items: SaegCartItem[]; warnings: string[] } {
  if (!Array.isArray(input)) {
    return { items: [], warnings: [] };
  }

  const warnings: string[] = [];
  const items: SaegCartItem[] = [];

  for (const raw of input) {
    if (!raw || typeof raw !== 'object') {
      continue;
    }
    const record = raw as Record<string, unknown>;
    const productId = Number(record.productId ?? record.product_id);
    if (!Number.isFinite(productId) || productId <= 0) {
      continue;
    }

    const key = typeof record.key === 'string' && record.key.trim() ? record.key : makeKey(productId);
    const unitType = String(record.unitType ?? record.unit_type ?? 'unit') === 'kg' ? 'kg' : 'unit';
    const minKg = toPositiveNumber(record.minKg ?? record.min_kg) ?? (unitType === 'kg' ? 0.25 : 1);
    const stepKg = toPositiveNumber(record.stepKg ?? record.step_kg) ?? (unitType === 'kg' ? 0.25 : 1);
    const stockKgRaw = record.stockKg ?? record.stock_kg;
    const stockKg =
      typeof stockKgRaw === 'number' && Number.isFinite(stockKgRaw)
        ? stockKgRaw
        : typeof stockKgRaw === 'string' && stockKgRaw.trim()
          ? Number(stockKgRaw.replace(',', '.'))
          : null;
    const unitPrice = toPositiveNumber(record.unitPrice ?? record.unit_price) ?? 0;
    const pricePerKg = toPositiveNumber(record.pricePerKg ?? record.price_per_kg) ?? unitPrice;
    const quantityRaw = toPositiveNumber(record.quantity) ?? (unitType === 'kg' ? minKg : 1);
    const weightRaw = toPositiveNumber(record.weight_kg);
    const name = typeof record.name === 'string' && record.name.trim() ? record.name : `Produit ${productId}`;

    let quantity = quantityRaw;
    let weightKg: number | undefined;
    if (unitType === 'kg') {
      if (!weightRaw) {
        quantity = clampDecimal(minKg, 2);
        weightKg = quantity;
        warnings.push(`${name}: poids remis au minimum (${minKg.toFixed(2).replace('.', ',')} kg).`);
      } else {
        quantity = clampDecimal(weightRaw, 2);
        weightKg = quantity;
      }
    } else {
      quantity = Math.max(1, Math.round(quantityRaw));
    }

    items.push({
      key,
      productId,
      product_id: productId,
      slug: typeof record.slug === 'string' ? record.slug : String(productId),
      name,
      image: typeof record.image === 'string' ? record.image : null,
      unitType,
      unit_type: unitType,
      quantity,
      weight_kg: weightKg,
      stepKg,
      step_kg: stepKg,
      minKg,
      min_kg: minKg,
      stockKg: typeof stockKg === 'number' && Number.isFinite(stockKg) ? stockKg : null,
      stock_kg: typeof stockKg === 'number' && Number.isFinite(stockKg) ? stockKg : null,
      unitPrice,
      unit_price: unitPrice,
      pricePerKg,
      price_per_kg: pricePerKg,
      currency: typeof record.currency === 'string' && record.currency.trim() ? record.currency : 'XAF',
      currencySymbol: typeof record.currencySymbol === 'string' ? record.currencySymbol : 'FCFA',
      categoryName: typeof record.categoryName === 'string' ? record.categoryName : undefined,
    });
  }

  return { items, warnings };
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate':
      return { items: action.items, hydrated: true, hydrateWarnings: action.warnings };
    case 'add': {
      const key = makeKey(action.product.id);
      const existing = state.items.find((i) => i.key === key);
      if (existing) {
        const nextQuantity = existing.unitType === 'kg'
          ? clampDecimal(Math.max(existing.minKg, itemEffectiveQuantity(existing) + action.quantity), 2)
          : Math.max(1, Math.round(existing.quantity + action.quantity));
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === key
              ? {
                  ...i,
                  quantity: nextQuantity,
                  weight_kg: i.unitType === 'kg' ? nextQuantity : undefined,
                }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, toCartItem(action.product, action.quantity)] };
    }
    case 'update':
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.key === action.key
              ? {
                  ...i,
                  quantity: i.unitType === 'kg' ? clampDecimal(Math.max(i.minKg, action.quantity), 2) : Math.max(1, Math.round(action.quantity)),
                  weight_kg: i.unitType === 'kg' ? clampDecimal(Math.max(i.minKg, action.quantity), 2) : undefined,
                }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.key !== action.key) };
    case 'clear':
      return { ...state, items: [], hydrateWarnings: [] };
    case 'clearWarnings':
      return { ...state, hydrateWarnings: [] };
    case 'openMiniCart':
      return { ...state, miniCartOpen: true };
    case 'closeMiniCart':
      return { ...state, miniCartOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false, hydrateWarnings: [], miniCartOpen: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        dispatch({ type: 'hydrate', items: [], warnings: [] });
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeStoredItems(parsed);
      dispatch({ type: 'hydrate', items: normalized.items, warnings: normalized.warnings });
    } catch {
      dispatch({ type: 'hydrate', items: [], warnings: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.hydrated, state.items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((acc, item) => acc + (item.unitType === 'kg' ? 1 : Math.round(itemEffectiveQuantity(item))), 0);
    const subtotal = state.items.reduce((acc, item) => acc + item.unitPrice * itemEffectiveQuantity(item), 0);

    return {
      ...state,
      itemCount,
      subtotal,
      addItem(product, quantity) {
        dispatch({ type: 'add', product, quantity });
        dispatch({ type: 'openMiniCart' });
        trackEvent('add_to_cart', {
          item_id: product.id,
          item_name: product.name,
          price: productUnitPrice(product),
          quantity,
          unit_type: product.unit_type,
        });
      },
      updateItemQuantity(key, quantity) {
        dispatch({ type: 'update', key, quantity });
      },
      removeItem(key) {
        dispatch({ type: 'remove', key });
      },
      clearCart() {
        dispatch({ type: 'clear' });
      },
      clearHydrateWarnings() {
        dispatch({ type: 'clearWarnings' });
      },
      openMiniCart() {
        dispatch({ type: 'openMiniCart' });
      },
      closeMiniCart() {
        dispatch({ type: 'closeMiniCart' });
      },
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
