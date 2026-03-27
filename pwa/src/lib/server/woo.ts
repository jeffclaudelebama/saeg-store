import { env, hasWooEnv } from '@/lib/env';
import { REVALIDATE_PRODUCTS_SECONDS } from '@/lib/constants';

const AGROPAG_BACKEND_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 AGROPAG-Server/1.0';

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

export function createBackendHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, text/plain, */*');
  }
  if (!headers.has('User-Agent')) {
    headers.set('User-Agent', AGROPAG_BACKEND_USER_AGENT);
  }
  return headers;
}

export async function wooFetch<T>(path: string, init: RequestInit & { revalidate?: number } = {}): Promise<T> {
  if (!hasWooEnv()) {
    throw new WooUnavailableError('Variables WooCommerce manquantes');
  }

  const { revalidate = REVALIDATE_PRODUCTS_SECONDS, headers, cache: requestedCache, ...rest } = init;
  const isFormDataBody = typeof FormData !== 'undefined' && rest.body instanceof FormData;
  const method = String(rest.method ?? 'GET').toUpperCase();
  const isWriteMethod = method !== 'GET' && method !== 'HEAD';
  const requestHeaders = createBackendHeaders({
    Authorization: authHeader(),
    ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
  });
  const baseOptions = {
    ...rest,
    headers: requestHeaders,
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
