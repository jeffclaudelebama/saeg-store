import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { normalizeGabonPhone } from '@/lib/phone';

const SESSION_COOKIE_NAME = 'agropag_account_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

type SessionPayload = {
  phone: string;
  exp: number;
};

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getSessionSecret(): string {
  const secret = env.accountSessionSecret.trim();
  if (!secret) {
    throw new Error('AGROPAG_ACCOUNT_SESSION_SECRET manquant');
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function serialize(payload: SessionPayload): string {
  const encoded = toBase64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function parse(raw: string): SessionPayload | null {
  const [encoded, signature] = raw.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as SessionPayload;
    const phone = normalizeGabonPhone(parsed?.phone || '');
    const exp = Number(parsed?.exp || 0);
    if (!phone || !exp || exp <= Date.now()) {
      return null;
    }
    return { phone, exp };
  } catch {
    return null;
  }
}

export async function getAccountSession() {
  const store = cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  return raw ? parse(raw) : null;
}

export async function createAccountSession(phone: string) {
  const normalized = normalizeGabonPhone(phone);
  if (!normalized) {
    throw new Error('Téléphone invalide');
  }

  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const store = cookies();
  store.set(SESSION_COOKIE_NAME, serialize({ phone: normalized, exp }), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAccountSession() {
  const store = cookies();
  store.delete(SESSION_COOKIE_NAME);
}
