'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/providers/CartProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
