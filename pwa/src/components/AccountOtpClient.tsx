'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadAccountProfile, saveAccountProfile } from '@/lib/account-profile';
import { saveAccountSession } from '@/lib/account-session';
import { normalizeGabonPhone } from '@/lib/phone';
import { OTPInput } from '@/components/OTPInput';

const TEST_OTP_CODE = '123456';

export function AccountOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const maskedPhone = useMemo(() => {
    if (!phone) {
      return '';
    }
    const tail = phone.slice(-4);
    return `241••••${tail}`;
  }, [phone]);

  useEffect(() => {
    const fromQuery = normalizeGabonPhone(String(searchParams.get('phone') || ''));
    const fromProfile = normalizeGabonPhone(loadAccountProfile()?.phone || '');
    const normalized = fromQuery || fromProfile;
    if (normalized) {
      setPhone(normalized);
      return;
    }
    router.replace('/compte');
  }, [router, searchParams]);

  function submitCode() {
    setError(null);
    if (!phone) {
      setError('Numéro introuvable. Recommencez la connexion.');
      return;
    }
    if (code.length !== 6) {
      setError('Le code OTP doit contenir 6 chiffres.');
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      if (code !== TEST_OTP_CODE) {
        setError('Code invalide. Utilisez le code de test 123456.');
        setSubmitting(false);
        return;
      }

      const profile = loadAccountProfile();
      saveAccountProfile({
        phone,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        email: profile?.email,
        address_1: profile?.address_1,
        address_2: profile?.address_2,
        city: profile?.city,
      });
      saveAccountSession(phone);
      router.push('/compte/profil');
    }, 300);
  }

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-black text-primary">Vérification OTP</h2>
      <p className="mt-2 text-sm text-slate-600">
        Saisissez le code reçu sur le numéro <strong className="text-slate-900">{maskedPhone || phone}</strong>.
      </p>
      <p className="mt-1 text-xs text-slate-500">Mode test (phase 1): utilisez le code 123456.</p>

      <div className="mt-6">
        <OTPInput value={code} onChange={setCode} />
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn btn-primary w-full" disabled={submitting} onClick={submitCode}>
          {submitting ? 'Vérification...' : 'Valider le code'}
        </button>
        <Link href="/compte" className="btn btn-ghost w-full text-center">
          Changer de numéro
        </Link>
      </div>
    </div>
  );
}
