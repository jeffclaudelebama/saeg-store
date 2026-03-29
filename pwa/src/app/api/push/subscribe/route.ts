import { NextResponse } from 'next/server';
import { hasWooEnv } from '@/lib/env';
import { normalizeGabonPhone } from '@/lib/phone';
import { wooFetch } from '@/lib/server/woo';

type PushSubscriptionPayload = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    auth?: string;
    p256dh?: string;
  };
};

function metaValue(meta: Array<{ key?: string; value?: unknown }> | undefined, key: string): string {
  const entry = (meta || []).find((item) => item?.key === key);
  return typeof entry?.value === 'string' ? entry.value : '';
}

function parseSubscriptions(raw: string): PushSubscriptionPayload[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as PushSubscriptionPayload[];
    return Array.isArray(parsed) ? parsed.filter((entry) => entry?.endpoint && entry?.keys?.auth && entry?.keys?.p256dh) : [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  if (!hasWooEnv()) {
    return NextResponse.json({ error: 'WooCommerce indisponible.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    orderId?: number | string;
    phone?: string;
    subscription?: PushSubscriptionPayload;
  } | null;

  const orderId = Number(body?.orderId);
  const phone = normalizeGabonPhone(String(body?.phone || ''));
  const subscription = body?.subscription;

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json({ error: 'Commande invalide.' }, { status: 422 });
  }
  if (!phone) {
    return NextResponse.json({ error: 'Téléphone invalide.' }, { status: 422 });
  }
  if (!subscription?.endpoint || !subscription?.keys?.auth || !subscription?.keys?.p256dh) {
    return NextResponse.json({ error: 'Abonnement push invalide.' }, { status: 422 });
  }

  try {
    const order = await wooFetch<{
      billing?: { phone?: string };
      meta_data?: Array<{ key?: string; value?: unknown }>;
    }>(`/wp-json/wc/v3/orders/${orderId}`, { cache: 'no-store' });

    const billingPhone = normalizeGabonPhone(String(order.billing?.phone || ''));
    if (!billingPhone || billingPhone !== phone) {
      return NextResponse.json({ error: 'Commande introuvable pour ce téléphone.' }, { status: 404 });
    }

    const existingRaw = metaValue(order.meta_data, 'saeg_push_subscriptions');
    const subscriptions = parseSubscriptions(existingRaw).filter((entry) => entry.endpoint !== subscription.endpoint);
    subscriptions.push(subscription);

    await wooFetch(`/wp-json/wc/v3/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({
        meta_data: [
          { key: 'saeg_push_subscriptions', value: JSON.stringify(subscriptions) },
        ],
      }),
    });

    return NextResponse.json({ ok: true, count: subscriptions.length });
  } catch (error) {
    console.error('[AGROPAG] push subscribe failed', error);
    return NextResponse.json({ error: 'Impossible d’activer les notifications.', details: String(error) }, { status: 502 });
  }
}
