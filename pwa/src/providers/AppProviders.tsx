'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/providers/CartProvider';
import { MiniCart } from '@/components/MiniCart';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <MiniCart />
    </CartProvider>
  );
}
