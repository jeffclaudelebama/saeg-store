'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { formatLibrevilleDate } from '@/lib/format';
import type { SaegTrackingResponse } from '@/types/saeg';

export function TrackingPageClient() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SaegTrackingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/tracking?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
      const data = (await res.json()) as SaegTrackingResponse;
      if (!res.ok || !data.found) {
        throw new Error(data.message || 'Commande introuvable');
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suivi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-black text-primary">Suivre ma commande</h2>
        <p className="text-sm text-slate-600">Saisissez votre numéro de commande et votre téléphone pour voir l’état d’avancement.</p>
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Numéro de commande</span>
          <input className="w-full rounded-lg border-slate-200" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Ex: 1024" required />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-semibold">Téléphone</span>
          <input className="w-full rounded-lg border-slate-200" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 077000000" required />
        </label>
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Recherche...' : 'Voir le statut'}</button>
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {!result ? (
          <div className="h-full min-h-[240px] flex items-center justify-center text-center text-slate-500">
            <div>
              <p className="text-sm font-semibold">Statuts</p>
              <p className="mt-2 text-xs">Reçue → Préparation → En route → Livrée</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Commande</p>
              <h3 className="text-2xl font-black text-slate-900">#{result.orderNumber}</h3>
              <p className="text-sm text-slate-500">{result.customerName || 'Client SAEG'} • {result.customerPhone}</p>
              {result.createdAt ? <p className="text-xs text-slate-400 mt-1">Créée le {formatLibrevilleDate(result.createdAt)}</p> : null}
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Statut actuel</p>
              <p className="text-lg font-black text-primary">{result.statusLabel}</p>
            </div>
            <ol className="space-y-3">
              {result.timeline?.map((step) => (
                <li key={step.code} className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${step.done ? 'border-primary/20 bg-primary/5' : 'border-slate-200 bg-white'}`}>
                  <span className={`material-symbols-outlined ${step.done ? 'text-primary' : 'text-slate-300'}`}>{step.done ? 'check_circle' : 'radio_button_unchecked'}</span>
                  <span className={`font-semibold ${step.done ? 'text-primary' : 'text-slate-500'}`}>{step.label}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
