import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/lib/mock-data';
import { env } from '@/lib/env';
import { wooFetch, WooUnavailableError } from '@/lib/server/woo';
import type { SaegProduct, SaegCategory } from '@/types/saeg';

const PRODUCT_FALLBACK_IMAGE = '/og-default.png';
const PRODUCTION_MEDIA_HOSTS = new Set(['admin.store.saeggabon.ga', 'store.saeggabon.ga']);
const BLOCKED_PLACEHOLDER_HOSTS = new Set(['via.placeholder.com', 'placehold.co', 'dummyimage.com']);

export async function getProductsServer(params?: { search?: string; category?: string; dailyOnly?: boolean; page?: number; perPage?: number }): Promise<SaegProduct[]> {
  const search = params?.search ? `&search=${encodeURIComponent(params.search)}` : '';
  const category = params?.category ? `&category=${encodeURIComponent(params.category)}` : '';
  const dailyOnly = params?.dailyOnly ? '&daily_only=true' : '';
  const page = `&page=${params?.page ?? 1}`;
  const perPage = `&per_page=${params?.perPage ?? 40}`;

  try {
    const data = await wooFetch<{ items: SaegProduct[] }>(`/wp-json/saeg/v1/products?${page.slice(1)}${perPage}${search}${category}${dailyOnly}`);
    return (data.items ?? []).map(normalizeProduct);
  } catch (error) {
    if (!(error instanceof WooUnavailableError)) {
      console.error('[SAEG] getProductsServer fallback:', error);
    }
    return filterMockProducts(MOCK_PRODUCTS, params).map(normalizeProduct);
  }
}

export async function getProductServer(id: number): Promise<SaegProduct | null> {
  try {
    const product = await wooFetch<SaegProduct>(`/wp-json/saeg/v1/products/${id}`);
    return normalizeProduct(product);
  } catch (error) {
    if (!(error instanceof WooUnavailableError)) {
      console.error('[SAEG] getProductServer fallback:', error);
    }
    const product = MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
    return product ? normalizeProduct(product) : null;
  }
}

export async function getCategoriesServer(): Promise<SaegCategory[]> {
  try {
    const categories = await wooFetch<Array<{ id: number; slug: string; name: string; count?: number }>>('/wp-json/wc/v3/products/categories?per_page=100');
    return categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name }));
  } catch (error) {
    if (!(error instanceof WooUnavailableError)) {
      console.error('[SAEG] getCategoriesServer fallback:', error);
    }
    return MOCK_CATEGORIES;
  }
}

function filterMockProducts(products: SaegProduct[], params?: { search?: string; category?: string; dailyOnly?: boolean }): SaegProduct[] {
  return products.filter((p) => {
    if (params?.dailyOnly && !p.is_daily_surplus) return false;
    if (params?.category && !p.categories.some((c) => c.slug === params.category || c.name.toLowerCase() === params.category?.toLowerCase())) return false;
    if (params?.search) {
      const q = params.search.toLowerCase();
      if (![p.name, p.short_description, p.description].join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function normalizeProduct(product: SaegProduct): SaegProduct {
  const images = (product.images ?? [])
    .map((image) => normalizeImageUrl(image))
    .filter((image): image is string => Boolean(image));

  return {
    ...product,
    images: images.length > 0 ? images : [PRODUCT_FALLBACK_IMAGE],
  };
}

function normalizeImageUrl(raw: string): string | null {
  const value = String(raw || '').trim();
  if (!value || value.startsWith('data:')) {
    return null;
  }

  if (value.startsWith('//')) {
    return normalizeAbsoluteImageUrl(`https:${value}`);
  }

  if (/^https?:\/\//i.test(value)) {
    return normalizeAbsoluteImageUrl(value);
  }

  const baseUrl = env.wpPublicUrl || env.siteUrl;
  try {
    const absolute = new URL(value.startsWith('/') ? value : `/${value}`, ensureTrailingSlash(baseUrl));
    return normalizeAbsoluteImageUrl(absolute.toString());
  } catch {
    return null;
  }
}

function normalizeAbsoluteImageUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (BLOCKED_PLACEHOLDER_HOSTS.has(parsed.hostname)) {
      return PRODUCT_FALLBACK_IMAGE;
    }
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (!isLocalHost && (env.siteUrl.startsWith('https://') || PRODUCTION_MEDIA_HOSTS.has(parsed.hostname)) && parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}
