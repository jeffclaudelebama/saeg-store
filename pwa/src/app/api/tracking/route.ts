import { NextRequest, NextResponse } from 'next/server';
import { hasWooEnv } from '@/lib/env';
import { getOrderMetaSummary, getOrderStatusView } from '@/lib/order-status';
import { wooFetch } from '@/lib/server/woo';
import type { SaegTrackingResponse } from '@/types/saeg';

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
    const statusView = getOrderStatusView({ status: 'processing', paymentMethod: 'cash' });
    return NextResponse.json({
      found: true,
      orderNumber,
      status: statusView.code,
      statusLabel: statusView.label,
      createdAt: new Date().toISOString(),
      customerPhone: phone,
      customerName: 'Client AGROPAG',
      total: 12000,
      deliveryMode: 'delivery',
      commune: 'Libreville',
      timeline: statusView.timeline,
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

    const meta = getOrderMetaSummary(order.meta_data);
    const statusView = getOrderStatusView({
      status: order.status || 'pending',
      paymentMethod: meta.paymentMethod,
      mobileMoneyStatus: meta.mobileMoneyStatus,
    });

    const response: SaegTrackingResponse = {
      found: true,
      orderNumber: String(order.number || order.id),
      status: statusView.code,
      statusLabel: statusView.label,
      createdAt: order.date_created,
      customerPhone: order.billing?.phone,
      customerName: [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' '),
      total: Number(order.total || 0),
      deliveryMode: ((order.meta_data ?? []).find((m: any) => m.key === 'saeg_mode_livraison')?.value ?? 'delivery') as any,
      commune: (order.meta_data ?? []).find((m: any) => m.key === 'saeg_commune')?.value ?? order.shipping?.city ?? '',
      timeline: statusView.timeline,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[AGROPAG] tracking failed', error);
    return NextResponse.json({ found: false, message: 'Erreur de suivi.' }, { status: 502 });
  }
}
