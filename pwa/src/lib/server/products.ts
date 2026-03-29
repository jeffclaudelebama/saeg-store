import { env, hasWooEnv } from '@/lib/env';
import { REVALIDATE_PRODUCTS_SECONDS, REVALIDATE_PRODUCT_SECONDS } from '@/lib/constants';
import { wooFetch, WooUnavailableError } from '@/lib/server/woo';
import type { SaegProduct, SaegCategory } from '@/types/saeg';

const PRODUCT_FALLBACK_IMAGE = '/img/placeholder-produit.png';
const PRODUCTION_MEDIA_HOSTS = new Set([
  'admin.agropag.ga',
  'boutique.agropag.ga',
]);
const BLOCKED_PLACEHOLDER_HOSTS = new Set(['via.placeholder.com', 'placehold.co', 'dummyimage.com']);
const WOO_PAGE_SIZE = 100;
const WOO_MAX_PAGE_GUARD = 20;

type WooMeta = { key?: string; value?: unknown };
type WooImage = { src?: string | null };
type WooTag = { id?: number; slug?: string; name?: string };
type WooCategory = { id: number; slug: string; name: string; count?: number };
type StoreApiImage = { src?: string | null };
type StoreApiCategory = {
  id: number;
  slug?: string;
  name?: string;
  image?: StoreApiImage | null;
};
type StoreApiPrices = {
  price?: string | null;
  regular_price?: string | null;
  sale_price?: string | null;
  currency_code?: string | null;
  currency_symbol?: string | null;
};
type StoreApiProduct = {
  id: number;
  slug?: string;
  name?: string;
  permalink?: string;
  description?: string | null;
  short_description?: string | null;
  prices?: StoreApiPrices | null;
  images?: WooImage[];
  categories?: WooCategory[];
  on_sale?: boolean;
  is_in_stock?: boolean;
};
type ProductQuery = {
  search?: string;
  category?: string;
  dailyOnly?: boolean;
  page?: number;
  perPage?: number;
  noCache?: boolean;
};
type WooProduct = {
  id: number;
  slug?: string;
  name?: string;
  permalink?: string;
  description?: string | null;
  short_description?: string | null;
  price?: string | null;
  regular_price?: string | null;
  sale_price?: string | null;
  stock_status?: string | null;
  stock_quantity?: number | null;
  status?: string;
  date_modified?: string | null;
  date_modified_gmt?: string | null;
  categories?: WooCategory[];
  images?: WooImage[];
  tags?: WooTag[];
  meta_data?: WooMeta[];
  saeg?: Record<string, unknown>;
};

export type ProductsResult = {
  items: SaegProduct[];
  total: number;
  page: number;
  perPage: number;
};

export async function getProductsServer(params?: ProductQuery): Promise<SaegProduct[]> {
  const result = await getProductsServerResult(params);
  return result.items;
}

export async function getProductsServerResult(params?: ProductQuery): Promise<ProductsResult> {
  const pageInput = typeof params?.page === 'number' && Number.isFinite(params.page) ? params.page : 1;
  const perPageInput = typeof params?.perPage === 'number' && Number.isFinite(params.perPage) ? params.perPage : 100;
  const page = Math.max(1, Math.floor(pageInput));
  const perPage = Math.max(1, Math.min(Math.floor(perPageInput), 500));

  try {
    const products = hasWooEnv()
      ? await fetchWooProducts({
          search: params?.search,
          category: params?.category,
          noCache: params?.noCache,
        })
      : await fetchStoreApiProducts({
          search: params?.search,
          category: params?.category,
          noCache: params?.noCache,
        });
    const mapped = products
      .map((product) => (hasWooEnv() ? mapWooProduct(product as WooProduct) : mapStoreApiProduct(product as StoreApiProduct)))
      .map(normalizeProduct);
    const filtered = mapped.filter((product) => {
      if (params?.dailyOnly && !product.is_daily_surplus) {
        return false;
      }
      if (params?.category) {
        const expected = normalizeText(params.category).toLowerCase();
        const hasCategory = product.categories.some((c) => c.slug.toLowerCase() === expected || c.name.toLowerCase() === expected);
        if (!hasCategory) {
          return false;
        }
      }
      if (params?.search) {
        const q = normalizeText(params.search).toLowerCase();
        const haystack = stripHtml([product.name, product.short_description, product.description].join(' ')).toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      return true;
    });
    const start = (page - 1) * perPage;
    return {
      items: filtered.slice(start, start + perPage),
      total: filtered.length,
      page,
      perPage,
    };
  } catch (error) {
    if (!(error instanceof WooUnavailableError)) {
      console.error('[AGROPAG] getProductsServer error:', error);
    }
    return {
      items: [],
      total: 0,
      page,
      perPage,
    };
  }
}

export async function getProductServer(identifier: number | string, options?: { noCache?: boolean }): Promise<SaegProduct | null> {
  const token = String(identifier ?? '').trim();
  if (!token) {
    return null;
  }

  if (!hasWooEnv()) {
    try {
      const products = await fetchStoreApiProducts({ identifier: token, noCache: options?.noCache, perPage: 1 });
      const product = products[0];
      return product ? normalizeProduct(mapStoreApiProduct(product)) : null;
    } catch (error) {
      console.error('[AGROPAG] getProductServer public fallback error:', error);
      return null;
    }
  }

  if (/^\d+$/.test(token)) {
    const id = Number(token);
    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }
    try {
      const product = await wooFetch<WooProduct>(`/wp-json/wc/v3/products/${id}`, getWooFetchInit(options?.noCache, REVALIDATE_PRODUCT_SECONDS));
      if (product.status && product.status !== 'publish') {
        return null;
      }
      return normalizeProduct(mapWooProduct(product));
    } catch (error) {
      if (!(error instanceof WooUnavailableError)) {
        console.error('[AGROPAG] getProductServer error:', error);
      }
      return null;
    }
  }

  try {
    const query = new URLSearchParams({
      slug: token,
      status: 'publish',
      per_page: '1',
    });
    const products = await wooFetch<WooProduct[]>(`/wp-json/wc/v3/products?${query.toString()}`, getWooFetchInit(options?.noCache, REVALIDATE_PRODUCT_SECONDS));
    const product = products[0];
    if (!product) {
      return null;
    }
    return normalizeProduct(mapWooProduct(product));
  } catch (error) {
    if (!(error instanceof WooUnavailableError)) {
      console.error('[AGROPAG] getProductServer by slug error:', error);
    }
    return null;
  }
}

export async function getCategoriesServer(options?: { noCache?: boolean }): Promise<SaegCategory[]> {
  try {
    const categories = await fetchStoreApiCategories(options?.noCache);
    return dedupeCategories(categories).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  } catch (error) {
    if (!(error instanceof WooUnavailableError)) {
      console.error('[AGROPAG] getCategoriesServer error:', error);
    }
    return [];
  }
}

async function fetchWooProducts(params?: { search?: string; category?: string; noCache?: boolean }): Promise<WooProduct[]> {
  const items: WooProduct[] = [];
  const search = normalizeText(params?.search);
  const categoryId = await resolveWooCategoryId(params?.category, params?.noCache);
  for (let page = 1; page <= WOO_MAX_PAGE_GUARD; page += 1) {
    const query = new URLSearchParams({
      status: 'publish',
      per_page: String(WOO_PAGE_SIZE),
      page: String(page),
    });
    if (search) {
      query.set('search', search);
    }
    if (typeof categoryId === 'number') {
      query.set('category', String(categoryId));
    }
    let batch: WooProduct[];
    try {
      batch = await wooFetch<WooProduct[]>(`/wp-json/wc/v3/products?${query.toString()}`, getWooFetchInit(params?.noCache, REVALIDATE_PRODUCTS_SECONDS));
    } catch (error) {
      if (isInvalidWooPageError(error)) {
        break;
      }
      throw error;
    }
    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }
    items.push(...batch);
    if (batch.length < WOO_PAGE_SIZE) {
      break;
    }
  }
  return items;
}

async function fetchStoreApiProducts(params?: {
  search?: string;
  category?: string;
  identifier?: string;
  noCache?: boolean;
  perPage?: number;
}): Promise<StoreApiProduct[]> {
  const query = new URLSearchParams({
    per_page: String(params?.perPage ?? WOO_PAGE_SIZE),
  });
  const search = normalizeText(params?.search);
  if (search) {
    query.set('search', search);
  }
  if (params?.identifier) {
    const identifier = normalizeText(params.identifier);
    if (/^\d+$/.test(identifier)) {
      query.set('include', identifier);
    } else {
      query.set('slug', identifier);
    }
  }
  const categoryId = await resolveStoreCategoryId(params?.category, params?.noCache);
  if (typeof categoryId === 'number') {
    query.set('category', String(categoryId));
  }

  const response = await fetch(`${ensureTrailingSlash(env.wpPublicUrl)}wp-json/wc/store/v1/products?${query.toString()}`, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 AGROPAG-Store/1.0',
    },
    ...(params?.noCache ? { cache: 'no-store' as const } : { next: { revalidate: REVALIDATE_PRODUCTS_SECONDS } }),
  });

  if (!response.ok) {
    throw new Error(`Store API products failed ${response.status}`);
  }

  return (await response.json()) as StoreApiProduct[];
}

async function fetchStoreApiCategories(noCache?: boolean): Promise<SaegCategory[]> {
  const response = await fetch(`${ensureTrailingSlash(env.wpPublicUrl)}wp-json/wc/store/v1/products/categories`, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 AGROPAG-Store/1.0',
    },
    ...(noCache ? { cache: 'no-store' as const } : { next: { revalidate: REVALIDATE_PRODUCT_SECONDS } }),
  });

  if (!response.ok) {
    throw new Error(`Store API categories failed ${response.status}`);
  }

  const categories = (await response.json()) as StoreApiCategory[];
  return categories.map((category) => ({
    id: Number(category.id),
    slug: normalizeText(category.slug),
    name: normalizeText(category.name),
    image: normalizeImageUrl(normalizeText(category.image?.src)),
  }));
}

async function resolveStoreCategoryId(category?: string, noCache?: boolean): Promise<number | null> {
  const value = normalizeText(category);
  if (!value) {
    return null;
  }
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  const categories = await fetchStoreApiCategories(noCache);
  const target = value.toLowerCase();
  const found = categories.find((item) => item.slug.toLowerCase() === target || item.name.toLowerCase() === target);
  return found ? found.id : null;
}

async function resolveWooCategoryId(category?: string, noCache?: boolean): Promise<number | null> {
  const value = normalizeText(category);
  if (!value) {
    return null;
  }
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  const target = value.toLowerCase();
  for (let page = 1; page <= WOO_MAX_PAGE_GUARD; page += 1) {
    const query = new URLSearchParams({
      per_page: String(WOO_PAGE_SIZE),
      page: String(page),
      hide_empty: 'false',
    });
    let batch: WooCategory[];
    try {
      batch = await wooFetch<WooCategory[]>(`/wp-json/wc/v3/products/categories?${query.toString()}`, getWooFetchInit(noCache, REVALIDATE_PRODUCT_SECONDS));
    } catch (error) {
      if (isInvalidWooPageError(error)) {
        return null;
      }
      throw error;
    }
    if (!Array.isArray(batch) || batch.length === 0) {
      return null;
    }
    const found = batch.find((item) => normalizeText(item.slug).toLowerCase() === target || normalizeText(item.name).toLowerCase() === target);
    if (found) {
      return Number(found.id);
    }
    if (batch.length < WOO_PAGE_SIZE) {
      return null;
    }
  }
  return null;
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

function mapWooProduct(product: WooProduct): SaegProduct {
  const saegMap = buildValueMap(asRecord(product.saeg));
  const metaMap = buildValueMap(fromMetaData(product.meta_data));
  const unitType = resolveUnitType(saegMap, metaMap);
  const regularPrice = toCurrencyNumber(product.regular_price);
  const salePrice = toCurrencyNumber(product.sale_price);
  const rawPrice = toCurrencyNumber(product.price);
  const fallbackPrice = salePrice || rawPrice || regularPrice;
  const stepKg = Math.max(0.01, toPositiveNumber(resolveValue(saegMap, metaMap, ['step_kg', 'saeg_step_kg']), unitType === 'kg' ? 0.25 : 1));
  const minKg = Math.max(stepKg, toPositiveNumber(resolveValue(saegMap, metaMap, ['min_kg', 'saeg_min_kg']), unitType === 'kg' ? stepKg : 1));
  const pluginPricePerKg = toCurrencyNumber(resolveValue(saegMap, metaMap, ['price_per_kg', 'saeg_price_per_kg']));
  const pricePerKg = unitType === 'kg' ? (pluginPricePerKg || fallbackPrice) : 0;
  const stockFromMeta = toNullableNumber(resolveValue(saegMap, metaMap, ['stock_kg', 'saeg_stock_kg']));
  const stockFromWoo = toNullableNumber(product.stock_quantity);
  const stockKg = unitType === 'kg' ? stockFromMeta ?? stockFromWoo : null;
  const lowStockThreshold = Math.max(0, toPositiveNumber(resolveValue(saegMap, metaMap, ['low_stock_threshold', 'saeg_low_stock_threshold']), 2));
  const stockStatus = normalizeText(product.stock_status) || 'instock';
  const lowStock = typeof stockKg === 'number' ? stockKg <= lowStockThreshold : false;
  const normalizedCategories: SaegCategory[] = dedupeCategories(
    (product.categories ?? []).map((category) => ({
      id: Number(category.id),
      slug: normalizeText(category.slug),
      name: normalizeText(category.name),
    })),
  );
  const images = mapWooImages(product.images);
  const isDailySurplus =
    toBoolean(resolveValue(saegMap, metaMap, ['is_daily_surplus', 'saeg_is_daily_surplus', 'daily_only', 'saeg_daily_only'])) ||
    hasDailyTag(product.tags);
  const description = sanitizeRichText(product.description);
  const shortDescription = sanitizeRichText(product.short_description);

  return {
    id: Number(product.id),
    slug: normalizeText(product.slug) || `produit-${product.id}`,
    name: normalizeText(product.name) || `Produit ${product.id}`,
    permalink: normalizeText(product.permalink),
    description,
    short_description: shortDescription,
    images,
    categories: normalizedCategories,
    currency: env.defaultCurrency || 'XAF',
    currency_symbol: 'FCFA',
    price: Math.round(fallbackPrice),
    regular_price: Math.round(regularPrice || fallbackPrice),
    sale_price: Math.round(salePrice),
    unit_type: unitType,
    price_per_kg: Math.round(pricePerKg),
    step_kg: unitType === 'kg' ? toFixedNumber(stepKg, 2) : 1,
    min_kg: unitType === 'kg' ? toFixedNumber(minKg, 2) : 1,
    stock_kg: unitType === 'kg' && typeof stockKg === 'number' ? toFixedNumber(stockKg, 2) : null,
    low_stock_threshold: toFixedNumber(lowStockThreshold, 2),
    low_stock: Boolean(lowStock),
    stock_status: stockStatus,
    is_daily_surplus: Boolean(isDailySurplus),
    origin: normalizeText(resolveValue(saegMap, metaMap, ['origin', 'saeg_origin'])) || 'AGROPAG',
    updated_at: normalizeText(product.date_modified_gmt ?? product.date_modified ?? '') || null,
  };
}

function mapStoreApiProduct(product: StoreApiProduct): SaegProduct {
  const prices = product.prices ?? {};
  const regularPrice = toCurrencyNumber(prices.regular_price);
  const salePrice = toCurrencyNumber(prices.sale_price);
  const rawPrice = toCurrencyNumber(prices.price);
  const fallbackPrice = salePrice || rawPrice || regularPrice;
  const normalizedCategories: SaegCategory[] = dedupeCategories(
    (product.categories ?? []).map((category) => ({
      id: Number(category.id),
      slug: normalizeText(category.slug),
      name: normalizeText(category.name),
    })),
  );

  return {
    id: Number(product.id),
    slug: normalizeText(product.slug) || `produit-${product.id}`,
    name: normalizeText(product.name) || `Produit ${product.id}`,
    permalink: normalizeText(product.permalink),
    description: sanitizeRichText(product.description),
    short_description: sanitizeRichText(product.short_description),
    images: mapWooImages(product.images),
    categories: normalizedCategories,
    currency: normalizeText(prices.currency_code) || env.defaultCurrency || 'XAF',
    currency_symbol: normalizeText(prices.currency_symbol) || 'FCFA',
    price: Math.round(fallbackPrice),
    regular_price: Math.round(regularPrice || fallbackPrice),
    sale_price: Math.round(salePrice),
    unit_type: 'unit',
    price_per_kg: 0,
    step_kg: 1,
    min_kg: 1,
    stock_kg: null,
    low_stock_threshold: 0,
    low_stock: false,
    stock_status: product.is_in_stock ? 'instock' : 'outofstock',
    is_daily_surplus: Boolean(product.on_sale),
    origin: 'AGROPAG',
    updated_at: null,
  };
}

function mapWooImages(images?: WooImage[]): string[] {
  const list = images ?? [];
  const primary = normalizeImageUrl(normalizeText(list[0]?.src)) ?? PRODUCT_FALLBACK_IMAGE;
  const rest = list
    .slice(1)
    .map((image) => normalizeImageUrl(normalizeText(image?.src)))
    .filter((image): image is string => Boolean(image));
  return [primary, ...rest];
}

function normalizeImageUrl(raw: string): string | null {
  const value = normalizeText(raw);
  if (!value || value.startsWith('data:')) {
    return null;
  }

  if (value.startsWith('/')) {
    if (isPublicAssetPath(value)) {
      return value;
    }
    const absolute = new URL(value, ensureTrailingSlash(env.wpPublicUrl));
    return normalizeAbsoluteImageUrl(absolute.toString());
  }

  if (value.startsWith('//')) {
    return normalizeAbsoluteImageUrl(`https:${value}`);
  }

  if (/^https?:\/\//i.test(value)) {
    return normalizeAbsoluteImageUrl(value);
  }

  const baseUrl = env.wpPublicUrl || env.siteUrl;
  try {
    const absolute = new URL(value, ensureTrailingSlash(baseUrl));
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
    if ((env.siteUrl.startsWith('https://') || PRODUCTION_MEDIA_HOSTS.has(parsed.hostname)) && parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function isPublicAssetPath(pathname: string): boolean {
  return pathname.startsWith('/img/') || pathname === '/og-default.png' || pathname.startsWith('/icons/');
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

function getWooFetchInit(noCache?: boolean, revalidate?: number): { revalidate?: number; cache?: RequestCache } {
  if (noCache) {
    return { cache: 'no-store' };
  }
  if (typeof revalidate === 'number') {
    return { revalidate };
  }
  return {};
}

function sanitizeRichText(value: unknown): string {
  const text = normalizeText(value);
  if (!text) {
    return '';
  }
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\sjavascript:/gi, '');
}

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.normalize('NFC').trim();
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function toCurrencyNumber(value: unknown): number {
  const parsed = toNullableNumber(value);
  return parsed ?? 0;
}

function toPositiveNumber(value: unknown, fallback: number): number {
  const parsed = toNullableNumber(value);
  return typeof parsed === 'number' && parsed >= 0 ? parsed : fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const compact = value
      .trim()
      .replace(/\s+/g, '')
      .replace(/,/g, '.')
      .replace(/[^0-9.\-]/g, '');
    if (!compact) {
      return null;
    }
    const parsed = Number(compact);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'yes', 'oui', 'on'].includes(normalized);
  }
  return false;
}

function toFixedNumber(value: number, precision = 2): number {
  return Number(value.toFixed(precision));
}

function resolveUnitType(saegMap: Map<string, unknown>, metaMap: Map<string, unknown>): 'kg' | 'unit' {
  const value = normalizeText(resolveValue(saegMap, metaMap, ['unit_type', 'saeg_unit_type', 'saeg_unit'])).toLowerCase();
  if (value === 'kg' || value === 'kilo' || value === 'kilogramme' || value === 'kilogram') {
    return 'kg';
  }
  return 'unit';
}

function resolveValue(saegMap: Map<string, unknown>, metaMap: Map<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (saegMap.has(normalized)) {
      const value = saegMap.get(normalized);
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }
    if (metaMap.has(normalized)) {
      const value = metaMap.get(normalized);
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }
  }
  return undefined;
}

function buildValueMap(record: Record<string, unknown>): Map<string, unknown> {
  const map = new Map<string, unknown>();
  for (const [key, value] of Object.entries(record)) {
    map.set(normalizeKey(key), value);
  }
  return map;
}

function fromMetaData(metaData?: WooMeta[]): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const meta of metaData ?? []) {
    const key = normalizeText(meta.key);
    if (!key) {
      continue;
    }
    record[key] = meta.value;
  }
  return record;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function hasDailyTag(tags?: WooTag[]): boolean {
  const values = (tags ?? [])
    .flatMap((tag) => [normalizeText(tag.slug), normalizeText(tag.name)])
    .map((value) => value.toLowerCase());
  return values.some((value) => value.includes('invendu') || value.includes('offre-du-jour') || value.includes('offre du jour'));
}

function isInvalidWooPageError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('rest_post_invalid_page_number') || message.includes('Invalid page number');
}

function dedupeCategories(categories: SaegCategory[]): SaegCategory[] {
  const byId = new Map<number, SaegCategory>();
  for (const category of categories) {
    if (!Number.isFinite(category.id) || category.id <= 0) {
      continue;
    }
    byId.set(category.id, category);
  }
  return [...byId.values()];
}
