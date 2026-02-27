'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { clampDecimal } from '@/lib/format';
import { trackEvent } from '@/lib/analytics';
import type { SaegCartItem, SaegProduct } from '@/types/saeg';

type CartAction =
  | { type: 'hydrate'; items: SaegCartItem[] }
  | { type: 'add'; product: SaegProduct; quantity: number }
  | { type: 'update'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

interface CartState {
  items: SaegCartItem[];
  hydrated: boolean;
}

interface CartContextValue extends CartState {
  itemCount: number;
  subtotal: number;
  addItem: (product: SaegProduct, quantity: number) => void;
  updateItemQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
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

function toCartItem(product: SaegProduct, quantity: number): SaegCartItem {
  return {
    key: makeKey(product.id),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] ?? null,
    unitType: product.unit_type,
    quantity: clampDecimal(quantity, 2),
    stepKg: product.step_kg || 0.25,
    minKg: product.min_kg || (product.unit_type === 'kg' ? 0.25 : 1),
    stockKg: product.stock_kg,
    unitPrice: productUnitPrice(product),
    pricePerKg: product.price_per_kg || productUnitPrice(product),
    currency: product.currency,
    currencySymbol: product.currency_symbol,
    categoryName: product.categories[0]?.name,
  };
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate':
      return { items: action.items, hydrated: true };
    case 'add': {
      const key = makeKey(action.product.id);
      const existing = state.items.find((i) => i.key === key);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: clampDecimal(i.quantity + action.quantity, 2) } : i
          ),
        };
      }
      return { ...state, items: [...state.items, toCartItem(action.product, action.quantity)] };
    }
    case 'update':
      return {
        ...state,
        items: state.items.map((i) => (i.key === action.key ? { ...i, quantity: clampDecimal(action.quantity, 2) } : i)).filter((i) => i.quantity > 0),
      };
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.key !== action.key) };
    case 'clear':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        dispatch({ type: 'hydrate', items: [] });
        return;
      }
      const parsed = JSON.parse(raw) as SaegCartItem[];
      dispatch({ type: 'hydrate', items: Array.isArray(parsed) ? parsed : [] });
    } catch {
      dispatch({ type: 'hydrate', items: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.hydrated, state.items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((acc, item) => acc + (item.unitType === 'kg' ? 1 : Math.round(item.quantity)), 0);
    const subtotal = state.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    return {
      ...state,
      itemCount,
      subtotal,
      addItem(product, quantity) {
        dispatch({ type: 'add', product, quantity });
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
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
