'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loadAccountProfile, saveAccountProfile } from '@/lib/account-profile';
import { formatCurrency, formatLibrevilleDate } from '@/lib/format';
import { normalizeGabonPhone } from '@/lib/phone';
import type { SaegOrderListItem, SaegOrdersResponse } from '@/types/saeg';

function labelStatus(status: string): string {
  switch (status) {
    case 'completed':
      return 'Livrée';
    case 'processing':
      return 'Préparation';
    case 'on-hold':
      return 'En attente';
    case 'pending':
      return 'Reçue';
    default:
      return status;
  }
}

export function AccountOrdersClient() {
  const searchParams = useSearchParams();
  const phoneFromQuery = useMemo(() => String(searchParams.get('phone') || '').trim(), [searchParams]);
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState<SaegOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profile = loadAccountProfile();
    const preferred = phoneFromQuery || profile?.phone || '';
    const normalized = normalizeGabonPhone(preferred);
    if (!normalized) {
      setLoading(false);
      setError('Téléphone invalide. Retournez à la page Compte.');
      return;
    }

    setPhone(normalized);
    saveAccountProfile({
      phone: normalized,
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      address_1: profile?.address_1,
      city: profile?.city,
    });

    setLoading(true);
    setError(null);
    fetch(`/api/orders?phone=${encodeURIComponent(normalized)}`, { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json()) as SaegOrdersResponse & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || 'Impossible de charger les commandes.');
        }
        setItems(Array.isArray(payload.items) ? payload.items : []);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'Erreur de chargement.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [phoneFromQuery]);

  if (loading) {
    return <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">Chargement de vos commandes...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
        <Link href="/compte" className="btn btn-ghost">Retour compte</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">Aucune commande trouvée pour {phone}.</p>
          <p className="mt-1 text-xs text-slate-500">Vérifiez le numéro ou passez une commande depuis la boutique.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/compte" className="btn btn-ghost">Changer de numéro</Link>
          <Link href="/catalogue" className="btn btn-primary">Retour boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Numéro associé: <strong className="text-slate-900">{phone}</strong>
      </div>
      {items.map((order) => (
        <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Commande</p>
              <h3 className="text-xl font-black text-slate-900">#{order.number}</h3>
              <p className="text-xs text-slate-500">{order.date_created ? formatLibrevilleDate(order.date_created) : ''}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Statut</p>
              <p className="text-sm font-bold text-primary">{labelStatus(order.status)}</p>
              <p className="text-sm font-black text-slate-900">{formatCurrency(order.total, order.currency)}</p>
            </div>
          </div>

          <ul className="space-y-1 text-sm text-slate-600">
            {order.line_items.slice(0, 3).map((line, index) => (
              <li key={`${line.product_id}-${index}`}>• {line.name} × {line.quantity}</li>
            ))}
          </ul>

          <Link href={`/compte/commandes/${order.id}?phone=${encodeURIComponent(phone)}`} className="btn btn-ghost w-full">
            Voir le détail
          </Link>
        </article>
      ))}
    </div>
  );
}
