export type SaegAccountSession = {
  phone: string;
  authenticatedAt?: number;
};

export async function loadAccountSession(): Promise<SaegAccountSession | null> {
  const response = await fetch('/api/account/profile', {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.profile?.phone) {
    throw new Error(payload?.error || 'Impossible de récupérer la session.');
  }

  return { phone: payload.profile.phone };
}

export async function saveAccountSession(): Promise<SaegAccountSession | null> {
  return loadAccountSession();
}

export async function clearAccountSession(): Promise<void> {
  await fetch('/api/account/session', {
    method: 'DELETE',
    credentials: 'include',
  });
}
