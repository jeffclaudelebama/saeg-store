import { NextRequest, NextResponse } from 'next/server';
import { hasWooEnv } from '@/lib/env';
import { wooFetch } from '@/lib/server/woo';
import type { SaegTrackingResponse } from '@/types/saeg';

function mapStatus(status: string): NonNullable<SaegTrackingResponse['status']> {
  switch (status) {
    case 'completed':
      return 'livree';
    case 'processing':
      return 'preparation';
    case 'saeg_en_route':
      return 'en_route';
    default:
      return 'recue';
  }
}

function makeTimeline(status: NonNullable<SaegTrackingResponse['status']>) {
  const order = ['recue', 'preparation', 'en_route', 'livree'] as const;
  const labels: Record<(typeof order)[number], string> = {
    recue: 'Reçue',
    preparation: 'Préparation',
    en_route: 'En route',
    livree: 'Livrée',
  };
  const index = order.indexOf(status);
  return order.map((code, idx) => ({ code, label: labels[code], done: idx <= index }));
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D+/g, '');
  if (digits.startsWith('241')) return digits;
  return `241${digits}`;
}

export async function GET(request: NextRequest) {
  const orderNumber = (request.nextUrl.searchParams.get('orderNumber') ?? '').trim();
  const phone = (request.nextUrl.searchParams.get('phone') ?? '').trim();

  if (!orderNumber || !phone) {
    return NextResponse.json({ found: false, message: 'Téléphone et numéro de commande requis.' }, { status: 400 });
  }

  if (!hasWooEnv()) {
    const status: SaegTrackingResponse['status'] = 'preparation';
    return NextResponse.json({
      found: true,
      orderNumber,
      status,
      statusLabel: 'Préparation',
      createdAt: new Date().toISOString(),
      customerPhone: phone,
      customerName: 'Client AGROPAG',
      total: 12000,
      deliveryMode: 'delivery',
      commune: 'Libreville',
      timeline: makeTimeline(status),
    } satisfies SaegTrackingResponse);
  }

  try {
    const numericId = Number(orderNumber.replace(/\D+/g, ''));
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return NextResponse.json({ found: false, message: 'Numéro de commande invalide.' }, { status: 400 });
    }

    const order = await wooFetch<any>(`/wp-json/wc/v3/orders/${numericId}`, { cache: 'no-store' });
    const billingPhone = normalizePhone(order?.billing?.phone ?? '');
    const queryPhone = normalizePhone(phone);

    if (!billingPhone || billingPhone !== queryPhone) {
      return NextResponse.json({ found: false, message: 'Commande introuvable pour ce téléphone.' }, { status: 404 });
    }

    const status = mapStatus(order.status || 'pending');
    const statusLabels: Record<NonNullable<SaegTrackingResponse['status']>, string> = {
      recue: 'Reçue',
      preparation: 'Préparation',
      en_route: 'En route',
      livree: 'Livrée',
    };

    const response: SaegTrackingResponse = {
      found: true,
      orderNumber: String(order.number || order.id),
      status,
      statusLabel: statusLabels[status],
      createdAt: order.date_created,
      customerPhone: order.billing?.phone,
      customerName: [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' '),
      total: Number(order.total || 0),
      deliveryMode: ((order.meta_data ?? []).find((m: any) => m.key === 'saeg_mode_livraison')?.value ?? 'delivery') as any,
      commune: (order.meta_data ?? []).find((m: any) => m.key === 'saeg_commune')?.value ?? order.shipping?.city ?? '',
      timeline: makeTimeline(status),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[AGROPAG] tracking failed', error);
    return NextResponse.json({ found: false, message: 'Erreur de suivi.' }, { status: 502 });
  }
}
