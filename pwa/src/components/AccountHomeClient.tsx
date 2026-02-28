'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAccountProfile, loadAccountProfile, saveAccountProfile, type SaegAccountProfile } from '@/lib/account-profile';
import { clearAccountSession, loadAccountSession, type SaegAccountSession } from '@/lib/account-session';
import { normalizeGabonPhone } from '@/lib/phone';

export function AccountHomeClient() {
  const router = useRouter();
  const [profile, setProfile] = useState<SaegAccountProfile | null>(null);
  const [session, setSession] = useState<SaegAccountSession | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedProfile = loadAccountProfile();
    const savedSession = loadAccountSession();
    setProfile(savedProfile);
    setSession(savedSession);
    setPhoneInput(savedProfile?.phone || '');
    if (!savedProfile?.phone && savedSession?.phone) {
      setPhoneInput(savedSession.phone);
    }
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const normalized = normalizeGabonPhone(phoneInput);
    if (!normalized) {
      setError('Numéro invalide. Formats acceptés: 077..., 06..., 241..., +241...');
      return;
    }
    saveAccountProfile({
      phone: normalized,
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      email: profile?.email,
      address_1: profile?.address_1,
      address_2: profile?.address_2,
      city: profile?.city,
    });
    router.push(`/compte/otp?phone=${encodeURIComponent(normalized)}`);
  }

  function onLogout() {
    clearAccountSession();
    setSession(null);
    setProfile(loadAccountProfile());
  }

  function onResetPhone() {
    clearAccountSession();
    clearAccountProfile();
    setSession(null);
    setProfile(null);
    setPhoneInput('');
    setError(null);
  }

  if (session?.phone) {
    const accountPhone = session?.phone || profile?.phone || '';
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <article className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Compte SAEG</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">Bienvenue</h2>
          <p className="mt-1 text-sm text-slate-600">
            Connecté avec le numéro <strong className="text-slate-900">{accountPhone}</strong>.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href="/compte/profil" className="btn btn-primary w-full">
              Mon profil
            </Link>
            <Link href={`/compte/commandes?phone=${encodeURIComponent(accountPhone)}`} className="btn btn-ghost w-full">
              Mes commandes
            </Link>
          </div>
        </article>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Se déconnecter
          </button>
          <button type="button" className="btn btn-ghost" onClick={onResetPhone}>
            Utiliser un autre numéro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-black text-primary">Connexion par téléphone</h2>
      <p className="mt-2 text-sm text-slate-600">Entrez votre numéro, puis validez le code OTP pour accéder à votre compte.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">Téléphone</span>
          <input
            className="w-full rounded-lg border-slate-200"
            value={phoneInput}
            onChange={(event) => setPhoneInput(event.target.value)}
            placeholder="Ex: 077 63 88 64"
            required
          />
        </label>
        <button className="btn btn-primary w-full" type="submit">
          Recevoir mon code
        </button>
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
