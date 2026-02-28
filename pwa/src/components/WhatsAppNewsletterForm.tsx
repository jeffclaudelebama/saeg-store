'use client';

import { useState } from 'react';

function normalizeGabonPhone(value: string): string | null {
  const digits = value.replace(/\D+/g, '');
  if (!digits) {
    return null;
  }

  let local = '';
  if (digits.startsWith('241') && digits.length >= 11) {
    local = digits.slice(3, 11);
  } else if (digits.startsWith('0') && digits.length >= 9) {
    local = digits.slice(1, 9);
  } else if (digits.length === 8) {
    local = digits;
  }

  if (!/^\d{8}$/.test(local)) {
    return null;
  }

  return `241${local}`;
}

export function WhatsAppNewsletterForm() {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeGabonPhone(phone);
    if (!normalized) {
      setState('error');
      setMessage('Numéro invalide. Exemple: 077 63 88 64');
      return;
    }

    setState('loading');
    setMessage('');
    try {
      const res = await fetch('/api/leads/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Inscription impossible');
      }
      setState('success');
      setMessage('Merci, votre numéro WhatsApp est enregistré.');
      setPhone('');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Erreur d’inscription');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          type="tel"
          inputMode="tel"
          placeholder="Votre numéro WhatsApp"
          className="flex-1 rounded bg-white border-none px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary/30"
          aria-label="Numéro WhatsApp"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded bg-slate-900 text-white font-bold px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-60"
        >
          {state === 'loading' ? 'Envoi...' : "S'abonner"}
        </button>
      </div>
      {message ? (
        <p className={`text-xs ${state === 'success' ? 'text-emerald-200' : 'text-red-200'}`}>{message}</p>
      ) : null}
    </form>
  );
}
