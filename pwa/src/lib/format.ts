import { CURRENCY_CODE, TIMEZONE } from '@/lib/constants';

export function formatCurrency(amount: number, currency = CURRENCY_CODE): string {
  return new Intl.NumberFormat('fr-GA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatKg(value: number): string {
  const fixed = Number(value).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  return fixed.replace('.', ',') + ' kg';
}

export function formatQty(value: number, unitType: 'kg' | 'unit'): string {
  if (unitType === 'kg') return formatKg(value);
  return `${Math.round(value)} unité${Math.round(value) > 1 ? 's' : ''}`;
}

export function clampDecimal(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatLibrevilleDate(iso?: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-GA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: TIMEZONE,
  }).format(new Date(iso));
}

export function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
