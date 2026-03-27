'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadAccountProfile, saveAccountProfile } from '@/lib/account-profile';
import { normalizeGabonPhone } from '@/lib/phone';

export function AccountLookupClient() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const profile = loadAccountProfile();
    if (profile?.phone) {
      setPhone(profile.phone);
    }
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const normalized = normalizeGabonPhone(phone);
    if (!normalized) {
      setError('Numéro invalide. Formats acceptés: 077..., 06..., 241..., +241...');
      return;
    }

    setLoading(true);
    saveAccountProfile({ phone: normalized });
    router.push(`/compte/commandes?phone=${encodeURIComponent(normalized)}`);
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-black text-primary">Espace Compte</h2>
      <p className="mt-2 text-sm text-slate-600">Entrez votre numéro pour retrouver vos commandes AGROPAG.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">Téléphone</span>
          <input
            className="w-full rounded-lg border-slate-200"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Ex: 077 63 88 64"
            required
          />
        </label>
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Chargement...' : 'Accéder à mes commandes'}
        </button>
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
