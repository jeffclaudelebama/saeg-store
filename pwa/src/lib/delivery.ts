import { DELIVERY_FEES } from '@/lib/constants';
import type { SaegCommune, SaegDeliveryMode } from '@/types/saeg';

export function getDeliveryFee(commune: SaegCommune, mode: SaegDeliveryMode): number {
  if (mode === 'pickup') return 0;
  return DELIVERY_FEES[commune];
}

export function getDeliveryLabel(commune: SaegCommune, mode: SaegDeliveryMode): string {
  return mode === 'pickup' ? 'Click & Collect' : `Livraison ${commune}`;
}
