import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { env } from '@/lib/env';

type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    auth: string;
    p256dh: string;
  };
};

type OrderStatusWebhookBody = {
  secret?: string;
  orderId?: number;
  orderNumber?: string;
  statusLabel?: string;
  customerName?: string;
  orderUrl?: string;
  subscriptions?: PushSubscriptionPayload[];
};

function isValidSubscription(entry: PushSubscriptionPayload | undefined): entry is PushSubscriptionPayload {
  return Boolean(entry?.endpoint && entry?.keys?.auth && entry?.keys?.p256dh);
}

export async function POST(request: Request) {
  if (!env.webPushPublicKey || !env.webPushPrivateKey) {
    return NextResponse.json({ error: 'Web Push non configuré.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as OrderStatusWebhookBody | null;
  const providedSecret = request.headers.get('x-agropag-webhook-secret') || body?.secret || '';
  if (env.pushWebhookSecret && providedSecret !== env.pushWebhookSecret) {
    return NextResponse.json({ error: 'Secret invalide.' }, { status: 401 });
  }

  const subscriptions = Array.isArray(body?.subscriptions) ? body.subscriptions.filter(isValidSubscription) : [];
  if (subscriptions.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  webpush.setVapidDetails(env.webPushSubject, env.webPushPublicKey, env.webPushPrivateKey);

  const title = `Commande #${body?.orderNumber || body?.orderId || ''}`;
  const payload = JSON.stringify({
    title,
    body: body?.statusLabel ? `Nouveau statut: ${body.statusLabel}` : 'Le statut de votre commande a changé.',
    url: body?.orderUrl || '/suivi',
    data: {
      orderId: body?.orderId,
      orderNumber: body?.orderNumber,
    },
  });

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(subscription, payload),
    ),
  );

  const sent = results.filter((result) => result.status === 'fulfilled').length;
  const failed = results.length - sent;

  return NextResponse.json({ ok: true, sent, failed });
}
