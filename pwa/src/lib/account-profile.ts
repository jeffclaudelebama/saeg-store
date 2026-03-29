import type { SaegCommune } from '@/types/saeg';

export type SaegAccountProfile = {
  phone: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  address_1?: string;
  address_2?: string;
  city?: SaegCommune;
};

export async function fetchAccountProfile(): Promise<SaegAccountProfile | null> {
  const response = await fetch('/api/account/profile', {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'Impossible de récupérer le profil.');
  }

  return (payload?.profile || null) as SaegAccountProfile | null;
}

export async function saveAccountProfile(profile: SaegAccountProfile): Promise<SaegAccountProfile> {
  const response = await fetch('/api/account/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
    credentials: 'include',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'Impossible d’enregistrer le profil.');
  }

  return payload.profile as SaegAccountProfile;
}

export async function clearAccountProfile(): Promise<void> {
  await fetch('/api/account/session', {
    method: 'DELETE',
    credentials: 'include',
  });
}
