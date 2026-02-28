import { NextRequest, NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number;
};

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 120;
const ORDERS_WINDOW_MS = 5 * 60_000;
const ORDERS_MAX_REQUESTS = 30;

declare global {
  // eslint-disable-next-line no-var
  var __saegApiRateLimitStore: Map<string, Bucket> | undefined;
}

function getStore(): Map<string, Bucket> {
  if (!globalThis.__saegApiRateLimitStore) {
    globalThis.__saegApiRateLimitStore = new Map<string, Bucket>();
  }
  return globalThis.__saegApiRateLimitStore;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.ip ?? 'unknown';
}

export function middleware(request: NextRequest) {
  const store = getStore();
  const now = Date.now();
  const ip = getClientIp(request);
  const pathname = request.nextUrl.pathname;
  const scope = pathname.startsWith('/api/orders') ? 'orders' : 'default';
  const windowMs = scope === 'orders' ? ORDERS_WINDOW_MS : DEFAULT_WINDOW_MS;
  const maxRequests = scope === 'orders' ? ORDERS_MAX_REQUESTS : DEFAULT_MAX_REQUESTS;
  const bucketKey = `${scope}:${ip}`;

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }

  const current = store.get(bucketKey);
  if (!current || current.resetAt <= now) {
    store.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return NextResponse.next();
  }

  if (current.count >= maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      {
        error: scope === 'orders' ? 'Trop de requêtes sur les commandes. Réessayez dans quelques minutes.' : 'Trop de requêtes. Veuillez réessayer.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
        },
      },
    );
  }

  current.count += 1;
  store.set(bucketKey, current);
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
