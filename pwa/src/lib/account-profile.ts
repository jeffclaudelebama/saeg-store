import type { SaegCommune } from '@/types/saeg';

const PROFILE_STORAGE_KEY = 'saeg_account_profile_v1';
const PROFILE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SaegAccountProfile = {
  phone: string;
  first_name?: string;
  last_name?: string;
  address_1?: string;
  city?: SaegCommune;
};

export function loadAccountProfile(): SaegAccountProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { updatedAt?: number; profile?: SaegAccountProfile };
    if (!parsed?.updatedAt || !parsed.profile) {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      return null;
    }

    if (Date.now() - parsed.updatedAt > PROFILE_TTL_MS) {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      return null;
    }

    return parsed.profile;
  } catch {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  }
}

export function saveAccountProfile(profile: SaegAccountProfile): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = {
    updatedAt: Date.now(),
    profile,
  };
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
}

export function clearAccountProfile(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
}
