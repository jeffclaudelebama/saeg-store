import { stripHtml } from '@/lib/format';
import type { SaegProduct } from '@/types/saeg';

export function normalizeSearchTerm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .trim();
}

export function matchProductSearch(product: SaegProduct, query: string): boolean {
  const q = normalizeSearchTerm(query);
  if (!q) {
    return true;
  }

  const text = [
    product.name,
    product.short_description,
    product.description,
    ...(product.categories ?? []).map((category) => category.name),
  ]
    .map((value) => stripHtml(value || ''))
    .join(' ');

  return normalizeSearchTerm(text).includes(q);
}
