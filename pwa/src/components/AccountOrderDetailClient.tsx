'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loadAccountProfile } from '@/lib/account-profile';
import { loadAccountSession } from '@/lib/account-session';
import { formatCurrency, formatLibrevilleDate } from '@/lib/format';
import { normalizeGabonPhone } from '@/lib/phone';
import type { SaegOrderListItem, SaegOrdersResponse } from '@/types/saeg';

export function AccountOrderDetailClient({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const phoneFromQuery = useMemo(() => String(searchParams.get('phone') || '').trim(), [searchParams]);
  const phoneFromProfile = useMemo(() => loadAccountProfile()?.phone || '', []);
  const phoneFromSession = useMemo(() => loadAccountSession()?.phone || '', []);
  const [item, setItem] = useState<SaegOrderListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedPhone =
      normalizeGabonPhone(phoneFromQuery) ||
      normalizeGabonPhone(phoneFromProfile) ||
      normalizeGabonPhone(phoneFromSession);
    if (!normalizedPhone) {
      setError('Téléphone invalide.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`/api/orders?phone=${encodeURIComponent(normalizedPhone)}&id=${encodeURIComponent(orderId)}`, { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json()) as SaegOrdersResponse & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || 'Commande introuvable.');
        }
        setItem(payload.items[0] || null);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'Erreur de chargement.');
      })
      .finally(() => setLoading(false));
  }, [orderId, phoneFromProfile, phoneFromQuery, phoneFromSession]);

  if (loading) {
    return <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">Chargement du détail commande...</div>;
  }

  if (error || !item) {
    const fallbackPhone = phoneFromQuery || phoneFromProfile || phoneFromSession;
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">{error || 'Commande introuvable.'}</p>
        </div>
        <Link href={`/compte/commandes?phone=${encodeURIComponent(fallbackPhone)}`} className="btn btn-ghost">Retour commandes</Link>
      </div>
    );
  }

  const fallbackPhone = phoneFromQuery || phoneFromProfile || phoneFromSession;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Commande</p>
          <h1 className="text-2xl font-black text-slate-900">#{item.number}</h1>
          <p className="text-sm text-slate-500">{item.date_created ? formatLibrevilleDate(item.date_created) : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-xl font-black text-primary">{formatCurrency(item.total, item.currency)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Statut</p>
        <p className="text-sm font-semibold text-primary mt-1">{item.status_label || item.status}</p>
        {item.payment_method === 'mobile_money' ? (
          <p className="mt-2 text-xs text-slate-500">
            Mobile Money
            {item.payment_reference ? ` • Réf. ${item.payment_reference}` : ''}
            {item.payment_proof_uploaded ? ' • preuve reçue' : ' • preuve en attente'}
          </p>
        ) : null}
      </div>

      <div>
        <p className="text-sm font-bold text-slate-900 mb-2">Articles</p>
        <ul className="space-y-2">
          {item.line_items.map((line, index) => (
            <li key={`${line.product_id}-${index}`} className="flex justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <span>{line.name} × {line.quantity}</span>
              <span className="font-semibold">{line.total} FCFA</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Link href={`/compte/commandes?phone=${encodeURIComponent(fallbackPhone)}`} className="btn btn-ghost">Retour commandes</Link>
        <Link href="/catalogue" className="btn btn-primary">Retour boutique</Link>
      </div>
    </div>
  );
}
