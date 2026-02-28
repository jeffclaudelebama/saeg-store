import { env, hasWooEnv } from '@/lib/env';
import { REVALIDATE_PRODUCTS_SECONDS } from '@/lib/constants';

function authHeader(): string {
  const token = Buffer.from(`${env.wcKey}:${env.wcSecret}`).toString('base64');
  return `Basic ${token}`;
}

function baseUrl(): string {
  return env.wcBaseUrl.replace(/\/$/, '');
}

export class WooUnavailableError extends Error {
  constructor(message = 'WooCommerce indisponible') {
    super(message);
    this.name = 'WooUnavailableError';
  }
}

export async function wooFetch<T>(path: string, init: RequestInit & { revalidate?: number } = {}): Promise<T> {
  if (!hasWooEnv()) {
    throw new WooUnavailableError('Variables WooCommerce manquantes');
  }

  const { revalidate = REVALIDATE_PRODUCTS_SECONDS, headers, cache: requestedCache, ...rest } = init;
  const isFormDataBody = typeof FormData !== 'undefined' && rest.body instanceof FormData;
  const method = String(rest.method ?? 'GET').toUpperCase();
  const isWriteMethod = method !== 'GET' && method !== 'HEAD';
  const baseOptions = {
    ...rest,
    headers: {
      Authorization: authHeader(),
      ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  };

  const res = await fetch(`${baseUrl()}${path}`, {
    ...baseOptions,
    ...(requestedCache === 'no-store' || isWriteMethod || revalidate === 0
      ? { cache: 'no-store' as const }
      : { next: { revalidate } }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Woo fetch failed ${res.status}: ${body.slice(0, 300)}`);
  }

  return res.json() as Promise<T>;
}
