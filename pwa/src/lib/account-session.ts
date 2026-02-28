import { normalizeGabonPhone } from '@/lib/phone';

const SESSION_STORAGE_KEY = 'saeg_account_session_v1';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SaegAccountSession = {
  phone: string;
  authenticatedAt: number;
};

export function loadAccountSession(): SaegAccountSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SaegAccountSession;
    const phone = normalizeGabonPhone(parsed?.phone || '');
    const authenticatedAt = Number(parsed?.authenticatedAt || 0);
    if (!phone || !authenticatedAt) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    if (Date.now() - authenticatedAt > SESSION_TTL_MS) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return {
      phone,
      authenticatedAt,
    };
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function saveAccountSession(phone: string): SaegAccountSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const normalized = normalizeGabonPhone(phone);
  if (!normalized) {
    return null;
  }

  const payload: SaegAccountSession = {
    phone: normalized,
    authenticatedAt: Date.now(),
  };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function clearAccountSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
