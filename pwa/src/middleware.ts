import { NextRequest, NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;

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

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }

  const current = store.get(ip);
  if (!current || current.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      {
        error: 'Trop de requêtes. Veuillez réessayer.',
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
  store.set(ip, current);
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
