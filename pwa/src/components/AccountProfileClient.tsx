'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAccountSession, loadAccountSession, saveAccountSession } from '@/lib/account-session';
import { loadAccountProfile, saveAccountProfile, type SaegAccountProfile } from '@/lib/account-profile';
import { normalizeGabonPhone } from '@/lib/phone';
import type { SaegCommune } from '@/types/saeg';

const COMMUNES: SaegCommune[] = ['Libreville', 'Akanda', 'Owendo'];

type FormState = SaegAccountProfile;

export function AccountProfileClient() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    phone: '',
    first_name: '',
    last_name: '',
    email: '',
    address_1: '',
    address_2: '',
    city: 'Libreville',
  });

  useEffect(() => {
    const session = loadAccountSession();
    if (!session?.phone) {
      router.replace('/compte');
      return;
    }
    const profile = loadAccountProfile();
    setForm({
      phone: profile?.phone || session.phone,
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      address_1: profile?.address_1 || '',
      address_2: profile?.address_2 || '',
      city: profile?.city || 'Libreville',
    });
    setReady(true);
  }, [router]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedPhone = normalizeGabonPhone(form.phone);
    if (!normalizedPhone) {
      setError('Numéro invalide. Formats acceptés: 077..., 06..., 241..., +241...');
      return;
    }

    setSaving(true);
    const payload: SaegAccountProfile = {
      phone: normalizedPhone,
      first_name: (form.first_name || '').trim(),
      last_name: (form.last_name || '').trim(),
      email: (form.email || '').trim(),
      address_1: (form.address_1 || '').trim(),
      address_2: (form.address_2 || '').trim(),
      city: form.city || 'Libreville',
    };
    saveAccountProfile(payload);
    saveAccountSession(normalizedPhone);
    setForm(payload);
    setSaving(false);
    setSuccess('Profil enregistré.');
  }

  function onLogout() {
    clearAccountSession();
    router.push('/compte');
  }

  if (!ready) {
    return <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">Chargement du profil...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <h2 className="text-xl font-black text-primary">Mon profil</h2>
        <p className="mt-2 text-sm text-slate-600">Ces informations sont stockées localement pour accélérer votre checkout.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Prénom</span>
            <input
              className="w-full rounded-lg border-slate-200"
              value={form.first_name || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, first_name: event.target.value }))}
              placeholder="Ex: Jean"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Nom</span>
            <input
              className="w-full rounded-lg border-slate-200"
              value={form.last_name || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, last_name: event.target.value }))}
              placeholder="Ex: Mbadinga"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Téléphone</span>
            <input
              className="w-full rounded-lg border-slate-200"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Ex: 077 63 88 64"
              required
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              className="w-full rounded-lg border-slate-200"
              value={form.email || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="vous@email.com"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Quartier / Adresse</span>
            <input
              className="w-full rounded-lg border-slate-200"
              value={form.address_1 || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, address_1: event.target.value }))}
              placeholder="Ex: Charbonnages, derrière ..."
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Complément adresse</span>
            <input
              className="w-full rounded-lg border-slate-200"
              value={form.address_2 || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, address_2: event.target.value }))}
              placeholder="Immeuble, étage, repère"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Commune</span>
            <select
              className="w-full rounded-lg border-slate-200"
              value={form.city || 'Libreville'}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value as SaegCommune }))}
            >
              {COMMUNES.map((commune) => (
                <option key={commune} value={commune}>
                  {commune}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
        {success ? <p className="mt-4 text-sm font-semibold text-green-700">{success}</p> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <Link href={`/compte/commandes?phone=${encodeURIComponent(form.phone)}`} className="btn btn-ghost w-full sm:w-auto text-center">
            Voir mes commandes
          </Link>
          <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={onLogout}>
            Se déconnecter
          </button>
        </div>
      </form>
    </div>
  );
}
