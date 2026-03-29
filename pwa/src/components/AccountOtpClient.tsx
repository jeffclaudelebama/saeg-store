'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalizeGabonPhone } from '@/lib/phone';
import { OTPInput } from '@/components/OTPInput';

export function AccountOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const maskedPhone = useMemo(() => {
    if (!phone) {
      return '';
    }
    const tail = phone.slice(-4);
    return `241••••${tail}`;
  }, [phone]);

  useEffect(() => {
    const fromQuery = normalizeGabonPhone(String(searchParams.get('phone') || ''));
    if (!fromQuery) {
      router.replace('/compte');
      return;
    }
    setPhone(fromQuery);
  }, [router, searchParams]);

  async function submitCode() {
    setError(null);
    setSuccess(null);
    if (!phone) {
      setError('Numéro introuvable. Recommencez la connexion.');
      return;
    }
    if (code.length !== 6) {
      setError('Le code OTP doit contenir 6 chiffres.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/account/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Code OTP invalide.');
      }
      router.push('/compte/profil');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de vérifier le code.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    if (!phone) {
      return;
    }
    setError(null);
    setSuccess(null);
    setResending(true);
    try {
      const response = await fetch('/api/account/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Impossible de renvoyer le code OTP.');
      }
      setSuccess('Un nouveau code vient d’être envoyé.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de renvoyer le code OTP.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-black text-primary">Vérification OTP</h2>
      <p className="mt-2 text-sm text-slate-600">
        Saisissez le code reçu sur le numéro <strong className="text-slate-900">{maskedPhone || phone}</strong>.
      </p>

      <div className="mt-6">
        <OTPInput value={code} onChange={setCode} />
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
      {success ? <p className="mt-4 text-sm font-semibold text-green-700">{success}</p> : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn btn-primary w-full" disabled={submitting} onClick={submitCode}>
          {submitting ? 'Vérification...' : 'Valider le code'}
        </button>
        <button type="button" className="btn btn-ghost w-full" disabled={resending} onClick={resendCode}>
          {resending ? 'Renvoi...' : 'Renvoyer le code'}
        </button>
        <Link href="/compte" className="btn btn-ghost w-full text-center">
          Changer de numéro
        </Link>
      </div>
    </div>
  );
}
